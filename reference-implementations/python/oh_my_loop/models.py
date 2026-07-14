"""Core types for trustworthy, human-centered loops.

The models deliberately separate goals, actions, evidence, risk, and terminal
status.  A model-generated sentence such as "done" is never a control signal.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional, Tuple


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AutonomyMode(str, Enum):
    AUTO = "auto"
    CONFIRM_BEFORE_ACTION = "confirm_before_action"
    ADVISORY_ONLY = "advisory_only"
    CRISIS_SUPPORT = "crisis_support"


class DecisionOwner(str, Enum):
    AGENT = "agent"
    USER = "user"
    SHARED = "shared"
    EXPERT = "expert"


class FeedbackType(str, Enum):
    OBJECTIVE = "objective"
    SUBJECTIVE = "subjective"
    DELAYED = "delayed"
    MIXED = "mixed"


class LoopStatus(str, Enum):
    CONTINUE = "continue"
    COMPLETED = "completed"
    PARTIAL = "partial"
    BLOCKED = "blocked"
    ESCALATED = "escalated"
    BUDGET_EXHAUSTED = "budget_exhausted"
    TIMED_OUT = "timed_out"
    CANCELLED = "cancelled"
    FAILED = "failed"


@dataclass(frozen=True)
class RiskProfile:
    level: RiskLevel = RiskLevel.LOW
    reasons: Tuple[str, ...] = ()
    autonomy: AutonomyMode = AutonomyMode.AUTO
    requires_human: bool = False
    allow_external_action: bool = True


@dataclass(frozen=True)
class Evidence:
    source: str
    summary: str
    passed: bool = True
    fresh: bool = True
    observed_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass(frozen=True)
class ProposedAction:
    name: str
    description: str = ""
    reversible: bool = True
    external: bool = False
    affects_others: bool = False
    estimated_cost_tokens: int = 0


@dataclass(frozen=True)
class StepProposal:
    action: ProposedAction
    rationale: str = ""
    cost_tokens: int = 0


@dataclass(frozen=True)
class StepOutcome:
    status: LoopStatus
    output: Any = None
    evidence: Tuple[Evidence, ...] = ()
    progress_delta: float = 0.0
    cost_tokens: int = 0
    reason: str = ""


@dataclass(frozen=True)
class MemoryPolicy:
    """Default-on capability with quarantined, consent-gated activation."""

    enabled: bool = True
    capture_candidates: bool = True
    activate_after_review: bool = True
    require_consent_for_personal: bool = True
    default_ttl_days: int = 90


@dataclass(frozen=True)
class LoopContract:
    """Explicit agreement that controls a loop run.

    Life decisions default to user ownership and no memory persistence.  The
    caller must opt in to a different policy explicitly.
    """

    goal: str
    domain: str = "general"
    decision_owner: DecisionOwner = DecisionOwner.USER
    success_criteria: Tuple[str, ...] = ()
    failure_modes: Tuple[str, ...] = ()
    stop_conditions: Tuple[str, ...] = ()
    affected_people: Tuple[str, ...] = ()
    feedback_type: FeedbackType = FeedbackType.MIXED
    risk: RiskProfile = field(default_factory=RiskProfile)
    max_iterations: int = 5
    token_budget: Optional[int] = None
    time_budget_seconds: Optional[float] = None
    max_stagnant_iterations: int = 2
    max_evidence_age_seconds: Optional[float] = 300.0
    memory_policy: MemoryPolicy = field(default_factory=MemoryPolicy)
    consent_to_store_memory: bool = False
    review_at: Optional[datetime] = None

    def validation_errors(self) -> Tuple[str, ...]:
        errors = []
        if not self.goal.strip():
            errors.append("goal is required")
        if self.max_iterations < 1:
            errors.append("max_iterations must be >= 1")
        if self.max_stagnant_iterations < 1:
            errors.append("max_stagnant_iterations must be >= 1")
        if self.token_budget is not None and self.token_budget < 1:
            errors.append("token_budget must be >= 1 when set")
        if self.time_budget_seconds is not None and self.time_budget_seconds <= 0:
            errors.append("time_budget_seconds must be > 0 when set")
        if self.max_evidence_age_seconds is not None and self.max_evidence_age_seconds <= 0:
            errors.append("max_evidence_age_seconds must be > 0 when set")
        if self.memory_policy.default_ttl_days < 1:
            errors.append("memory default_ttl_days must be >= 1")
        if self.risk.level in (RiskLevel.HIGH, RiskLevel.CRITICAL):
            if self.decision_owner == DecisionOwner.AGENT:
                errors.append("high-risk decisions cannot be owned by the agent")
            if self.risk.autonomy == AutonomyMode.AUTO:
                errors.append("high-risk tasks cannot use automatic autonomy")
        return tuple(errors)


@dataclass
class KernelResult:
    status: LoopStatus
    output: Any = None
    reason: str = ""
    iterations: int = 0
    cost_tokens: int = 0
    history: list = field(default_factory=list)
    evidence: Tuple[Evidence, ...] = ()

    @property
    def success(self) -> bool:
        return self.status == LoopStatus.COMPLETED
