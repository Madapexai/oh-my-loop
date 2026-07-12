/** Loop patterns - executable skeletons for each pattern. */

import type { LoopConfig } from "./config";
import { defaultConfig } from "./config";

export interface LoopResult<T = unknown> {
  success: boolean;
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

  constructor(config?: Partial<LoopConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  abstract run(task: string, fns: Record<string, (...args: unknown[]) => unknown>): LoopResult<T>;
}

export class ReactPattern extends Pattern {
  readonly name = "react";

  run(task: string, fns: Record<string, (...args: unknown[]) => unknown>): LoopResult {
    const thinkFn = fns.thinkFn as (task: string, history: Array<Record<string, unknown>>) => string;
    const actFn = fns.actFn as (thought: string, history: Array<Record<string, unknown>>) => unknown;

    const history: Array<Record<string, unknown>> = [];
    for (let i = 0; i < this.config.reactMaxIterations; i++) {
      const thought = thinkFn(task, history);
      const actionResult = actFn(thought, history);
      history.push({ thought, actionResult, iteration: i + 1 });

      if (thought.toLowerCase().includes("i have the answer") || thought.toLowerCase().includes("done")) {
        return { success: true, output: thought, attempts: 0, iterations: i + 1, costTokens: 0, history };
      }
    }

    const lastThought = history.length > 0 ? (history[history.length - 1].thought as string) : undefined;
    return {
      success: false,
      output: lastThought,
      attempts: 0,
      iterations: this.config.reactMaxIterations,
      costTokens: 0,
      failureReason: `max iterations (${this.config.reactMaxIterations}) reached without answer`,
      history,
    };
  }
}

export class ReflexionPattern extends Pattern {
  readonly name = "reflexion";

  run(task: string, fns: Record<string, (...args: unknown[]) => unknown>): LoopResult {
    const attemptFn = fns.attemptFn as (task: string, history: Array<Record<string, unknown>>) => unknown;
    const verifyFn = fns.verifyFn as (output: unknown) => { pass: boolean };
    const reflectFn = fns.reflectFn as (task: string, output: unknown, verification: { pass: boolean }, history: Array<Record<string, unknown>>) => unknown;

    const history: Array<Record<string, unknown>> = [];
    let bestOutput: unknown = undefined;

    for (let attempt = 0; attempt < this.config.reflexionMaxAttempts; attempt++) {
      const output = attemptFn(task, history);
      const verification = verifyFn(output);
      history.push({ attempt: attempt + 1, output, verification });

      if (verification.pass) {
        return { success: true, output, attempts: attempt + 1, iterations: 0, costTokens: 0, history };
      }

      if (bestOutput === undefined) bestOutput = output;
      const reflection = reflectFn(task, output, verification, history);
      (history[history.length - 1] as Record<string, unknown>).reflection = reflection;
    }

    return {
      success: false,
      output: bestOutput,
      attempts: this.config.reflexionMaxAttempts,
      iterations: 0,
      costTokens: 0,
      failureReason: `max attempts (${this.config.reflexionMaxAttempts}) reached, verifier still failing`,
      history,
    };
  }
}

export class PlanExecutePattern extends Pattern {
  readonly name = "plan_execute";

  run(task: string, fns: Record<string, (...args: unknown[]) => unknown>): LoopResult {
    const planFn = fns.planFn as (task: string, history: Array<Record<string, unknown>>) => unknown[];
    const executeFn = fns.executeFn as (subtask: unknown) => unknown;
    const verifyFn = fns.verifyFn as (subtask: unknown, result: unknown) => { pass: boolean };

    const history: Array<Record<string, unknown>> = [];
    let subtaskResults: Array<Record<string, unknown>> = [];

    for (let replan = 0; replan <= this.config.planExecuteMaxReplans; replan++) {
      const plan = planFn(task, history);
      history.push({ plan, replan });
      subtaskResults = [];

      let allPassed = true;
      for (const subtask of plan) {
        const result = executeFn(subtask);
        const verification = verifyFn(subtask, result);
        subtaskResults.push({ subtask, result, verification });
        if (!verification.pass) {
          allPassed = false;
          break;
        }
      }

      (history[history.length - 1] as Record<string, unknown>).subtaskResults = subtaskResults;

      if (allPassed) {
        return { success: true, output: subtaskResults, attempts: 0, iterations: replan + 1, costTokens: 0, history };
      }
    }

    return {
      success: false,
      output: subtaskResults,
      attempts: 0,
      iterations: this.config.planExecuteMaxReplans + 1,
      costTokens: 0,
      failureReason: `max re-plans (${this.config.planExecuteMaxReplans}) reached`,
      history,
    };
  }
}

export class SelfRefinePattern extends Pattern {
  readonly name = "self_refine";

  run(task: string, fns: Record<string, (...args: unknown[]) => unknown>): LoopResult {
    const generateFn = fns.generateFn as (task: string, opts?: { critique?: string; previous?: unknown }) => unknown;
    const critiqueFn = fns.critiqueFn as (task: string, output: unknown) => string;

    const history: Array<Record<string, unknown>> = [];
    let output = generateFn(task);

    for (let round = 0; round < this.config.selfRefineMaxRounds; round++) {
      const critique = critiqueFn(task, output);
      history.push({ round: round + 1, output, critique });

      if (critique.toLowerCase().includes("good enough") || critique.toLowerCase().includes("no more improvements")) {
        return { success: true, output, attempts: 0, iterations: round + 1, costTokens: 0, history };
      }

      output = generateFn(task, { critique, previous: output });
    }

    history.push({ round: this.config.selfRefineMaxRounds, output, critique: "max rounds reached" });
    return {
      success: true,
      output,
      attempts: 0,
      iterations: this.config.selfRefineMaxRounds,
      costTokens: 0,
      failureReason: "max rounds reached, returning best version",
      history,
    };
  }
}

export class MultiAgentPattern extends Pattern {
  readonly name = "multi_agent";

  run(task: string, fns: Record<string, (...args: unknown[]) => unknown>): LoopResult {
    const plannerFn = fns.plannerFn as (task: string, state: Record<string, unknown>, history: Array<Record<string, unknown>>) => unknown;
    const executorFn = fns.executorFn as (plan: unknown, state: Record<string, unknown>) => unknown;
    const verifierFn = fns.verifierFn as (results: unknown, state: Record<string, unknown>) => { pass: boolean };
    const reflectorFn = fns.reflectorFn as (verification: { pass: boolean }, state: Record<string, unknown>, history: Array<Record<string, unknown>>) => unknown;

    const history: Array<Record<string, unknown>> = [];
    const sharedState: Record<string, unknown> = {};
    let executionResults: unknown = undefined;

    for (let round = 0; round < this.config.multiAgentMaxRounds; round++) {
      const plan = plannerFn(task, sharedState, history);
      sharedState.plan = plan;
      executionResults = executorFn(plan, sharedState);
      sharedState.executionResults = executionResults;
      const verification = verifierFn(executionResults, sharedState);
      sharedState.verification = verification;
      history.push({ round: round + 1, plan, execution: executionResults, verification });

      if (verification.pass) {
        return { success: true, output: executionResults, attempts: 0, iterations: round + 1, costTokens: 0, history };
      }

      const reflection = reflectorFn(verification, sharedState, history);
      sharedState.reflection = reflection;
      (history[history.length - 1] as Record<string, unknown>).reflection = reflection;
    }

    return {
      success: false,
      output: executionResults,
      attempts: 0,
      iterations: this.config.multiAgentMaxRounds,
      costTokens: 0,
      failureReason: `max rounds (${this.config.multiAgentMaxRounds}) reached, escalating`,
      history,
    };
  }
}
