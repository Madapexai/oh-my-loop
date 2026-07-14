"""Configuration for loop patterns. All limits are validated and tunable."""
from dataclasses import dataclass
from typing import Optional


@dataclass
class LoopConfig:
    """Tunable config for all patterns. Override defaults per-task."""

    # react: max iterations before giving up
    # Conservative starter value; calibrate with domain-specific evaluation.
    react_max_iterations: int = 10

    # reflexion: max attempts before escalating
    # Conservative starter value; retries are not evidence of improvement.
    reflexion_max_attempts: int = 3

    # plan-execute: max re-plans before escalating
    # Conservative starter value.
    plan_execute_max_replans: int = 2

    # self-refine: max refinements
    # Conservative starter value.
    self_refine_max_rounds: int = 3

    # multi-agent: max rounds of plan-execute-verify-reflect
    # Conservative starter value; roles may share correlated errors.
    multi_agent_max_rounds: int = 2

    # cost budget (in tokens). None = unlimited
    cost_budget_tokens: Optional[int] = None

    # wall-clock budget. None = unlimited
    time_budget_seconds: Optional[float] = None

    # stop if this many consecutive iterations make no progress
    max_stagnant_iterations: int = 2

    # cost threshold for human confirmation (in tokens)
    human_confirm_cost_threshold: int = 10000

    # model tiers for degradation
    primary_model: str = "primary"
    cheap_model: str = "economy"

    # degradation: switch to cheap model at 50% budget
    cheap_model_threshold: float = 0.5

    def __post_init__(self):
        integer_limits = {
            "react_max_iterations": self.react_max_iterations,
            "reflexion_max_attempts": self.reflexion_max_attempts,
            "plan_execute_max_replans": self.plan_execute_max_replans,
            "self_refine_max_rounds": self.self_refine_max_rounds,
            "multi_agent_max_rounds": self.multi_agent_max_rounds,
            "max_stagnant_iterations": self.max_stagnant_iterations,
        }
        for name, value in integer_limits.items():
            minimum = 0 if name == "plan_execute_max_replans" else 1
            if value < minimum:
                raise ValueError(f"{name} must be >= {minimum}")
        if self.cost_budget_tokens is not None and self.cost_budget_tokens < 1:
            raise ValueError("cost_budget_tokens must be >= 1 when set")
        if self.time_budget_seconds is not None and self.time_budget_seconds <= 0:
            raise ValueError("time_budget_seconds must be > 0 when set")
        if not 0 < self.cheap_model_threshold <= 1:
            raise ValueError("cheap_model_threshold must be in (0, 1]")

    def should_downgrade_model(self, tokens_used: int) -> bool:
        if self.cost_budget_tokens is None:
            return False
        usage = tokens_used / self.cost_budget_tokens
        return usage >= self.cheap_model_threshold

    def should_human_confirm(self, tokens_used: int) -> bool:
        return tokens_used >= self.human_confirm_cost_threshold

    def budget_exhausted(self, tokens_used: int) -> bool:
        return self.cost_budget_tokens is not None and tokens_used >= self.cost_budget_tokens
