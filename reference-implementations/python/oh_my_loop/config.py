"""Configuration for loop patterns. All limits are tunable."""
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class LoopConfig:
    """Tunable config for all patterns. Override defaults per-task."""

    # react: max iterations before giving up
    # Why 10? Empirical: most exploration tasks converge within 5-8 steps
    # (Reflexion paper, Shinn et al. 2023, shows diminishing returns after ~6)
    react_max_iterations: int = 10

    # reflexion: max attempts before escalating
    # Why 3? Reflexion paper shows 3rd attempt rarely improves; 4th+ is noise
    reflexion_max_attempts: int = 3

    # plan-execute: max re-plans before escalating
    # Why 2? One re-plan handles "got the steps wrong"; two means deeper issue
    plan_execute_max_replans: int = 2

    # self-refine: max refinements
    # Why 3? Self-Refine paper (Madaan et al. 2023) shows convergence by round 3
    self_refine_max_rounds: int = 3

    # multi-agent: max rounds of plan-execute-verify-reflect
    # Why 2? Each round doubles cost; more than 2 means task is too complex
    multi_agent_max_rounds: int = 2

    # cost budget (in tokens). None = unlimited
    cost_budget_tokens: Optional[int] = None

    # cost threshold for human confirmation (in tokens)
    human_confirm_cost_threshold: int = 10000

    # model tiers for degradation
    primary_model: str = "gpt-4o"
    cheap_model: str = "gpt-4o-mini"

    # degradation: switch to cheap model at 50% budget
    cheap_model_threshold: float = 0.5

    def should_downgrade_model(self, tokens_used: int) -> bool:
        if self.cost_budget_tokens is None:
            return False
        usage = tokens_used / self.cost_budget_tokens
        return usage >= self.cheap_model_threshold

    def should_human_confirm(self, tokens_used: int) -> bool:
        return tokens_used >= self.human_confirm_cost_threshold
