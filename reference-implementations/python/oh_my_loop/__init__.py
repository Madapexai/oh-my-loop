"""Oh My Loop - Reference implementation of the smart routing methodology."""
from .router import route, RouteResult
from .patterns import (
    Pattern,
    ReactPattern,
    ReflexionPattern,
    PlanExecutePattern,
    SelfRefinePattern,
    MultiAgentPattern,
)
from .config import LoopConfig
from .verify import verify_before_claim, VerificationResult
from .feedback import FeedbackStore

__all__ = [
    "route",
    "RouteResult",
    "Pattern",
    "ReactPattern",
    "ReflexionPattern",
    "PlanExecutePattern",
    "SelfRefinePattern",
    "MultiAgentPattern",
    "LoopConfig",
    "verify_before_claim",
    "VerificationResult",
    "FeedbackStore",
]
