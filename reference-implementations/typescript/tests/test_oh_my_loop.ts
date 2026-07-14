/** Tests for oh_my_loop TypeScript implementation. */

import {
  MODEL_ROUTER_PROMPT,
  ModelConfigurationError,
  ModelDecisionError,
  route,
  RouteDecision,
} from "../src/router";
import type { ModelClassifier } from "../src/router";
import { verifyBeforeClaim } from "../src/verify";
import { PlanExecutePattern, ReactPattern, ReflexionPattern, SelfRefinePattern } from "../src/patterns";
import { defaultConfig, shouldDowngradeModel, shouldHumanConfirm } from "../src/config";
import type { LoopConfig } from "../src/config";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`❌ FAIL: ${message}`);
  }
}

function decision(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  const base = {
    schema_version: "2",
    decision: "pattern",
    pattern: "decision",
    domain: "semantic-domain-from-model",
    intent: "model-inferred intent",
    decision_owner: "user",
    confidence: 0.9,
    reason: "model-inferred reason",
    warnings: [],
    risk: {
      level: "low",
      autonomy: "advisory_only",
      reasons: [],
      requires_human: false,
      allow_external_action: false,
    },
    loop: {
      name: "model-authored-loop",
      patterns: ["decision", "custom_observation"],
      strategy: "Act on one hypothesis, observe, and adapt the next step.",
      feedback_type: "mixed",
      steps: ["Run the smallest reversible probe"],
      adaptation_rules: ["Revise the next step when evidence contradicts the hypothesis"],
      success_evidence: ["Fresh evidence satisfies the model-defined outcome"],
      stop_conditions: ["Evidence passes or the loop stops making progress"],
      max_iterations: 5,
    },
  };
  return { ...base, ...overrides, risk: { ...base.risk, ...((overrides.risk as object | undefined) ?? {}) } };
}

const classifier = (value: unknown): ModelClassifier => async () => value;

// Router tests use structured model fixtures; they do not encode task semantics.
async function testRouterUsesModel(): Promise<void> {
  let receivedPrompt = "";
  const result = await route("opaque input", async (_task, prompt) => {
    receivedPrompt = prompt;
    return decision({ decision: "execute_verify", pattern: null, decision_owner: "agent", risk: { autonomy: "auto", allow_external_action: true } });
  });
  assert(result.decision === RouteDecision.ExecuteVerify, "model decision is used");
  assert(receivedPrompt === MODEL_ROUTER_PROMPT && receivedPrompt.includes("Never classify by keyword"), "classifier receives semantic-routing protocol");
}

async function testRouterRequiresModel(): Promise<void> {
  let failedClosed = false;
  try {
    await route("opaque input", undefined as unknown as ModelClassifier);
  } catch (error) {
    failedClosed = error instanceof ModelConfigurationError;
  }
  assert(failedClosed, "missing model classifier fails closed");
}

async function testModelCanComposeAndInventLoopPrimitives(): Promise<void> {
  const result = await route("opaque input", classifier(decision({ pattern: "task_specific_strategy" })));
  assert(result.pattern === "task_specific_strategy", "model can invent a bounded strategy label");
  assert(result.loop?.patterns.includes("custom_observation") === true, "model can compose custom loop primitives");
}

async function testCriticalPolicyGate(): Promise<void> {
  const result = await route("opaque input", classifier(decision({
    decision: "direct_answer",
    pattern: null,
    decision_owner: "agent",
    risk: { level: "critical", autonomy: "auto", allow_external_action: true },
  })));
  assert(result.decision === RouteDecision.Escalate, "critical model classification is forced to escalation");
  assert(result.pattern === "crisis_support" && result.decision_owner === "expert", "critical route uses expert-owned crisis support");
  assert(result.risk.requires_human && !result.risk.allow_external_action, "critical route blocks external automation");
}

async function testAdvisoryPolicyGate(): Promise<void> {
  const result = await route("opaque input", classifier(decision({ decision_owner: "agent" })));
  assert(result.decision === RouteDecision.AssistOnly, "advisory classification is assistance only");
  assert(result.decision_owner === "user" && !result.risk.allow_external_action, "advisory route cannot be agent-owned or externally executed");
}

async function testConfirmationPolicyGate(): Promise<void> {
  const result = await route("opaque input", classifier(decision({
    decision: "do_once",
    pattern: null,
    risk: { level: "high", autonomy: "confirm_before_action", allow_external_action: true },
  })));
  assert(result.decision === RouteDecision.HumanConfirm, "confirmation autonomy requires human confirmation");
  assert(result.risk.requires_human && !result.risk.allow_external_action, "action remains blocked until confirmation");
}

async function testLowConfidenceReducesAutonomy(): Promise<void> {
  const result = await route("opaque input", classifier(decision({
    decision: "do_once",
    pattern: null,
    decision_owner: "agent",
    confidence: 0.3,
    risk: { autonomy: "auto", allow_external_action: true },
  })));
  assert(result.decision === RouteDecision.AssistOnly, "low confidence reduces autonomy");
  assert(result.warnings.length === 1, "low confidence records a warning");
}

async function testInvalidModelOutputFailsClosed(): Promise<void> {
  let failedClosed = false;
  try {
    await route("opaque input", classifier({ schema_version: "2" }));
  } catch (error) {
    failedClosed = error instanceof ModelDecisionError;
  }
  assert(failedClosed, "invalid model output fails closed");
}

// Verify tests
function testVerifyPass(): void {
  const result = verifyBeforeClaim(
    "tests pass",
    () => "all tests passed, 0 failures",
    {
      containsPassed: (o) => String(o).includes("passed"),
      noFailures: (o) => String(o).toLowerCase().includes("0 failures"),
    },
  );
  assert(result.canClaim === true, "verify should pass when all checks pass");
}

function testVerifyFail(): void {
  const result = verifyBeforeClaim(
    "tests pass",
    () => "2 tests failed",
    {
      noFailures: (o) => !String(o).toLowerCase().includes("fail"),
    },
  );
  assert(result.canClaim === false, "verify should fail when a check fails");
}

function testVerifyEmptyFailsClosed(): void {
  const result = verifyBeforeClaim("done", () => "anything", {});
  assert(result.canClaim === false, "empty verifier must fail closed");
}

function testVerifyExceptionFailsClosed(): void {
  const result = verifyBeforeClaim("done", () => { throw new Error("offline"); }, { exists: () => true });
  assert(result.canClaim === false, "verifier exception must fail closed");
}

// Pattern tests
function testReactTerminatesOnAnswer(): void {
  const pattern = new ReactPattern();
  const result = pattern.run("test task", {
    thinkFn: () => "I have the answer",
    actFn: () => "action result",
  });
  assert(result.success === true, "react should succeed on answer");
  assert(result.iterations === 1, "react should terminate in 1 iteration");
}

function testReactTerminatesOnMax(): void {
  let count = 0;
  const pattern = new ReactPattern({ reactMaxIterations: 3 });
  const result = pattern.run("test task", {
    thinkFn: () => `thinking ${++count}`,
    actFn: () => "action result",
  });
  assert(result.success === false, "react should fail at max");
  assert(result.iterations === 3, "react should stop at 3 iterations");
}

function testReactNotDoneDoesNotTerminate(): void {
  const pattern = new ReactPattern({ reactMaxIterations: 1 });
  const result = pattern.run("test", { thinkFn: () => "I'm not done", actFn: () => "partial" });
  assert(result.success === false, "negated done phrase must not terminate");
}

function testReflexionTerminatesOnSuccess(): void {
  const pattern = new ReflexionPattern();
  const result = pattern.run("test", {
    attemptFn: () => "solution",
    verifyFn: () => ({ pass: true }),
    reflectFn: () => "reflection",
  });
  assert(result.success === true, "reflexion should succeed");
  assert(result.attempts === 1, "reflexion should terminate in 1 attempt");
}

function testReflexionTerminatesOnMax(): void {
  let count = 0;
  const pattern = new ReflexionPattern({ reflexionMaxAttempts: 3 });
  const result = pattern.run("test", {
    attemptFn: () => `attempt ${++count}`,
    verifyFn: () => ({ pass: false }),
    reflectFn: () => "try differently",
  });
  assert(result.success === false, "reflexion should fail at max");
  assert(result.attempts === 3, "reflexion should stop at 3 attempts");
  assert(result.output === "attempt 3", "reflexion should return latest/best output");
}

function testEmptyPlanFails(): void {
  const result = new PlanExecutePattern().run("test", {
    planFn: () => [], executeFn: () => "unused", verifyFn: () => ({ pass: true }),
  });
  assert(result.success === false, "empty plan cannot succeed vacuously");
}

function testSelfRefineLimitIsPartial(): void {
  const result = new SelfRefinePattern({ selfRefineMaxRounds: 1 }).run("test", {
    generateFn: () => "draft", critiqueFn: () => "still weak",
  });
  assert(result.success === false && result.status === "partial", "max refinement is partial, not success");
}

// Config tests
function testConfigDegradation(): void {
  const config: LoopConfig = { ...defaultConfig, costBudgetTokens: 10000, cheapModelThreshold: 0.5 };
  assert(shouldDowngradeModel(config, 4000) === false, "no downgrade at 40%");
  assert(shouldDowngradeModel(config, 5000) === true, "downgrade at 50%");
}

function testConfigHumanConfirm(): void {
  const config: LoopConfig = { ...defaultConfig, humanConfirmCostThreshold: 10000 };
  assert(shouldHumanConfirm(config, 9000) === false, "no confirm below threshold");
  assert(shouldHumanConfirm(config, 10000) === true, "confirm at threshold");
}

async function main(): Promise<void> {
  await testRouterUsesModel();
  await testRouterRequiresModel();
  await testModelCanComposeAndInventLoopPrimitives();
  await testCriticalPolicyGate();
  await testAdvisoryPolicyGate();
  await testConfirmationPolicyGate();
  await testLowConfidenceReducesAutonomy();
  await testInvalidModelOutputFailsClosed();
  testVerifyPass();
  testVerifyFail();
  testVerifyEmptyFailsClosed();
  testVerifyExceptionFailsClosed();
  testReactTerminatesOnAnswer();
  testReactTerminatesOnMax();
  testReactNotDoneDoesNotTerminate();
  testReflexionTerminatesOnSuccess();
  testReflexionTerminatesOnMax();
  testEmptyPlanFails();
  testSelfRefineLimitIsPartial();
  testConfigDegradation();
  testConfigHumanConfirm();

  console.log(`\n${failed === 0 ? "✅" : "❌"} ${passed} tests passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
