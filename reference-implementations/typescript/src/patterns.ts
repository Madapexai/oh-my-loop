/** Bounded, fail-closed loop pattern skeletons. */

import type { LoopConfig } from "./config";
import { defaultConfig } from "./config";

export type LoopStatus = "completed" | "partial" | "failed" | "blocked" | "escalated";

export interface LoopResult<T = unknown> {
  success: boolean;
  status: LoopStatus;
  output?: T;
  attempts: number;
  iterations: number;
  costTokens: number;
  failureReason?: string;
  history: Array<Record<string, unknown>>;
}

export abstract class Pattern<T = unknown> {
  abstract readonly name: string;
  protected config: LoopConfig;
  constructor(config?: Partial<LoopConfig>) { this.config = { ...defaultConfig, ...config }; }
  abstract run(task: string, fns: Record<string, (...args: unknown[]) => unknown>): LoopResult<T>;
}

const fail = (reason: string, history: Array<Record<string, unknown>>, iterations = history.length, output?: unknown): LoopResult => ({
  success: false, status: "partial", output, attempts: 0, iterations, costTokens: 0, failureReason: reason, history,
});

function completionSignal(value: unknown): boolean {
  if (value && typeof value === "object" && "done" in value) return (value as { done?: unknown }).done === true;
  if (typeof value !== "string") return false;
  return /^(done|complete|i have the answer)[.!]?$/i.test(value.trim());
}

export class ReactPattern extends Pattern {
  readonly name = "react";
  run(task: string, fns: Record<string, (...args: unknown[]) => unknown>): LoopResult {
    const think = fns.thinkFn as (task: string, history: Array<Record<string, unknown>>) => unknown;
    const act = fns.actFn as (thought: unknown, history: Array<Record<string, unknown>>) => unknown;
    const history: Array<Record<string, unknown>> = [];
    try {
      for (let i = 0; i < this.config.reactMaxIterations; i++) {
        const thought = think(task, history);
        const actionResult = act(thought, history);
        history.push({ thought, actionResult, iteration: i + 1 });
        if (completionSignal(thought)) return { success: true, status: "completed", output: actionResult, attempts: 0, iterations: i + 1, costTokens: 0, history };
      }
      return fail(`max iterations (${this.config.reactMaxIterations}) reached`, history, history.length, history.at(-1)?.actionResult);
    } catch (e) { return { ...fail("pattern callback failed", history), status: "failed", failureReason: e instanceof Error ? e.message : String(e) }; }
  }
}

export class ReflexionPattern extends Pattern {
  readonly name = "reflexion";
  run(task: string, fns: Record<string, (...args: unknown[]) => unknown>): LoopResult {
    const attemptFn = fns.attemptFn as (task: string, history: Array<Record<string, unknown>>) => unknown;
    const verifyFn = fns.verifyFn as (output: unknown) => { pass?: unknown; score?: number };
    const reflectFn = fns.reflectFn as (task: string, output: unknown, verification: object, history: Array<Record<string, unknown>>) => unknown;
    const history: Array<Record<string, unknown>> = [];
    let best: unknown;
    let bestScore = Number.NEGATIVE_INFINITY;
    try {
      for (let attempt = 0; attempt < this.config.reflexionMaxAttempts; attempt++) {
        const output = attemptFn(task, history);
        const verification = verifyFn(output);
        if (!verification || typeof verification !== "object") throw new Error("verifier must return an object");
        const score = typeof verification.score === "number" ? verification.score : attempt;
        if (score >= bestScore) { best = output; bestScore = score; }
        history.push({ attempt: attempt + 1, output, verification });
        if (verification.pass === true) return { success: true, status: "completed", output, attempts: attempt + 1, iterations: 0, costTokens: 0, history };
        history.at(-1)!.reflection = reflectFn(task, output, verification, history);
      }
      return { ...fail(`max attempts (${this.config.reflexionMaxAttempts}) reached`, history, 0, best), attempts: this.config.reflexionMaxAttempts };
    } catch (e) { return { ...fail("pattern callback failed", history, 0, best), status: "failed", attempts: history.length, failureReason: e instanceof Error ? e.message : String(e) }; }
  }
}

export class PlanExecutePattern extends Pattern {
  readonly name = "plan_execute";
  run(task: string, fns: Record<string, (...args: unknown[]) => unknown>): LoopResult {
    const planFn = fns.planFn as (task: string, history: Array<Record<string, unknown>>) => unknown[];
    const executeFn = fns.executeFn as (subtask: unknown) => unknown;
    const verifyFn = fns.verifyFn as (subtask: unknown, result: unknown) => { pass?: unknown };
    const history: Array<Record<string, unknown>> = [];
    let results: Array<Record<string, unknown>> = [];
    try {
      for (let replan = 0; replan <= this.config.planExecuteMaxReplans; replan++) {
        const plan = planFn(task, history);
        if (!Array.isArray(plan) || plan.length === 0) return { ...fail("planner returned an empty plan", history), status: "failed" };
        results = [];
        history.push({ plan, replan, subtaskResults: results });
        let allPassed = true;
        for (const subtask of plan) {
          const result = executeFn(subtask);
          const verification = verifyFn(subtask, result);
          results.push({ subtask, result, verification });
          if (verification?.pass !== true) { allPassed = false; break; }
        }
        if (allPassed) return { success: true, status: "completed", output: results, attempts: 0, iterations: replan + 1, costTokens: 0, history };
      }
      return fail(`max re-plans (${this.config.planExecuteMaxReplans}) reached`, history, history.length, results);
    } catch (e) { return { ...fail("pattern callback failed", history, history.length, results), status: "failed", failureReason: e instanceof Error ? e.message : String(e) }; }
  }
}

export class SelfRefinePattern extends Pattern {
  readonly name = "self_refine";
  run(task: string, fns: Record<string, (...args: unknown[]) => unknown>): LoopResult {
    const generateFn = fns.generateFn as (task: string, opts?: { critique?: unknown; previous?: unknown }) => unknown;
    const critiqueFn = fns.critiqueFn as (task: string, output: unknown) => unknown;
    const history: Array<Record<string, unknown>> = [];
    let output: unknown;
    try {
      output = generateFn(task);
      for (let round = 0; round < this.config.selfRefineMaxRounds; round++) {
        const critique = critiqueFn(task, output);
        history.push({ round: round + 1, output, critique });
        const accepted = critique && typeof critique === "object"
          ? (critique as { accepted?: unknown }).accepted === true
          : typeof critique === "string" && /^(good enough|no more improvements)[.!]?$/i.test(critique.trim());
        if (accepted) return { success: true, status: "completed", output, attempts: 0, iterations: round + 1, costTokens: 0, history };
        output = generateFn(task, { critique, previous: output });
      }
      return fail("max refinement rounds reached; output is unverified", history, this.config.selfRefineMaxRounds, output);
    } catch (e) { return { ...fail("pattern callback failed", history, history.length, output), status: "failed", failureReason: e instanceof Error ? e.message : String(e) }; }
  }
}

export class MultiAgentPattern extends Pattern {
  readonly name = "multi_agent";
  run(task: string, fns: Record<string, (...args: unknown[]) => unknown>): LoopResult {
    const planner = fns.plannerFn as (task: string, state: Record<string, unknown>, history: Array<Record<string, unknown>>) => unknown;
    const executor = fns.executorFn as (plan: unknown, state: Record<string, unknown>) => unknown;
    const verifier = fns.verifierFn as (results: unknown, state: Record<string, unknown>) => { pass?: unknown };
    const reflector = fns.reflectorFn as (verification: object, state: Record<string, unknown>, history: Array<Record<string, unknown>>) => unknown;
    const history: Array<Record<string, unknown>> = [];
    const state: Record<string, unknown> = {};
    let output: unknown;
    try {
      for (let round = 0; round < this.config.multiAgentMaxRounds; round++) {
        const plan = planner(task, { ...state }, history);
        if (Array.isArray(plan) && plan.length === 0) return { ...fail("planner returned an empty plan", history), status: "failed" };
        output = executor(plan, { ...state, plan });
        const verification = verifier(output, { ...state, plan, executionResults: output });
        history.push({ round: round + 1, plan, execution: output, verification });
        if (verification?.pass === true) return { success: true, status: "completed", output, attempts: 0, iterations: round + 1, costTokens: 0, history };
        state.reflection = reflector(verification, { ...state }, history);
        history.at(-1)!.reflection = state.reflection;
      }
      return { ...fail(`max rounds (${this.config.multiAgentMaxRounds}) reached`, history, history.length, output), status: "escalated" };
    } catch (e) { return { ...fail("pattern callback failed", history, history.length, output), status: "failed", failureReason: e instanceof Error ? e.message : String(e) }; }
  }
}

export interface DecisionOption { name: string; benefits: string[]; costs: string[]; uncertainties: string[]; reversible: boolean; }

export class DecisionPattern extends Pattern {
  readonly name = "decision";
  run(task: string, fns: Record<string, (...args: unknown[]) => unknown>): LoopResult {
    const frame = fns.frameFn as (task: string) => { values?: unknown[]; constraints?: unknown[]; deadline?: unknown };
    const optionsFn = fns.optionsFn as (task: string, frame: object) => DecisionOption[];
    const compare = fns.compareFn as (options: DecisionOption[], frame: object) => unknown;
    const history: Array<Record<string, unknown>> = [];
    try {
      const decisionFrame = frame(task);
      const options = optionsFn(task, decisionFrame);
      if (!Array.isArray(options) || options.length < 2) return { ...fail("decision needs at least two real alternatives", history), status: "blocked" };
      const comparison = compare(options, decisionFrame);
      const output = { decisionOwner: "user", frame: decisionFrame, options, comparison, nextStep: "choose or run a reversible experiment" };
      history.push(output);
      return { success: true, status: "completed", output, attempts: 0, iterations: 1, costTokens: 0, history };
    } catch (e) { return { ...fail("decision analysis failed", history), status: "failed", failureReason: e instanceof Error ? e.message : String(e) }; }
  }
}

export class HabitPattern extends Pattern {
  readonly name = "habit";
  run(task: string, fns: Record<string, (...args: unknown[]) => unknown>): LoopResult {
    const design = fns.designFn as (task: string) => { cue?: unknown; tinyAction?: unknown; observation?: unknown; reviewAt?: unknown };
    const history: Array<Record<string, unknown>> = [];
    try {
      const plan = design(task);
      const required = [plan?.cue, plan?.tinyAction, plan?.observation, plan?.reviewAt];
      if (required.some((v) => v === undefined || v === "")) return { ...fail("habit design must define cue, tiny action, observation, and review", history), status: "blocked" };
      history.push(plan);
      return { success: true, status: "completed", output: { ...plan, rule: "change the environment or action size before blaming the person" }, attempts: 0, iterations: 1, costTokens: 0, history };
    } catch (e) { return { ...fail("habit design failed", history), status: "failed", failureReason: e instanceof Error ? e.message : String(e) }; }
  }
}

export class LifeReviewPattern extends Pattern {
  readonly name = "life_review";
  run(task: string, fns: Record<string, (...args: unknown[]) => unknown>): LoopResult {
    const observe = fns.observeFn as (task: string) => unknown[];
    const synthesize = fns.synthesizeFn as (observations: unknown[]) => unknown;
    const history: Array<Record<string, unknown>> = [];
    try {
      const observations = observe(task);
      if (!Array.isArray(observations) || observations.length === 0) return { ...fail("review requires observations, not retrospective invention", history), status: "blocked" };
      const output = { observations, synthesis: synthesize(observations), nextStep: "choose one bounded experiment and a review date" };
      history.push(output);
      return { success: true, status: "completed", output, attempts: 0, iterations: 1, costTokens: 0, history };
    } catch (e) { return { ...fail("life review failed", history), status: "failed", failureReason: e instanceof Error ? e.message : String(e) }; }
  }
}
