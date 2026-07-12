---
name: using-oh-my-loop
description: Routes any task to the right loop depth. ALWAYS read this first before deciding to loop. Most tasks don't need a loop at all.
---

# Using Oh My Loop

You are about to start a task. Before you do, read this to decide **whether you need a loop at all, and if so, which one**.

## The core insight

Loops are expensive. A loop burns tokens, time, and attention. Most tasks don't need one. The smartest move is often: **answer directly, no loop, no verification, no reflection**.

This skill exists to prevent you from over-engineering simple tasks.

## Decision tree (run this in your head first)

```
Is the task trivial? (e.g. "what's 2+2", "format this string", "summarize this 200-word email")
├── YES -> Answer directly. Stop. Do not loop. Do not verify. Do not reflect.
└── NO -> continue

Is the task reversible and low-stakes? (e.g. "draft an email", "suggest a function name")
├── YES -> Do it once. Show the result. Stop. No loop needed.
└── NO -> continue

Does the task have a verifiable success criteria? (e.g. "tests pass", "lint clean", "API returns 200")
├── NO -> Define the success criteria first. If you can't, ask the user.
└── YES -> continue

Is the task complex enough to fail on the first try? (e.g. multi-file refactor, debugging, research)
├── NO -> Execute once, verify against the criteria, done.
└── YES -> continue

Choose a loop pattern based on the failure mode (see below).
```

## Choose a loop pattern by failure mode

| If the task can fail because... | Use this pattern | Why |
|---|---|---|
| You don't know all the steps upfront | `core/patterns/react` | Reason + Act, figure it out as you go |
| You know the steps but might do them wrong | `core/patterns/plan-execute` | Plan first, then execute |
| First attempt likely wrong, needs self-correction | `core/patterns/reflexion` | Try, reflect on failure, retry |
| Output needs iterative polishing | `core/patterns/self-refine` | Generate, critique, refine |
| Needs multiple perspectives/roles | `core/patterns/multi-agent` | Spawn specialized agents |

## When NOT to loop (hard rules)

Do NOT loop if any of these are true:

1. **The task is a single, well-defined action.** Just do it.
2. **The output is subjective.** (e.g. "write a creative intro") Looping won't help.
3. **The cost of looping exceeds the value.** (e.g. a $0.50 API call to verify a $0.01 task)
4. **The user asked for speed over correctness.** Respect that.
5. **You've already looped 3 times.** Stop. Escalate to the user with what you have.

## The 3 priorities (auto-balanced, don't ask the user)

Every task has a hidden priority tradeoff between **effect**, **cost**, and **efficiency**. You decide based on context:

| Task type | Priority | Default behavior |
|---|---|---|
| Production bugfix, data migration, irreversible action | Effect first | Use reflexion + verifier, accept cost |
| One-off draft, internal tool, prototype | Efficiency first | Single pass + self-refine, skip verifier |
| Expensive API, batch processing, token-heavy | Cost first | Free model first, minimal loop rounds |
| Exploration, research, unknown territory | Effect first | Use react, accept multiple rounds |

**Do not ask the user "do you want effect/cost/efficiency?"** Decide based on the task. Only ask if the tradeoff is genuinely ambiguous and high-stakes.

## Human-in-the-loop: only 3 cases

Only pause for human confirmation when:

1. **Irreversible action** - delete, deploy, payment, send email to many
2. **User data mutation** - modify database, write to user storage
3. **Cost exceeds threshold** - >$1 per action, or >$10 per session

Everything else: decide and act.

## How to use the rest of this framework

1. Read this skill -> decide if you need a loop
2. If yes, pick a pattern from `core/patterns/`
3. If you're writing a new loop from scratch, read `write-a-loop/` first
4. Look at `examples/` for few-shot templates
5. Use `core/components/` for reusable pieces (verify, decompose, reflect)

## Related

- [write-a-loop](../write-a-loop/SKILL.md) - How to design a new loop
- [core/patterns/](../core/patterns/) - Reusable loop patterns
- [core/components/](../core/components/) - Reusable loop components
- [examples/](../examples/) - Few-shot examples by domain
