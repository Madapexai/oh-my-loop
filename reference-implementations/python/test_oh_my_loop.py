"""Tests for oh_my_loop. Run with: python -m pytest test_oh_my_loop.py"""
from oh_my_loop import route, RouteResult, verify_before_claim, LoopConfig
from oh_my_loop.patterns import ReactPattern, ReflexionPattern, PlanExecutePattern, SelfRefinePattern, MultiAgentPattern, LoopResult


def test_router_trivial():
    """Trivial tasks should route to DIRECT_ANSWER."""
    result = route("what's 2+2")
    assert result.decision.value == "direct_answer"


def test_router_reversible():
    """Reversible + low stakes should route to DO_ONCE (simple verifiable task)."""
    result = route("add a comment to the auth module")
    assert result.decision.value == "do_once"


def test_router_complex_bug():
    """Bug fix should route to reflexion pattern."""
    result = route("fix the bug where login fails for users with special chars in password")
    assert result.decision.value == "pattern"
    assert result.pattern == "reflexion"


def test_router_complex_refactor():
    """Refactor should route to plan-execute."""
    result = route("refactor the auth module to support OAuth without breaking existing session auth")
    assert result.decision.value == "pattern"
    assert result.pattern == "plan_execute"


def test_router_research():
    """Research should route to react."""
    result = route("investigate and find the best open-source agent framework for multi-tool multi-agent use case")
    assert result.decision.value == "pattern"
    assert result.pattern == "react"


def test_verify_before_claim_pass():
    """Verify should pass when all checks pass."""
    def fake_verify():
        return "all tests passed, 0 failures"

    result = verify_before_claim(
        claim="tests pass",
        verify_fn=fake_verify,
        checks={"contains_passed": lambda o: "passed" in o, "no_failures": lambda o: "0 failures" in o.lower()},
    )
    assert result.can_claim is True


def test_verify_before_claim_fail():
    """Verify should fail when a check fails."""
    def fake_verify():
        return "2 tests failed"

    result = verify_before_claim(
        claim="tests pass",
        verify_fn=fake_verify,
        checks={"no_failures": lambda o: "fail" not in o.lower()},
    )
    assert result.can_claim is False


def test_react_pattern_terminates_on_answer():
    """react should terminate when think_fn signals 'done'."""
    def think(task, history):
        return "I have the answer"

    def act(thought, history):
        return "action result"

    pattern = ReactPattern()
    result = pattern.run("test task", think_fn=think, act_fn=act)
    assert result.success is True
    assert result.iterations == 1


def test_react_pattern_terminates_on_max():
    """react should stop at max iterations."""
    counter = [0]

    def think(task, history):
        counter[0] += 1
        return f"thinking {counter[0]}"

    def act(thought, history):
        return "action result"

    config = LoopConfig(react_max_iterations=3)
    pattern = ReactPattern(config=config)
    result = pattern.run("test task", think_fn=think, act_fn=act)
    assert result.success is False
    assert result.iterations == 3


def test_reflexion_terminates_on_success():
    """reflexion should terminate when verify passes."""

    def attempt(task, history):
        return "solution"

    def verify(output):
        return {"pass": True}

    def reflect(task, output, verification, history):
        return "reflection"

    pattern = ReflexionPattern()
    result = pattern.run("test", attempt_fn=attempt, verify_fn=verify, reflect_fn=reflect)
    assert result.success is True
    assert result.attempts == 1


def test_reflexion_terminates_on_max():
    """reflexion should stop at max attempts."""
    attempt_count = [0]

    def attempt(task, history):
        attempt_count[0] += 1
        return f"attempt {attempt_count[0]}"

    def verify(output):
        return {"pass": False}

    def reflect(task, output, verification, history):
        return "try differently"

    config = LoopConfig(reflexion_max_attempts=3)
    pattern = ReflexionPattern(config=config)
    result = pattern.run("test", attempt_fn=attempt, verify_fn=verify, reflect_fn=reflect)
    assert result.success is False
    assert result.attempts == 3


def test_config_degradation():
    """Config should signal model downgrade at 50% budget."""
    config = LoopConfig(cost_budget_tokens=10000, cheap_model_threshold=0.5)
    assert config.should_downgrade_model(4000) is False
    assert config.should_downgrade_model(5000) is True


def test_config_human_confirm():
    """Config should signal human confirm at threshold."""
    config = LoopConfig(human_confirm_cost_threshold=10000)
    assert config.should_human_confirm(9000) is False
    assert config.should_human_confirm(10000) is True


if __name__ == "__main__":
    test_router_trivial()
    test_router_reversible()
    test_router_complex_bug()
    test_router_complex_refactor()
    test_router_research()
    test_verify_before_claim_pass()
    test_verify_before_claim_fail()
    test_react_pattern_terminates_on_answer()
    test_react_pattern_terminates_on_max()
    test_reflexion_terminates_on_success()
    test_reflexion_terminates_on_max()
    test_config_degradation()
    test_config_human_confirm()
    print("✅ All 13 tests passed")
