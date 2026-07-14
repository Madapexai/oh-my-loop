/** Oh My Loop - Reference TypeScript implementation. */

export {
  route,
  analyzeRisk,
  enforcePolicy,
  validateModelDecision,
  MODEL_ROUTER_PROMPT,
  ModelConfigurationError,
  ModelDecisionError,
  RouteDecision,
} from "./router";
export type {
  RouteResult,
  ModelClassifier,
  PatternName,
  RiskLevel,
  RiskProfile,
  AutonomyMode,
  DecisionOwner,
  AgenticLoopPlan,
} from "./router";

export { verifyBeforeClaim } from "./verify";
export type { VerificationResult, VerifyFn, CheckPredicate } from "./verify";

export {
  ReactPattern,
  ReflexionPattern,
  PlanExecutePattern,
  SelfRefinePattern,
  MultiAgentPattern,
  DecisionPattern,
  HabitPattern,
  LifeReviewPattern,
} from "./patterns";
export type { LoopResult, Pattern, LoopStatus, DecisionOption } from "./patterns";

export { defaultConfig, shouldDowngradeModel, shouldHumanConfirm } from "./config";
export type { LoopConfig } from "./config";

export { FeedbackStore } from "./feedback";
export type { FeedbackEntry } from "./feedback";
