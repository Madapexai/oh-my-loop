/** Tests for oh_my_loop TypeScript implementation. */

import { route, RouteDecision } from "../src/router";
import { verifyBeforeClaim } from "../src/verify";
import { ReactPattern, ReflexionPattern } from "../src/patterns";
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

// Router tests
function testRouterTrivial(): void {
  const result = route("what's 2+2");
  assert(result.decision === RouteDecision.DirectAnswer, "trivial -> direct_answer");
}

function testRouterReversible(): void {
  const result = route("add a comment to the auth module");
  assert(result.decision === RouteDecision.DoOnce, "reversible + low stakes -> do_once");
}

function testRouterBugFix(): void {
  const result = route("fix the bug where login fails for users with special chars in password");
  assert(result.decision === RouteDecision.Pattern, "bug fix -> pattern");
  assert(result.pattern === "reflexion", "bug fix -> reflexion");
}

function testRouterRefactor(): void {
  const result = route("refactor the auth module to support OAuth without breaking existing session auth");
  assert(result.decision === RouteDecision.Pattern, "refactor -> pattern");
  assert(result.pattern === "plan_execute", "refactor -> plan_execute");
}

function testRouterResearch(): void {
  const result = route("investigate and find the best open-source agent framework for multi-tool multi-agent use case");
  assert(result.decision === RouteDecision.Pattern, "research -> pattern");
  assert(result.pattern === "react", "research -> react");
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

// Run all tests
testRouterTrivial();
testRouterReversible();
testRouterBugFix();
testRouterRefactor();
testRouterResearch();
testVerifyPass();
testVerifyFail();
testReactTerminatesOnAnswer();
testReactTerminatesOnMax();
testReflexionTerminatesOnSuccess();
testReflexionTerminatesOnMax();
testConfigDegradation();
testConfigHumanConfirm();

console.log(`\n${failed === 0 ? "✅" : "❌"} ${passed} tests passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
