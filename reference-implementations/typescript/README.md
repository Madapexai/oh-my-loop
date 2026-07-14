# Oh My Loop - TypeScript Reference Implementation

Experimental TypeScript port of the model-driven safety router and bounded patterns. End users should use the zero-dependency Node CLI at the repository root.

## Install

```bash
cd reference-implementations/typescript
npm ci
```

## Build

```bash
npm run build
```

## Test

```bash
npm test
```

## Use

```typescript
import { route } from "oh-my-loop";

const result = await route("your task", async (task, protocol) => {
  // Call your model with protocol + task and return its schema_version 2 object.
  return modelClient.classify({ protocol, task });
});
console.log(result.decision);
```

## What's included

- `src/router.ts` - async model callback, schema validation, and deterministic safety gates
- `src/patterns.ts` - coding patterns plus Decision, Habit, and Life Review
- `src/verify.ts` - `verifyBeforeClaim()` gate function
- `src/config.ts` - `LoopConfig` with paper-cited defaults
- `src/feedback.ts` - Optional `FeedbackStore` for persistence

## Compatibility status

Routing policy and termination semantics are tested for parity. The router never infers semantics from rules: missing model configuration, model failure, or invalid structured output fails closed. TypeScript does not yet provide the Python `LoopKernel`, action gates, or governed memory store; do not describe it as full parity.

The configuration exposes memory as enabled with candidate capture by default, but this port does not persist or activate personal memory. The optional Python reference demonstrates a governed persistence layer for contributors.
