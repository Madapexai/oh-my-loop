/** Oh My Loop - Reference TypeScript implementation. */

export { route, RouteDecision } from "./router";
export type { RouteResult, RoutePredicates, PatternName, FailureMode } from "./router";

export { verifyBeforeClaim } from "./verify";
export type { VerificationResult, VerifyFn, CheckPredicate } from "./verify";

export {
  ReactPattern,
  ReflexionPattern,
  PlanExecutePattern,
  SelfRefinePattern,
  MultiAgentPattern,
} from "./patterns";
export type { LoopResult, Pattern } from "./patterns";

export { defaultConfig, shouldDowngradeModel, shouldHumanConfirm } from "./config";
export type { LoopConfig } from "./config";

export { FeedbackStore } from "./feedback";
export type { FeedbackEntry } from "./feedback";
