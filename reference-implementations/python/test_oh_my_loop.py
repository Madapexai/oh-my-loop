"""Trust and regression tests for the Python reference implementation."""
from __future__ import annotations

import json
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

from oh_my_loop import (
    AutonomyMode,
    DecisionPattern,
    Evidence,
    FeedbackStore,
    JSONMemoryStore,
    LoopConfig,
    LoopContract,
    LoopKernel,
    LoopStatus,
    MemorySensitivity,
    MemoryStatus,
    ModelConfigurationError,
    ModelDecisionError,
    PlanExecutePattern,
    ProposedAction,
    ReactPattern,
    ReflexionPattern,
    RiskLevel,
    RiskProfile,
    SelfRefinePattern,
    StepOutcome,
    StepProposal,
    contract_for,
    route,
    verify_before_claim,
)


class RouterTests(unittest.TestCase):
    @staticmethod
    def model_decision(**overrides):
        value = {
            "schema_version": "2",
            "decision": "pattern",
            "pattern": "decision",
            "domain": "semantic-domain-from-model",
            "intent": "model-inferred intent",
            "decision_owner": "user",
            "confidence": 0.9,
            "reason": "model-inferred reason",
            "warnings": [],
            "risk": {
                "level": "low",
                "autonomy": "advisory_only",
                "reasons": [],
                "requires_human": False,
                "allow_external_action": False,
            },
            "loop": {
                "name": "model-authored-loop",
                "patterns": ["decision", "custom_observation"],
                "strategy": "Act on one hypothesis, observe, and adapt the next step.",
                "feedback_type": "mixed",
                "steps": ["Run the smallest reversible probe"],
                "adaptation_rules": ["Revise the next step when evidence contradicts the hypothesis"],
                "success_evidence": ["Fresh evidence satisfies the model-defined outcome"],
                "stop_conditions": ["Evidence passes or the loop stops making progress"],
                "max_iterations": 5,
            },
        }
        risk = dict(value["risk"])
        risk.update(overrides.pop("risk", {}))
        value.update(overrides)
        value["risk"] = risk
        return value

    @staticmethod
    def classifier(value):
        return lambda _task, _prompt: value

    def test_missing_model_fails_closed(self):
        with self.assertRaises(ModelConfigurationError):
            route("opaque input")

    def test_model_receives_semantic_protocol(self):
        observed = {}

        def classify(task, prompt):
            observed.update(task=task, prompt=prompt)
            return self.model_decision(
                decision="execute_verify",
                pattern=None,
                decision_owner="agent",
                risk={"autonomy": "auto", "allow_external_action": True},
            )

        result = route("opaque input", classify_fn=classify)
        self.assertEqual(result.decision.value, "execute_verify")
        self.assertEqual(observed["task"], "opaque input")
        self.assertIn("Never\nclassify with keyword", observed["prompt"])

    def test_model_can_compose_and_invent_loop_primitives(self):
        raw = self.model_decision(pattern="task_specific_strategy")
        result = route("opaque input", classify_fn=self.classifier(raw))
        self.assertEqual(result.pattern, "task_specific_strategy")
        self.assertEqual(result.patterns, ("decision", "custom_observation"))
        self.assertEqual(result.loop.max_iterations, 5)

    def test_critical_model_classification_is_forced_to_escalation(self):
        raw = self.model_decision(
            decision="direct_answer",
            pattern=None,
            decision_owner="agent",
            risk={"level": "critical", "autonomy": "auto", "allow_external_action": True},
        )
        result = route("opaque input", classify_fn=self.classifier(raw))
        self.assertEqual(result.decision.value, "escalate")
        self.assertEqual(result.pattern, "crisis_support")
        self.assertEqual(result.risk.level, RiskLevel.CRITICAL)
        self.assertEqual(result.decision_owner.value, "expert")
        self.assertFalse(result.risk.allow_external_action)

    def test_advisory_model_classification_cannot_execute(self):
        raw = self.model_decision(decision_owner="agent")
        result = route("opaque input", classify_fn=self.classifier(raw))
        self.assertEqual(result.decision.value, "assist_only")
        self.assertEqual(result.decision_owner.value, "user")
        self.assertFalse(result.risk.allow_external_action)

    def test_confirmation_model_classification_requires_human(self):
        raw = self.model_decision(
            decision="do_once",
            pattern=None,
            risk={"level": "high", "autonomy": "confirm_before_action", "allow_external_action": True},
        )
        result = route("opaque input", classify_fn=self.classifier(raw))
        self.assertEqual(result.decision.value, "human_confirm")
        self.assertTrue(result.risk.requires_human)

    def test_low_confidence_reduces_autonomy(self):
        raw = self.model_decision(
            decision="do_once",
            pattern=None,
            confidence=0.3,
            decision_owner="agent",
            risk={"autonomy": "auto", "allow_external_action": True},
        )
        result = route("opaque input", classify_fn=self.classifier(raw))
        self.assertEqual(result.decision.value, "assist_only")
        self.assertIn("Low model confidence", result.warnings[0])

    def test_invalid_model_output_fails_closed(self):
        with self.assertRaises(ModelDecisionError):
            route("opaque input", classify_fn=self.classifier({"schema_version": "2"}))

    def test_model_failure_fails_closed(self):
        def fail(*_):
            raise RuntimeError("offline")

        with self.assertRaises(ModelDecisionError):
            route("opaque input", classify_fn=fail)

    def test_contract_uses_model_ownership_and_default_memory(self):
        raw = self.model_decision(pattern="habit")
        routed = route("opaque input", classify_fn=self.classifier(raw))
        contract = contract_for("opaque input", routed)
        self.assertEqual(contract.decision_owner.value, "user")
        self.assertTrue(contract.memory_policy.enabled)
        self.assertTrue(contract.memory_policy.capture_candidates)
        self.assertFalse(contract.consent_to_store_memory)


class VerificationTests(unittest.TestCase):
    def test_verify_pass(self):
        result = verify_before_claim("tests pass", lambda: "0 failures", {"zero": lambda x: "0" in x})
        self.assertTrue(result.can_claim)

    def test_verify_fail(self):
        result = verify_before_claim("tests pass", lambda: "2 failures", {"zero": lambda x: "0" in x})
        self.assertFalse(result.can_claim)

    def test_empty_checks_fail_closed(self):
        self.assertFalse(verify_before_claim("anything", lambda: "output", {}).can_claim)

    def test_verify_exception_fails_closed(self):
        def boom():
            raise RuntimeError("tool failed")

        result = verify_before_claim("anything", boom, {"check": lambda _: True})
        self.assertFalse(result.can_claim)
        self.assertIn("verification_run_error", result.checks)


class PatternTests(unittest.TestCase):
    def test_react_structured_completion_returns_action_output(self):
        result = ReactPattern().run(
            "task",
            think_fn=lambda *_: "next",
            act_fn=lambda *_: {"status": "completed", "output": "answer"},
        )
        self.assertTrue(result.success)
        self.assertEqual(result.output, "answer")

    def test_react_not_done_is_not_completion(self):
        result = ReactPattern(LoopConfig(react_max_iterations=1)).run(
            "task",
            think_fn=lambda *_: "I'm not done",
            act_fn=lambda *_: {"progress_delta": 1},
        )
        self.assertFalse(result.success)

    def test_react_stagnation_stops(self):
        result = ReactPattern(LoopConfig(react_max_iterations=5, max_stagnant_iterations=2)).run(
            "task",
            think_fn=lambda *_: "continue",
            act_fn=lambda *_: {"progress_delta": 0},
        )
        self.assertEqual(result.status, "blocked")
        self.assertEqual(result.iterations, 2)

    def test_reflexion_returns_latest_best_without_scores(self):
        counter = [0]

        def attempt(*_):
            counter[0] += 1
            return f"version-{counter[0]}"

        result = ReflexionPattern(LoopConfig(reflexion_max_attempts=3)).run(
            "task", attempt_fn=attempt, verify_fn=lambda _: {"pass": False}, reflect_fn=lambda *_: "change"
        )
        self.assertEqual(result.output, "version-3")

    def test_empty_plan_cannot_succeed(self):
        result = PlanExecutePattern(LoopConfig(plan_execute_max_replans=0)).run(
            "task", plan_fn=lambda *_: [], execute_fn=lambda _: None, verify_fn=lambda *_: {"pass": True}
        )
        self.assertFalse(result.success)

    def test_self_refine_max_is_partial_not_success(self):
        result = SelfRefinePattern(LoopConfig(self_refine_max_rounds=1)).run(
            "task", generate_fn=lambda task, **_: "draft", critique_fn=lambda *_: "still weak"
        )
        self.assertFalse(result.success)
        self.assertEqual(result.status, "partial")

    def test_pattern_exception_is_result_not_crash(self):
        result = ReactPattern().run("task", think_fn=lambda *_: 1 / 0, act_fn=lambda *_: None)
        self.assertEqual(result.status, "failed")

    def test_decision_pattern_keeps_user_ownership(self):
        result = DecisionPattern().run(
            "choose",
            clarify_fn=lambda _: {"values": ["health", "family"]},
            options_fn=lambda *_: ["A", "B"],
            evaluate_fn=lambda *_: {"tradeoffs": []},
        )
        self.assertTrue(result.success)
        self.assertEqual(result.output["decision_owner"], "user")

    def test_decision_pattern_requires_alternatives(self):
        result = DecisionPattern().run(
            "choose", clarify_fn=lambda _: {}, options_fn=lambda *_: ["A"], evaluate_fn=lambda *_: {}
        )
        self.assertFalse(result.success)


class KernelTests(unittest.TestCase):
    @staticmethod
    def proposal(external=False, reversible=True):
        return StepProposal(ProposedAction("step", external=external, reversible=reversible))

    @staticmethod
    def completed(*_):
        return StepOutcome(LoopStatus.COMPLETED, output="ok", evidence=(Evidence("test", "passed"),), progress_delta=1)

    def test_completed_with_evidence(self):
        result = LoopKernel().run(LoopContract("goal"), lambda *_: self.proposal(), self.completed)
        self.assertTrue(result.success)

    def test_completion_without_evidence_is_partial(self):
        result = LoopKernel().run(
            LoopContract("goal"),
            lambda *_: self.proposal(),
            lambda *_: StepOutcome(LoopStatus.COMPLETED, output="claimed"),
        )
        self.assertEqual(result.status, LoopStatus.PARTIAL)

    def test_irreversible_requires_confirmation(self):
        result = LoopKernel().run(
            LoopContract("goal"), lambda *_: self.proposal(reversible=False), self.completed
        )
        self.assertEqual(result.status, LoopStatus.ESCALATED)

    def test_rejected_confirmation_cancels(self):
        result = LoopKernel().run(
            LoopContract("goal"),
            lambda *_: self.proposal(reversible=False),
            self.completed,
            human_confirm_fn=lambda *_: False,
        )
        self.assertEqual(result.status, LoopStatus.CANCELLED)

    def test_advisory_mode_blocks_external_action(self):
        risk = RiskProfile(RiskLevel.HIGH, ("life",), AutonomyMode.ADVISORY_ONLY, True, False)
        result = LoopKernel().run(
            LoopContract("goal", risk=risk), lambda *_: self.proposal(external=True), self.completed
        )
        self.assertEqual(result.status, LoopStatus.ESCALATED)

    def test_advisory_mode_allows_internal_decision_support(self):
        risk = RiskProfile(RiskLevel.HIGH, ("life",), AutonomyMode.ADVISORY_ONLY, True, False)
        result = LoopKernel().run(
            LoopContract("compare options", risk=risk), lambda *_: self.proposal(), self.completed
        )
        self.assertEqual(result.status, LoopStatus.COMPLETED)

    def test_critical_never_calls_downstream_decider(self):
        called = [False]
        risk = RiskProfile(RiskLevel.CRITICAL, ("crisis",), AutonomyMode.CRISIS_SUPPORT, True, False)

        def decide(*_):
            called[0] = True
            return self.proposal()

        result = LoopKernel().run(LoopContract("goal", risk=risk), decide, self.completed)
        self.assertEqual(result.status, LoopStatus.ESCALATED)
        self.assertFalse(called[0])

    def test_critical_level_never_calls_downstream_decider_even_if_profile_is_inconsistent(self):
        called = [False]
        risk = RiskProfile(RiskLevel.CRITICAL, ("crisis",), AutonomyMode.AUTO, False, True)

        def decide(*_):
            called[0] = True
            return self.proposal()

        result = LoopKernel().run(LoopContract("goal", risk=risk), decide, self.completed)
        self.assertEqual(result.status, LoopStatus.ESCALATED)
        self.assertFalse(called[0])

    def test_high_risk_auto_contract_is_invalid(self):
        risk = RiskProfile(RiskLevel.HIGH, ("high",), AutonomyMode.AUTO, False, True)
        result = LoopKernel().run(LoopContract("goal", risk=risk), lambda *_: self.proposal(), self.completed)
        self.assertEqual(result.status, LoopStatus.FAILED)

    def test_budget_stops_before_second_iteration(self):
        contract = LoopContract("goal", token_budget=5, max_iterations=3)
        executed = [False]

        def execute(*_):
            executed[0] = True
            return StepOutcome(LoopStatus.CONTINUE, progress_delta=1)

        result = LoopKernel().run(
            contract,
            lambda *_: StepProposal(ProposedAction("step"), cost_tokens=5),
            execute,
        )
        self.assertEqual(result.status, LoopStatus.BUDGET_EXHAUSTED)
        self.assertFalse(executed[0])

    def test_stale_evidence_cannot_complete(self):
        stale = Evidence(
            "test",
            "passed yesterday",
            observed_at=datetime.now(timezone.utc) - timedelta(days=1),
        )
        result = LoopKernel().run(
            LoopContract("goal", max_evidence_age_seconds=60),
            lambda *_: self.proposal(),
            lambda *_: StepOutcome(LoopStatus.COMPLETED, evidence=(stale,), progress_delta=1),
        )
        self.assertEqual(result.status, LoopStatus.PARTIAL)

    def test_stagnation_blocks(self):
        result = LoopKernel().run(
            LoopContract("goal", max_iterations=5, max_stagnant_iterations=2),
            lambda *_: self.proposal(),
            lambda *_: StepOutcome(LoopStatus.CONTINUE, progress_delta=0),
        )
        self.assertEqual(result.status, LoopStatus.BLOCKED)

    def test_invalid_contract_fails(self):
        result = LoopKernel().run(LoopContract("", max_iterations=0), lambda *_: self.proposal(), self.completed)
        self.assertEqual(result.status, LoopStatus.FAILED)


class MemoryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.path = str(Path(self.temp.name) / "memory.json")
        self.store = JSONMemoryStore(self.path)

    def tearDown(self):
        self.temp.cleanup()

    def test_personal_memory_requires_consent(self):
        with self.assertRaises(PermissionError):
            self.store.add(kind="preference", content="private", source="user")

    def test_memory_capability_is_enabled_by_default(self):
        entry = self.store.add(
            kind="public_fact",
            content="project uses Python",
            source="repository",
            sensitivity=MemorySensitivity.PUBLIC,
        )
        self.assertEqual(entry.status, MemoryStatus.QUARANTINED)

    def test_disabled_memory_does_not_capture(self):
        store = JSONMemoryStore(str(Path(self.temp.name) / "disabled.json"), enabled=False)
        with self.assertRaises(RuntimeError):
            store.add(
                kind="public_fact",
                content="project uses Python",
                source="repository",
                sensitivity=MemorySensitivity.PUBLIC,
            )

    def test_new_memory_is_quarantined(self):
        entry = self.store.add(kind="preference", content="likes mornings", source="user", consent=True)
        self.assertEqual(entry.status, MemoryStatus.QUARANTINED)
        self.assertEqual(self.store.retrieve(), [])

    def test_approved_memory_is_retrievable(self):
        entry = self.store.add(kind="preference", content="likes mornings", source="user", consent=True)
        self.store.approve(entry.id)
        self.assertEqual(self.store.retrieve("mornings")[0].id, entry.id)

    def test_forget_removes_memory(self):
        entry = self.store.add(kind="fact", content="public fact", source="test", sensitivity=MemorySensitivity.PUBLIC)
        self.assertTrue(self.store.forget(entry.id))
        self.assertFalse(self.store.forget(entry.id))

    def test_correction_quarantines_new_version(self):
        entry = self.store.add(kind="preference", content="old", source="user", consent=True, approve=True)
        corrected = self.store.correct(entry.id, "new", consent=True)
        self.assertEqual(corrected.version, 2)
        self.assertEqual(corrected.status, MemoryStatus.QUARANTINED)

    def test_corruption_fails_loudly(self):
        Path(self.path).write_text("not json", encoding="utf-8")
        with self.assertRaises(ValueError):
            self.store.retrieve()

    def test_feedback_requires_consent(self):
        store = FeedbackStore(str(Path(self.temp.name) / "feedback.json"))
        with self.assertRaises(PermissionError):
            store.record("private task", "decision", True, 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
