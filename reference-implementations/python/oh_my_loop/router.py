"""Smart router - decides if a task needs a loop, and which pattern.

This is the executable version of using-oh-my-loop/SKILL.md.
The decision tree is encoded as code, not left to the LLM's judgment.
"""
from dataclasses import dataclass
from enum import Enum
from typing import Optional, Callable


class RouteDecision(Enum):
    DIRECT_ANSWER = "direct_answer"      # trivial, no loop
    DO_ONCE = "do_once"                  # reversible, low stakes
    EXECUTE_VERIFY = "execute_verify"     # verifiable but simple
    PATTERN = "pattern"                  # needs a real loop


@dataclass
class RouteResult:
    decision: RouteDecision
    pattern: Optional[str] = None  # "react" | "reflexion" | "plan_execute" | "self_refine" | "multi_agent"
    reason: str = ""


def route(
    task: str,
    *,
    is_trivial: Callable[[str], bool] = None,
    is_reversible: Callable[[str], bool] = None,
    has_verifiable_criteria: Callable[[str], bool] = None,
    is_complex: Callable[[str], bool] = None,
    failure_mode: Callable[[str], str] = None,
) -> RouteResult:
    """Route a task to the right loop depth.

    Args:
        task: the task description
        is_trivial: predicate for "this is a one-shot factual/simple task"
        is_reversible: predicate for "this can be undone easily"
        has_verifiable_criteria: predicate for "we can objectively check success"
        is_complex: predicate for "this might fail on first try"
        failure_mode: returns the dominant failure mode ("unknown_steps" | "wrong_execution" | "first_attempt_wrong" | "needs_polish" | "needs_multiple_perspectives")

    Returns:
        RouteResult with decision and optional pattern name

    The predicates default to keyword heuristics. Override them for your domain.
    """
    if is_trivial is None:
        is_trivial = _default_is_trivial
    if is_reversible is None:
        is_reversible = _default_is_reversible
    if has_verifiable_criteria is None:
        has_verifiable_criteria = _default_has_verifiable_criteria
    if is_complex is None:
        is_complex = _default_is_complex
    if failure_mode is None:
        failure_mode = _default_failure_mode

    if is_trivial(task):
        return RouteResult(RouteDecision.DIRECT_ANSWER, reason="trivial task, answer directly")

    if not has_verifiable_criteria(task):
        if is_complex(task):
            # pick pattern by failure mode (not always react)
            fm = failure_mode(task)
            pattern_map_no_verify = {
                "unknown_steps": "react",
                "needs_multiple_perspectives": "multi_agent",
                "needs_polish": "self_refine",
            }
            pattern = pattern_map_no_verify.get(fm, "react")
            return RouteResult(RouteDecision.PATTERN, pattern=pattern, reason=f"complex task, failure mode: {fm}")
        return RouteResult(
            RouteDecision.DIRECT_ANSWER,
            reason="no verifiable criteria and not complex - answer directly",
        )

    if not is_complex(task):
        if is_reversible(task):
            return RouteResult(RouteDecision.DO_ONCE, reason="reversible + low stakes, do once")
        return RouteResult(RouteDecision.EXECUTE_VERIFY, reason="simple + verifiable, execute + verify")

    # complex task - pick pattern by failure mode
    fm = failure_mode(task)
    pattern_map = {
        "unknown_steps": "react",
        "wrong_execution": "plan_execute",
        "first_attempt_wrong": "reflexion",
        "needs_polish": "self_refine",
        "needs_multiple_perspectives": "multi_agent",
    }
    pattern = pattern_map.get(fm)
    if pattern is None:
        return RouteResult(RouteDecision.EXECUTE_VERIFY, reason=f"unknown failure mode '{fm}', default to execute+verify")

    return RouteResult(RouteDecision.PATTERN, pattern=pattern, reason=f"failure mode: {fm}")


# Default heuristics - override these for your domain
def _default_is_trivial(task: str) -> bool:
    # truly trivial: factual questions, simple string ops, suggestions
    trivial_signals = ["what's 2+2", "format this string", "summarize this email", "translate", "what is the", "convert this", "count words", "suggest a name", "uppercase", "lowercase", "capital of"]
    task_lower = task.lower().strip()
    # very short tasks (likely simple)
    if len(task) < 15:
        return True
    return any(signal in task_lower for signal in trivial_signals)


def _default_is_reversible(task: str) -> bool:
    irreversible_signals = ["delete", "deploy", "payment", "send email", "commit", "push", "refund", "drop table", "migration"]
    # bug fixes that change code behavior are not "trivially reversible" for do_once
    # but "fix typo" / "fix this typo" is trivially reversible
    bug_signals = ["fix the bug", "fix the intermittent", "fix the race", "fix the off-by-one", "debug", "broken", "error", "crash", "leak"]
    task_lower = task.lower()
    # "fix typo" or "fix this typo" is trivially reversible
    if "typo" in task_lower:
        return True
    if any(sig in task_lower for sig in bug_signals):
        return False
    return not any(sig in task_lower for sig in irreversible_signals)


def _default_has_verifiable_criteria(task: str) -> bool:
    verifiable_signals = ["test", "lint", "build", "api", "endpoint", "function", "bug", "error", "refactor", "implement", "migrate", "module", "feature", "fix", "rename", "update", "add a log", "remove", "reorder", "docstring", "variable", "import", "version", "blank line", "comment", "type hint"]
    task_lower = task.lower()
    # code tasks have implicit verifiable criteria (tests/build pass)
    return any(sig in task_lower for sig in verifiable_signals)


def _default_is_complex(task: str) -> bool:
    complex_signals = ["refactor", "debug", "research", "migrate", "multiple files", "design", "fix the bug", "fix the intermittent", "fix the race", "fix the off", "broken", "error", "crash", "intermittent", "investigate", "explore", "find out", "analyze", "plan", "implement", "add a new", "add validation", "rate limiting", "competition", "root cause", "architecture", "review", "audit", "compliance", "write a readme", "write the api doc", "draft the launch", "improve the marketing", "write a blog", "draft a blog"]
    task_lower = task.lower()
    return any(sig in task_lower for sig in complex_signals) or len(task) > 200


def _default_failure_mode(task: str) -> str:
    task_lower = task.lower()
    if any(w in task_lower for w in ["review", "audit", "compliance", "architecture"]):
        return "needs_multiple_perspectives"
    if any(w in task_lower for w in ["explore", "find out", "investigate", "research", "unknown", "root cause", "competition"]):
        return "unknown_steps"
    if any(w in task_lower for w in ["refactor", "migrate", "implement", "add a new", "add validation", "rate limiting"]):
        return "wrong_execution"
    if any(w in task_lower for w in ["bug", "fix", "error", "broken", "fail", "crash", "intermittent", "off-by-one", "leak"]):
        return "first_attempt_wrong"
    if any(w in task_lower for w in ["write", "draft", "polish", "improve", "readme", "blog", "documentation", "copy"]):
        return "needs_polish"
    return "wrong_execution"  # default
