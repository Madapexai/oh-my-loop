/** Configuration for loop patterns. All limits are tunable. */

export interface LoopConfig {
  /** Conservative starter limit; calibrate for the domain. */
  reactMaxIterations: number;

  /** Retry limit; retries are not evidence of improvement. */
  reflexionMaxAttempts: number;

  /** plan-execute: max re-plans before escalating.
   * Why 2? One re-plan handles "got the steps wrong"; two means deeper issue */
  planExecuteMaxReplans: number;

  /** self-refine: max refinements.
   * Why 3? Self-Refine paper (Madaan et al. 2023) shows convergence by round 3 */
  selfRefineMaxRounds: number;

  /** multi-agent: max rounds of plan-execute-verify-reflect.
   * Why 2? Each round doubles cost; more than 2 means task is too complex */
  multiAgentMaxRounds: number;

  /** Wall-clock budget for a loop run. */
  timeBudgetMs: number;

  /** Stop if the same effective state repeats this many times. */
  maxStagnantIterations: number;

  /** Memory capability is available by default; candidates remain quarantined. */
  memoryEnabled: boolean;
  captureMemoryCandidates: boolean;
  activateMemoryAfterReview: boolean;

  /** cost budget (in tokens). null = unlimited */
  costBudgetTokens: number | null;

  /** cost threshold for human confirmation (in tokens) */
  humanConfirmCostThreshold: number;

  /** model tiers for degradation */
  primaryModel: string;
  cheapModel: string;

  /** degradation: switch to cheap model at 50% budget */
  cheapModelThreshold: number;
}

export const defaultConfig: LoopConfig = {
  reactMaxIterations: 10,
  reflexionMaxAttempts: 3,
  planExecuteMaxReplans: 2,
  selfRefineMaxRounds: 3,
  multiAgentMaxRounds: 2,
  timeBudgetMs: 120000,
  maxStagnantIterations: 2,
  memoryEnabled: true,
  captureMemoryCandidates: true,
  activateMemoryAfterReview: true,
  costBudgetTokens: null,
  humanConfirmCostThreshold: 10000,
  primaryModel: "primary",
  cheapModel: "economy",
  cheapModelThreshold: 0.5,
};

export function shouldDowngradeModel(config: LoopConfig, tokensUsed: number): boolean {
  if (config.costBudgetTokens === null) return false;
  const usage = tokensUsed / config.costBudgetTokens;
  return usage >= config.cheapModelThreshold;
}

export function shouldHumanConfirm(config: LoopConfig, tokensUsed: number): boolean {
  return tokensUsed >= config.humanConfirmCostThreshold;
}
