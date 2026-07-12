# How Oh My Loop Works

## The problem

AI agents fail in predictable ways. The most common failure is **over-looping**: wrapping every task in a multi-step reasoning loop because "loops are powerful." The second most common is **under-verifying**: claiming a task is done without running any check.

Oh My Loop addresses both by giving agents a router that decides **whether to loop at all**, and patterns that **force verification before completion claims**.

## The router

[using-oh-my-loop](../../using-oh-my-loop/SKILL.md) is the entry point. It runs a decision tree:

1. Is the task trivial? -> answer directly, stop
2. Is it reversible and low-stakes? -> do it once, stop
3. Does it have a verifiable success criteria? -> if not, define one first
4. Is it complex enough to fail on first try? -> if not, execute + verify, stop
5. Choose a pattern by failure mode

This prevents over-looping. Most tasks reach step 2 and stop.

## The patterns

Five patterns, chosen by failure mode (not by preference):

- **react** - you don't know the steps upfront
- **reflexion** - first attempt likely wrong, can verify
- **plan-execute** - steps known, might execute wrong
- **self-refine** - output needs polishing, not fixing
- **multi-agent** - needs multiple perspectives

Each pattern has:
- **Termination conditions** - no infinite loops
- **Checkpoints** - entry, exit, failure, escalation
- **Constraints** - cost, time, degradation path
- **A worked example**

## The components

Four composable pieces for custom loops:

- **verify-before-claim** - gate function preventing unverified claims
- **task-decomposition** - breaking tasks into verifiable subtasks
- **feedback-loop** - capturing outcomes to improve future runs
- **self-questioning** - multi-perspective check before committing

## The three priorities

Every task trades off **effect**, **cost**, and **efficiency**. The router decides based on context:

| Task type | Priority | Default behavior |
|---|---|---|
| Production bugfix, irreversible action | Effect first | reflexion + verifier |
| One-off draft, prototype | Efficiency first | single pass + self-refine |
| Expensive API, batch processing | Cost first | cheap model, minimal rounds |
| Exploration, research | Effect first | react, multiple rounds |

The router does not ask the user to choose. It decides based on the task.

## Human-in-the-loop

Only three cases trigger a pause for human confirmation:

1. **Irreversible action** - delete, deploy, payment, mass email
2. **User data mutation** - modify database, write to user storage
3. **Cost exceeds threshold** - over budget

Everything else: the agent decides and acts.

## Designing your own loop

If the five patterns don't fit, use [write-a-loop](../../write-a-loop/SKILL.md). It enforces a 5-step hard flow:

1. **Define goal** - including at least 3 failure modes
2. **Choose pattern** - by dominant failure mode
3. **Define checkpoints** - entry, exit, failure, escalation
4. **Define constraints** - budget, irreversible, degradation path
5. **Write & test** - test against your own failure modes

The hard rule: **if you can't list failure modes, you don't understand the task yet.**

## What this is not

- Not an agent framework (no runtime, no orchestration engine)
- Not a prompt library (no canned prompts)
- Not a company SOP (no internal tools or proprietary names)
- Not a "loop for everything" wrapper

It's a methodology: patterns + components + examples that you compose into loops for your tasks.
