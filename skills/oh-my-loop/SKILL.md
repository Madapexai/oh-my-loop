---
name: oh-my-loop
description: Route and run bounded, evidence-gated loops for coding, research, decisions, habits, and life reviews. Use when a coding agent needs to decide whether to act once or iterate, verify completion, control risky or irreversible actions, preserve user decision ownership, or use governed memory.
---

# Use Oh My Loop

Apply the smallest loop that can produce trustworthy evidence. Never treat repeated reasoning as evidence.

## Route

1. Read [references/model-routing.md](references/model-routing.md) and use the current agent model to infer intent, domain, risk, autonomy, decision ownership, and the smallest useful behavior from meaning and context.
2. Never use keyword or task-length matching as a fallback.
3. Apply deterministic safety constraints to the structured model decision.
4. Choose direct response, one action, execute-and-verify, or a model-authored adaptive loop.
5. Read [references/safety.md](references/safety.md) for life, external, irreversible, private, costly, or high-impact work.
6. Read [references/patterns.md](references/patterns.md) only when selecting or composing a loop.

Inside a coding agent, do not call a second model: you are the classifier. Use the standalone CLI route only when `OH_MY_LOOP_MODEL` is intentionally configured.

## Contract

State the goal, decision owner, success evidence, harm guardrails, allowed actions, confirmation boundary, budgets, memory policy, and stop conditions. For code changes, derive evidence from the repository's real build, typecheck, lint, and focused tests.

## Act

Treat the loop plan as an initial strategy, not a fixed workflow. Before every iteration, observe current state, let the model choose the next bounded action, and adapt or re-plan when evidence contradicts the current hypothesis. Existing patterns are optional primitives: compose them or create a task-specific strategy when useful.

For a persistent standalone run, read [references/runtime.md](references/runtime.md). The CLI is a control plane: never report a proposed action as executed until a user or host tool returns a fresh observation.

Propose one bounded action at a time. Require fresh, action-specific confirmation before sending, publishing, paying, deleting, deploying, disclosing private data, or affecting another person. Do not substitute a changed action after confirmation.

For consequential life choices, research and compare options but leave the decision and execution to the user. Read [references/life-loops.md](references/life-loops.md).

## Observe and stop

Collect fresh evidence from an independent observation path. Empty checks, verifier errors, stale evidence, ambiguous completion language, or the same model approving its own unsupported claim cannot produce `completed`.

Stop on evidence-backed completion, cancellation, budget exhaustion, repeated non-progress, new risk, loss of authority, or failed verification. Return `partial`, `blocked`, or `escalated` honestly.

## Memory

Keep the memory capability enabled by default. Capture new information only as a quarantined candidate. Require explicit consent before persisting personal or sensitive content and explicit review before activation. Read [references/memory.md](references/memory.md) whenever memory affects a result.

## Agent setup

For Codex, Claude Code, Gemini CLI, or Cursor installation and direct invocation, read [references/agent-integration.md](references/agent-integration.md) or run `oh-my-loop help`.

When independent perspectives materially reduce error, read [references/agent-team.md](references/agent-team.md). Do not create a team merely to inflate confidence or repeat the same reasoning.
