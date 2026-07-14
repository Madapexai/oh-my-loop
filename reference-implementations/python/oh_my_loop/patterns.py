"""Executable pattern skeletons with fail-closed termination.

The universal :mod:`oh_my_loop.kernel` is the preferred runtime.  These
classes remain small adapters for users who want a familiar pattern API.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from time import monotonic
from typing import Any, Callable, Optional

from .config import LoopConfig


@dataclass
class LoopResult:
    success: bool
    output: Any = None
    attempts: int = 0
    iterations: int = 0
    cost_tokens: int = 0
    failure_reason: Optional[str] = None
    history: list = field(default_factory=list)
    status: str = "completed"


def _cost(value: Any) -> int:
    if isinstance(value, dict):
        try:
            return max(0, int(value.get("cost_tokens", 0)))
        except (TypeError, ValueError):
            return 0
    return 0


def _timed_out(config: LoopConfig, started: float) -> bool:
    return config.time_budget_seconds is not None and monotonic() - started >= config.time_budget_seconds


def _done_signal(thought: Any, action_result: Any) -> bool:
    if isinstance(action_result, dict) and action_result.get("status") == "completed":
        return True
    text = str(thought).strip().lower()
    return text == "done" or text.startswith("[done]") or text.startswith("i have the answer")


class Pattern(ABC):
    name: str = "base"

    def __init__(self, config: LoopConfig = None):
        self.config = config or LoopConfig()

    @abstractmethod
    def run(self, task: str, **kwargs) -> LoopResult:
        ...


class ReactPattern(Pattern):
    name = "react"

    def run(
        self,
        task: str,
        think_fn: Callable,
        act_fn: Callable,
        is_done_fn: Optional[Callable] = None,
        **kwargs,
    ) -> LoopResult:
        history, tokens, stagnant = [], 0, 0
        started = monotonic()
        for i in range(self.config.react_max_iterations):
            if _timed_out(self.config, started):
                return LoopResult(False, iterations=i, cost_tokens=tokens, history=history, status="timed_out", failure_reason="time budget exhausted")
            if self.config.budget_exhausted(tokens):
                return LoopResult(False, iterations=i, cost_tokens=tokens, history=history, status="budget_exhausted", failure_reason="token budget exhausted")
            try:
                thought = think_fn(task, history)
                action_result = act_fn(thought, history)
            except Exception as exc:
                return LoopResult(False, iterations=i, cost_tokens=tokens, history=history, status="failed", failure_reason=f"react step failed: {exc}")
            tokens += _cost(thought) + _cost(action_result)
            event = {"thought": thought, "action_result": action_result, "iteration": i + 1}
            history.append(event)

            try:
                done = bool(is_done_fn(task, thought, action_result, history)) if is_done_fn else _done_signal(thought, action_result)
            except Exception as exc:
                return LoopResult(False, output=action_result, iterations=i + 1, cost_tokens=tokens, history=history, status="failed", failure_reason=f"completion check failed: {exc}")
            if done:
                output = action_result.get("output") if isinstance(action_result, dict) and "output" in action_result else action_result
                return LoopResult(True, output=output, iterations=i + 1, cost_tokens=tokens, history=history)

            progress = action_result.get("progress_delta") if isinstance(action_result, dict) else None
            if progress is not None:
                stagnant = stagnant + 1 if progress <= 0 else 0
                if stagnant >= self.config.max_stagnant_iterations:
                    return LoopResult(False, output=action_result, iterations=i + 1, cost_tokens=tokens, history=history, status="blocked", failure_reason="no measurable progress")

        return LoopResult(False, output=history[-1]["action_result"] if history else None, iterations=self.config.react_max_iterations, cost_tokens=tokens, failure_reason=f"max iterations ({self.config.react_max_iterations}) reached", history=history, status="partial")


class ReflexionPattern(Pattern):
    name = "reflexion"

    def run(self, task: str, attempt_fn: Callable, verify_fn: Callable, reflect_fn: Callable, **kwargs) -> LoopResult:
        history, tokens, best_output, best_score = [], 0, None, float("-inf")
        started = monotonic()
        for attempt in range(self.config.reflexion_max_attempts):
            if _timed_out(self.config, started):
                return LoopResult(False, best_output, attempts=attempt, cost_tokens=tokens, history=history, status="timed_out", failure_reason="time budget exhausted")
            if self.config.budget_exhausted(tokens):
                return LoopResult(False, best_output, attempts=attempt, cost_tokens=tokens, history=history, status="budget_exhausted", failure_reason="token budget exhausted")
            try:
                output = attempt_fn(task, history)
                verification = verify_fn(output)
            except Exception as exc:
                return LoopResult(False, best_output, attempts=attempt, cost_tokens=tokens, history=history, status="failed", failure_reason=f"attempt or verifier failed: {exc}")
            if not isinstance(verification, dict) or "pass" not in verification:
                return LoopResult(False, output, attempts=attempt + 1, cost_tokens=tokens, history=history, status="failed", failure_reason="verify_fn must return a dict containing 'pass'")
            tokens += _cost(output) + _cost(verification)
            score = verification.get("score")
            numeric_score = float(score) if isinstance(score, (int, float)) else float(attempt)
            if numeric_score >= best_score:
                best_output, best_score = output, numeric_score
            event = {"attempt": attempt + 1, "output": output, "verification": verification}
            history.append(event)
            if verification["pass"] is True:
                return LoopResult(True, output, attempts=attempt + 1, cost_tokens=tokens, history=history)
            if attempt + 1 < self.config.reflexion_max_attempts:
                try:
                    reflection = reflect_fn(task, output, verification, history)
                except Exception as exc:
                    return LoopResult(False, best_output, attempts=attempt + 1, cost_tokens=tokens, history=history, status="failed", failure_reason=f"reflection failed: {exc}")
                tokens += _cost(reflection)
                event["reflection"] = reflection

        return LoopResult(False, best_output, attempts=self.config.reflexion_max_attempts, cost_tokens=tokens, failure_reason=f"max attempts ({self.config.reflexion_max_attempts}) reached", history=history, status="partial")


class PlanExecutePattern(Pattern):
    name = "plan_execute"

    def run(self, task: str, plan_fn: Callable, execute_fn: Callable, verify_fn: Callable, **kwargs) -> LoopResult:
        history, tokens, last_results = [], 0, []
        started = monotonic()
        for replan in range(self.config.plan_execute_max_replans + 1):
            if _timed_out(self.config, started):
                return LoopResult(False, last_results, iterations=replan, cost_tokens=tokens, history=history, status="timed_out", failure_reason="time budget exhausted")
            if self.config.budget_exhausted(tokens):
                return LoopResult(False, last_results, iterations=replan, cost_tokens=tokens, history=history, status="budget_exhausted", failure_reason="token budget exhausted")
            try:
                plan = plan_fn(task, history)
            except Exception as exc:
                return LoopResult(False, last_results, iterations=replan, cost_tokens=tokens, history=history, status="failed", failure_reason=f"planning failed: {exc}")
            tokens += _cost(plan)
            event = {"plan": plan, "replan": replan, "subtask_results": []}
            history.append(event)
            if not isinstance(plan, (list, tuple)) or not plan:
                event["failure"] = "empty or invalid plan"
                continue

            all_passed = True
            last_results = []
            for subtask in plan:
                try:
                    result = execute_fn(subtask)
                    verification = verify_fn(subtask, result)
                except Exception as exc:
                    all_passed = False
                    last_results.append({"subtask": subtask, "verification": {"pass": False, "error": str(exc)}})
                    break
                tokens += _cost(result) + _cost(verification)
                if not isinstance(verification, dict) or verification.get("pass") is not True:
                    all_passed = False
                last_results.append({"subtask": subtask, "result": result, "verification": verification})
                if not all_passed:
                    break
            event["subtask_results"] = last_results
            if all_passed and len(last_results) == len(plan):
                return LoopResult(True, last_results, iterations=replan + 1, cost_tokens=tokens, history=history)

        return LoopResult(False, last_results, iterations=self.config.plan_execute_max_replans + 1, cost_tokens=tokens, failure_reason=f"max re-plans ({self.config.plan_execute_max_replans}) reached", history=history, status="partial")


class SelfRefinePattern(Pattern):
    name = "self_refine"

    def run(self, task: str, generate_fn: Callable, critique_fn: Callable, **kwargs) -> LoopResult:
        history, tokens = [], 0
        started = monotonic()
        try:
            output = generate_fn(task)
        except Exception as exc:
            return LoopResult(False, status="failed", failure_reason=f"generation failed: {exc}")
        tokens += _cost(output)
        best_output, best_score = output, float("-inf")

        for round_num in range(self.config.self_refine_max_rounds):
            if _timed_out(self.config, started):
                return LoopResult(False, best_output, iterations=round_num, cost_tokens=tokens, history=history, status="timed_out", failure_reason="time budget exhausted")
            if self.config.budget_exhausted(tokens):
                return LoopResult(False, best_output, iterations=round_num, cost_tokens=tokens, history=history, status="budget_exhausted", failure_reason="token budget exhausted")
            try:
                critique = critique_fn(task, output)
            except Exception as exc:
                return LoopResult(False, best_output, iterations=round_num, cost_tokens=tokens, history=history, status="failed", failure_reason=f"critique failed: {exc}")
            tokens += _cost(critique)
            if isinstance(critique, dict):
                text = str(critique.get("feedback", ""))
                done = critique.get("status") == "completed" or critique.get("pass") is True
                score = critique.get("score")
            else:
                text = str(critique)
                normalized = text.strip().lower()
                done = normalized in ("good enough", "no more improvements") or normalized.startswith("[done]")
                score = None
            numeric_score = float(score) if isinstance(score, (int, float)) else float(round_num)
            if numeric_score >= best_score:
                best_output, best_score = output, numeric_score
            history.append({"round": round_num + 1, "output": output, "critique": critique})
            if done:
                return LoopResult(True, output, iterations=round_num + 1, cost_tokens=tokens, history=history)
            try:
                output = generate_fn(task, critique=text, previous=output)
            except Exception as exc:
                return LoopResult(False, best_output, iterations=round_num + 1, cost_tokens=tokens, history=history, status="failed", failure_reason=f"refinement failed: {exc}")
            tokens += _cost(output)

        return LoopResult(False, best_output, iterations=self.config.self_refine_max_rounds, cost_tokens=tokens, failure_reason="max rounds reached; returning best observed version", history=history, status="partial")


class MultiAgentPattern(Pattern):
    name = "multi_agent"

    def run(self, task: str, planner_fn: Callable, executor_fn: Callable, verifier_fn: Callable, reflector_fn: Callable, **kwargs) -> LoopResult:
        history, shared_state, tokens, execution_results = [], {}, 0, None
        started = monotonic()
        for round_num in range(self.config.multi_agent_max_rounds):
            if _timed_out(self.config, started):
                return LoopResult(False, execution_results, iterations=round_num, cost_tokens=tokens, history=history, status="timed_out", failure_reason="time budget exhausted")
            if self.config.budget_exhausted(tokens):
                return LoopResult(False, execution_results, iterations=round_num, cost_tokens=tokens, history=history, status="budget_exhausted", failure_reason="token budget exhausted")
            try:
                plan = planner_fn(task, dict(shared_state), history)
                if not plan:
                    return LoopResult(False, execution_results, iterations=round_num, cost_tokens=tokens, history=history, status="failed", failure_reason="planner returned an empty plan")
                execution_results = executor_fn(plan, dict(shared_state))
                verification = verifier_fn(execution_results, dict(shared_state))
            except Exception as exc:
                return LoopResult(False, execution_results, iterations=round_num, cost_tokens=tokens, history=history, status="failed", failure_reason=f"multi-agent round failed: {exc}")
            tokens += _cost(plan) + _cost(execution_results) + _cost(verification)
            event = {"round": round_num + 1, "plan": plan, "execution": execution_results, "verification": verification}
            history.append(event)
            if isinstance(verification, dict) and verification.get("pass") is True:
                return LoopResult(True, execution_results, iterations=round_num + 1, cost_tokens=tokens, history=history)
            if round_num + 1 < self.config.multi_agent_max_rounds:
                try:
                    reflection = reflector_fn(verification, dict(shared_state), history)
                except Exception as exc:
                    return LoopResult(False, execution_results, iterations=round_num + 1, cost_tokens=tokens, history=history, status="failed", failure_reason=f"reflector failed: {exc}")
                tokens += _cost(reflection)
                event["reflection"] = reflection
                shared_state = {"plan": plan, "execution_results": execution_results, "verification": verification, "reflection": reflection}

        return LoopResult(False, execution_results, iterations=self.config.multi_agent_max_rounds, cost_tokens=tokens, failure_reason=f"max rounds ({self.config.multi_agent_max_rounds}) reached", history=history, status="partial")


class DecisionPattern(Pattern):
    """Structure a decision without making it for the user."""

    name = "decision"

    def run(self, task: str, clarify_fn: Callable, options_fn: Callable, evaluate_fn: Callable, experiment_fn: Optional[Callable] = None, **kwargs) -> LoopResult:
        try:
            frame = clarify_fn(task)
            options = options_fn(task, frame)
            evaluation = evaluate_fn(task, frame, options)
            experiments = experiment_fn(task, frame, options, evaluation) if experiment_fn else []
        except Exception as exc:
            return LoopResult(False, status="failed", failure_reason=f"decision loop failed: {exc}")
        if not isinstance(options, (list, tuple)) or len(options) < 2:
            return LoopResult(False, output={"frame": frame, "options": options}, status="blocked", failure_reason="decision loop requires at least two genuinely different options")
        output = {
            "decision_owner": "user",
            "frame": frame,
            "options": list(options),
            "evaluation": evaluation,
            "reversible_experiments": experiments,
            "review_at": kwargs.get("review_at"),
        }
        return LoopResult(True, output=output, iterations=1, history=[output])


class HabitPattern(Pattern):
    """Run small, observable habit experiments; never diagnose or coerce."""

    name = "habit"

    def run(self, task: str, design_fn: Callable, observe_fn: Callable, adapt_fn: Callable, **kwargs) -> LoopResult:
        history, plan = [], None
        rounds = min(kwargs.get("max_rounds", 3), self.config.react_max_iterations)
        for round_num in range(rounds):
            try:
                plan = design_fn(task, history) if round_num == 0 else adapt_fn(task, plan, history)
                observation = observe_fn(task, plan, history)
            except Exception as exc:
                return LoopResult(False, plan, iterations=round_num, history=history, status="failed", failure_reason=f"habit loop failed: {exc}")
            event = {"round": round_num + 1, "plan": plan, "observation": observation}
            history.append(event)
            if isinstance(observation, dict) and observation.get("status") == "completed":
                return LoopResult(True, {"plan": plan, "observation": observation, "review_required": True}, iterations=round_num + 1, history=history)
        return LoopResult(False, {"plan": plan, "review_required": True}, iterations=rounds, history=history, status="partial", failure_reason="experiment window ended; user review is required")


class LifeReviewPattern(Pattern):
    """Balance life domains across time horizons; the user owns priorities."""

    name = "life_review"

    def run(self, task: str, assess_fn: Callable, prioritize_fn: Callable, plan_fn: Callable, **kwargs) -> LoopResult:
        try:
            assessment = assess_fn(task)
            priorities = prioritize_fn(task, assessment)
            plan = plan_fn(task, assessment, priorities)
        except Exception as exc:
            return LoopResult(False, status="failed", failure_reason=f"life review failed: {exc}")
        output = {
            "decision_owner": "user",
            "assessment": assessment,
            "priorities": priorities,
            "plan": plan,
            "review_at": kwargs.get("review_at"),
            "unresolved_tradeoffs": kwargs.get("unresolved_tradeoffs", []),
        }
        return LoopResult(True, output, iterations=1, history=[output])
