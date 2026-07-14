"""Composable policy gates for trustworthy loop execution."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from typing import Callable, Iterable, Optional, Tuple

from .models import (
    AutonomyMode,
    LoopContract,
    ProposedAction,
    RiskLevel,
    StepOutcome,
)


class GateStage(str, Enum):
    PRE_ACTION = "pre_action"
    POST_ACTION = "post_action"
    MEMORY_WRITE = "memory_write"


@dataclass(frozen=True)
class GateContext:
    contract: LoopContract
    action: Optional[ProposedAction] = None
    outcome: Optional[StepOutcome] = None


@dataclass(frozen=True)
class GateResult:
    passed: bool
    gate: str
    reason: str = ""
    requires_human: bool = False


Gate = Callable[[GateStage, GateContext], GateResult]


class GatePipeline:
    def __init__(self, gates: Iterable[Gate] = ()):
        self.gates = tuple(gates)

    def evaluate(self, stage: GateStage, context: GateContext) -> Tuple[GateResult, ...]:
        results = []
        for gate in self.gates:
            try:
                result = gate(stage, context)
            except Exception as exc:  # gates fail closed
                result = GateResult(False, getattr(gate, "__name__", "gate"), f"gate error: {exc}")
            results.append(result)
        return tuple(results)


def safety_gate(stage: GateStage, context: GateContext) -> GateResult:
    if stage != GateStage.PRE_ACTION:
        return GateResult(True, "safety")

    risk = context.contract.risk
    action = context.action
    if risk.level == RiskLevel.CRITICAL:
        return GateResult(False, "safety", "critical-risk tasks require human or professional support")
    if action is None:
        return GateResult(False, "safety", "missing proposed action")
    if risk.autonomy in (AutonomyMode.ADVISORY_ONLY, AutonomyMode.CRISIS_SUPPORT) and action.external:
        return GateResult(False, "safety", "advisory-only loops cannot execute external actions")
    if not risk.allow_external_action and action.external:
        return GateResult(False, "safety", "external action is prohibited by the risk profile")
    needs_human = (
        risk.autonomy == AutonomyMode.CONFIRM_BEFORE_ACTION
        or not action.reversible
        or action.affects_others
    )
    return GateResult(True, "safety", requires_human=needs_human)


def evidence_gate(stage: GateStage, context: GateContext) -> GateResult:
    if stage != GateStage.POST_ACTION:
        return GateResult(True, "evidence")
    outcome = context.outcome
    if outcome is None:
        return GateResult(False, "evidence", "missing step outcome")
    if outcome.status.value != "completed":
        return GateResult(True, "evidence")
    if not outcome.evidence:
        return GateResult(False, "evidence", "completion requires at least one item of evidence")
    if not all(item.source.strip() and item.summary.strip() for item in outcome.evidence):
        return GateResult(False, "evidence", "completion evidence requires a source and summary")
    if not all(item.passed and item.fresh for item in outcome.evidence):
        return GateResult(False, "evidence", "completion evidence must be fresh and passing")
    max_age = context.contract.max_evidence_age_seconds
    if max_age is not None:
        now = datetime.now(timezone.utc)
        for item in outcome.evidence:
            observed = item.observed_at
            if observed.tzinfo is None:
                observed = observed.replace(tzinfo=timezone.utc)
            age = (now - observed).total_seconds()
            if age < 0 or age > max_age:
                return GateResult(False, "evidence", "completion evidence is outside the allowed freshness window")
    return GateResult(True, "evidence")


def memory_consent_gate(stage: GateStage, context: GateContext) -> GateResult:
    if stage != GateStage.MEMORY_WRITE:
        return GateResult(True, "memory_consent")
    if not context.contract.memory_policy.enabled:
        return GateResult(False, "memory_consent", "memory is disabled by the contract")
    if not context.contract.consent_to_store_memory:
        return GateResult(False, "memory_consent", "memory storage requires explicit consent")
    return GateResult(True, "memory_consent")


def default_gate_pipeline() -> GatePipeline:
    return GatePipeline((safety_gate, evidence_gate, memory_consent_gate))
