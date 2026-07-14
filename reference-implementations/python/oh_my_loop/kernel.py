"""A small, fail-closed runtime for trustworthy loops."""
from __future__ import annotations

from time import monotonic
from typing import Callable, Optional

from .gates import GateContext, GatePipeline, GateStage, default_gate_pipeline
from .models import (
    AutonomyMode,
    KernelResult,
    LoopContract,
    LoopStatus,
    RiskLevel,
    StepOutcome,
    StepProposal,
)


DecideFn = Callable[[LoopContract, dict], StepProposal]
ExecuteFn = Callable[[StepProposal, dict], StepOutcome]
HumanConfirmFn = Callable[[StepProposal, LoopContract], bool]
CancelFn = Callable[[], bool]


class LoopKernel:
    """Run decide -> gate -> execute -> verify with hard control limits.

    The kernel does not ask a model whether it is done.  Completion is a
    structured status and must pass the evidence gate.
    """

    def __init__(self, gates: Optional[GatePipeline] = None):
        self.gates = gates or default_gate_pipeline()

    def run(
        self,
        contract: LoopContract,
        decide_fn: DecideFn,
        execute_fn: ExecuteFn,
        *,
        human_confirm_fn: Optional[HumanConfirmFn] = None,
        cancel_fn: Optional[CancelFn] = None,
    ) -> KernelResult:
        if contract.risk.level == RiskLevel.CRITICAL or contract.risk.autonomy == AutonomyMode.CRISIS_SUPPORT:
            return KernelResult(
                LoopStatus.ESCALATED,
                reason="crisis-support tasks require immediate human or professional support",
            )

        errors = contract.validation_errors()
        if errors:
            return KernelResult(LoopStatus.FAILED, reason="; ".join(errors))

        started = monotonic()
        state = {"history": [], "cost_tokens": 0, "iteration": 0, "stagnant": 0}

        for iteration in range(1, contract.max_iterations + 1):
            terminal = self._control_stop(contract, state, started, cancel_fn)
            if terminal:
                terminal.history = state["history"]
                terminal.iterations = iteration - 1
                terminal.cost_tokens = state["cost_tokens"]
                return terminal

            state["iteration"] = iteration
            try:
                proposal = decide_fn(contract, state)
            except Exception as exc:
                return self._result(LoopStatus.FAILED, state, f"decision step failed: {exc}")
            if not isinstance(proposal, StepProposal):
                return self._result(LoopStatus.FAILED, state, "decide_fn must return StepProposal")

            state["cost_tokens"] += max(0, proposal.cost_tokens)
            terminal = self._control_stop(contract, state, started, cancel_fn)
            if terminal:
                terminal.history = state["history"]
                terminal.iterations = iteration
                terminal.cost_tokens = state["cost_tokens"]
                return terminal
            pre_results = self.gates.evaluate(
                GateStage.PRE_ACTION,
                GateContext(contract=contract, action=proposal.action),
            )
            failed = next((g for g in pre_results if not g.passed), None)
            if failed:
                status = LoopStatus.ESCALATED if contract.risk.requires_human else LoopStatus.BLOCKED
                return self._result(status, state, failed.reason)

            needs_human = any(g.requires_human for g in pre_results)
            if needs_human:
                if human_confirm_fn is None:
                    return self._result(
                        LoopStatus.ESCALATED,
                        state,
                        "human confirmation is required before this action",
                    )
                try:
                    confirmed = bool(human_confirm_fn(proposal, contract))
                except Exception as exc:
                    return self._result(LoopStatus.ESCALATED, state, f"confirmation failed: {exc}")
                if not confirmed:
                    return self._result(LoopStatus.CANCELLED, state, "action was not approved")

            terminal = self._control_stop(contract, state, started, cancel_fn)
            if terminal:
                terminal.history = state["history"]
                terminal.iterations = iteration
                terminal.cost_tokens = state["cost_tokens"]
                return terminal

            try:
                outcome = execute_fn(proposal, state)
            except Exception as exc:
                return self._result(LoopStatus.FAILED, state, f"execution failed: {exc}")
            if not isinstance(outcome, StepOutcome):
                return self._result(LoopStatus.FAILED, state, "execute_fn must return StepOutcome")

            state["cost_tokens"] += max(0, outcome.cost_tokens)
            event = {
                "iteration": iteration,
                "proposal": proposal,
                "outcome": outcome,
                "gates": pre_results,
            }
            state["history"].append(event)

            post_results = self.gates.evaluate(
                GateStage.POST_ACTION,
                GateContext(contract=contract, action=proposal.action, outcome=outcome),
            )
            event["post_gates"] = post_results
            failed = next((g for g in post_results if not g.passed), None)
            if failed:
                return self._result(LoopStatus.PARTIAL, state, failed.reason, output=outcome.output)

            if outcome.progress_delta <= 0:
                state["stagnant"] += 1
            else:
                state["stagnant"] = 0

            if outcome.status != LoopStatus.CONTINUE:
                return self._result(
                    outcome.status,
                    state,
                    outcome.reason,
                    output=outcome.output,
                    evidence=outcome.evidence,
                )

            if state["stagnant"] >= contract.max_stagnant_iterations:
                return self._result(
                    LoopStatus.BLOCKED,
                    state,
                    "loop stopped after repeated iterations without measurable progress",
                    output=outcome.output,
                )

        return self._result(
            LoopStatus.PARTIAL,
            state,
            f"maximum iterations ({contract.max_iterations}) reached",
            output=state["history"][-1]["outcome"].output if state["history"] else None,
        )

    @staticmethod
    def _control_stop(contract, state, started, cancel_fn):
        if cancel_fn is not None:
            try:
                if cancel_fn():
                    return KernelResult(LoopStatus.CANCELLED, reason="cancelled by caller")
            except Exception as exc:
                return KernelResult(LoopStatus.FAILED, reason=f"cancel check failed: {exc}")
        if contract.time_budget_seconds is not None:
            if monotonic() - started >= contract.time_budget_seconds:
                return KernelResult(LoopStatus.TIMED_OUT, reason="time budget exhausted")
        if contract.token_budget is not None and state["cost_tokens"] >= contract.token_budget:
            return KernelResult(LoopStatus.BUDGET_EXHAUSTED, reason="token budget exhausted")
        return None

    @staticmethod
    def _result(status, state, reason, output=None, evidence=()):
        return KernelResult(
            status=status,
            output=output,
            reason=reason,
            iterations=state["iteration"],
            cost_tokens=state["cost_tokens"],
            history=state["history"],
            evidence=tuple(evidence),
        )
