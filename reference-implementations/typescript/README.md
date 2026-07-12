# Oh My Loop - TypeScript Reference Implementation

Executable TypeScript port of the Oh My Loop router, patterns, and components.

## Install

```bash
cd reference-implementations/typescript
npm install
```

## Build

```bash
npm run build
```

## Test

```bash
npm test
# ✅ 22 tests passed, 0 failed
```

## Use

```typescript
import { route, RouteDecision } from "oh-my-loop";

const result = route("fix the bug where login fails");
console.log(result.decision); // "pattern"
console.log(result.pattern);  // "reflexion"
```

## What's included

- `src/router.ts` - `route(task)` executable router
- `src/patterns.ts` - 5 pattern classes (React, Reflexion, PlanExecute, SelfRefine, MultiAgent)
- `src/verify.ts` - `verifyBeforeClaim()` gate function
- `src/config.ts` - `LoopConfig` with paper-cited defaults
- `src/feedback.ts` - Optional `FeedbackStore` for persistence

## Parity with Python

The TypeScript implementation mirrors the Python reference. Both pass the same test cases. Router accuracy: 98% on English, 14% on multilingual (keyword-based, documented limitation).
