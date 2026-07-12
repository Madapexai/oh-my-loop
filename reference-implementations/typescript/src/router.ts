/** Smart router - decides if a task needs a loop, and which pattern.
 * Executable version of using-oh-my-loop/SKILL.md. */

export enum RouteDecision {
  DirectAnswer = "direct_answer",
  DoOnce = "do_once",
  ExecuteVerify = "execute_verify",
  Pattern = "pattern",
}

export type PatternName =
  | "react"
  | "reflexion"
  | "plan_execute"
  | "self_refine"
  | "multi_agent";

export type FailureMode =
  | "unknown_steps"
  | "wrong_execution"
  | "first_attempt_wrong"
  | "needs_polish"
  | "needs_multiple_perspectives";

export interface RouteResult {
  decision: RouteDecision;
  pattern?: PatternName;
  reason: string;
}

export interface RoutePredicates {
  isTrivial?: (task: string) => boolean;
  isReversible?: (task: string) => boolean;
  hasVerifiableCriteria?: (task: string) => boolean;
  isComplex?: (task: string) => boolean;
  failureMode?: (task: string) => FailureMode;
}

export function route(task: string, predicates: RoutePredicates = {}): RouteResult {
  const isTrivial = predicates.isTrivial ?? defaultIsTrivial;
  const isReversible = predicates.isReversible ?? defaultIsReversible;
  const hasVerifiableCriteria = predicates.hasVerifiableCriteria ?? defaultHasVerifiableCriteria;
  const isComplex = predicates.isComplex ?? defaultIsComplex;
  const failureMode = predicates.failureMode ?? defaultFailureMode;

  if (isTrivial(task)) {
    return { decision: RouteDecision.DirectAnswer, reason: "trivial task, answer directly" };
  }

  if (!hasVerifiableCriteria(task)) {
    if (isComplex(task)) {
      const fm = failureMode(task);
      const patternMapNoVerify: Partial<Record<FailureMode, PatternName>> = {
        unknown_steps: "react",
        needs_multiple_perspectives: "multi_agent",
        needs_polish: "self_refine",
      };
      const pattern = patternMapNoVerify[fm] ?? "react";
      return { decision: RouteDecision.Pattern, pattern, reason: `complex task, failure mode: ${fm}` };
    }
    return {
      decision: RouteDecision.DirectAnswer,
      reason: "no verifiable criteria and not complex - answer directly",
    };
  }

  if (!isComplex(task)) {
    if (isReversible(task)) {
      return { decision: RouteDecision.DoOnce, reason: "reversible + low stakes, do once" };
    }
    return { decision: RouteDecision.ExecuteVerify, reason: "simple + verifiable, execute + verify" };
  }

  // complex task - pick pattern by failure mode
  const fm = failureMode(task);
  const patternMap: Record<FailureMode, PatternName> = {
    unknown_steps: "react",
    wrong_execution: "plan_execute",
    first_attempt_wrong: "reflexion",
    needs_polish: "self_refine",
    needs_multiple_perspectives: "multi_agent",
  };
  const pattern = patternMap[fm];
  return { decision: RouteDecision.Pattern, pattern, reason: `failure mode: ${fm}` };
}

// Default heuristics - override these for your domain
function defaultIsTrivial(task: string): boolean {
  const trivialSignals = [
    "what's 2+2", "format this string", "summarize this email", "translate",
    "what is the", "convert this", "count words", "suggest a name",
    "uppercase", "lowercase", "capital of",
  ];
  const taskLower = task.toLowerCase().trim();
  if (task.length < 15) return true;
  return trivialSignals.some((s) => taskLower.includes(s));
}

function defaultIsReversible(task: string): boolean {
  const irreversibleSignals = ["delete", "deploy", "payment", "send email", "commit", "push", "refund", "drop table", "migration"];
  const bugSignals = ["fix the bug", "fix the intermittent", "fix the race", "fix the off", "broken", "error", "crash", "leak"];
  const taskLower = task.toLowerCase();
  if (taskLower.includes("typo")) return true;
  if (bugSignals.some((s) => taskLower.includes(s))) return false;
  return !irreversibleSignals.some((s) => taskLower.includes(s));
}

function defaultHasVerifiableCriteria(task: string): boolean {
  const verifiableSignals = [
    "test", "lint", "build", "api", "endpoint", "function", "bug", "error",
    "refactor", "implement", "migrate", "module", "feature", "fix",
    "rename", "update", "add a log", "remove", "reorder", "docstring",
    "variable", "import", "version", "blank line", "comment", "type hint",
  ];
  const taskLower = task.toLowerCase();
  return verifiableSignals.some((s) => taskLower.includes(s));
}

function defaultIsComplex(task: string): boolean {
  const complexSignals = [
    "refactor", "debug", "research", "migrate", "multiple files", "design",
    "fix the bug", "fix the intermittent", "fix the race", "fix the off",
    "broken", "error", "crash", "intermittent", "investigate", "explore",
    "find out", "analyze", "plan", "implement", "add a new", "add validation",
    "rate limiting", "competition", "root cause", "architecture", "review",
    "audit", "compliance", "write a readme", "write the api doc",
    "draft the launch", "improve the marketing", "write a blog", "draft a blog",
  ];
  const taskLower = task.toLowerCase();
  return complexSignals.some((s) => taskLower.includes(s)) || task.length > 200;
}

function defaultFailureMode(task: string): FailureMode {
  const taskLower = task.toLowerCase();
  if (["review", "audit", "compliance", "architecture"].some((w) => taskLower.includes(w))) {
    return "needs_multiple_perspectives";
  }
  if (["explore", "find out", "investigate", "research", "unknown", "root cause", "competition"].some((w) => taskLower.includes(w))) {
    return "unknown_steps";
  }
  if (["refactor", "migrate", "implement", "add a new", "add validation", "rate limiting"].some((w) => taskLower.includes(w))) {
    return "wrong_execution";
  }
  if (["bug", "fix", "error", "broken", "fail", "crash", "intermittent", "off-by-one", "leak"].some((w) => taskLower.includes(w))) {
    return "first_attempt_wrong";
  }
  if (["write", "draft", "polish", "improve", "readme", "blog", "documentation", "copy"].some((w) => taskLower.includes(w))) {
    return "needs_polish";
  }
  return "wrong_execution";
}
