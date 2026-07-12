/** Configuration for loop patterns. All limits are tunable. */

export interface LoopConfig {
  /** react: max iterations before giving up.
   * Why 10? Empirical: most exploration tasks converge within 5-8 steps.
   * (Reflexion paper, Shinn et al. 2023, shows diminishing returns after ~6) */
  reactMaxIterations: number;

  /** reflexion: max attempts before escalating.
   * Why 3? Reflexion paper shows 3rd attempt rarely improves; 4th+ is noise */
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
  costBudgetTokens: null,
  humanConfirmCostThreshold: 10000,
  primaryModel: "gpt-4o",
  cheapModel: "gpt-4o-mini",
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
