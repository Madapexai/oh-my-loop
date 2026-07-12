---
name: write-a-loop
description: Design a new agentic loop for a task that doesn't fit existing patterns. Use this when you need to build a custom loop, not when you just need to run one.
---

# Write a Loop

You need to design a new loop for a task that existing patterns don't cover. This skill walks you through the 5-step hard flow. **Do not skip steps.**

## Before you start

**Have you checked if an existing pattern works?** Read [using-oh-my-loop](../using-oh-my-loop/SKILL.md) first. Most tasks fit react / reflexion / plan-execute / self-refine / multi-agent. Only design a new loop if none of them fit.

## The 5-step hard flow

### Step 1: Define the goal

Answer these in order. If you can't answer any of them, stop and ask the user.

- **What** is the task? (one sentence)
- **Why** does it matter? (what problem does solving it solve)
- **What does success look like?** (objective, verifiable criteria)
- **What does failure look like?** (list the failure modes)

**Failure modes are mandatory.** If you can't list at least 3 ways this loop could fail, you don't understand the task yet. Examples of failure modes:

- LLM hallucinates a non-existent API
- Tool returns stale data
- Context window overflows
- Cost exceeds budget before completion
- Infinite loop, never terminates
- Output looks right but is subtly wrong

### Step 2: Choose the pattern

Based on the failure modes, pick a base pattern:

| Dominant failure mode | Base pattern |
|---|---|
| Unknown steps | react |
| Wrong execution | plan-execute |
| First attempt wrong | reflexion |
| Needs polishing | self-refine |
| Needs multiple perspectives | multi-agent |
| None of the above | Design from scratch (you're here) |

If you're designing from scratch, identify the **minimal** set of roles you need:

- **Planner** - breaks down the task
- **Executor** - does the work
- **Verifier** - checks the output
- **Reflector** - learns from failure

Not every loop needs all 4. Simple loops skip Planner and Reflector. Only add a role if a failure mode demands it.

### Step 3: Define checkpoints

For each step in your loop, define:

- **Entry condition** - what must be true to start this step
- **Exit condition** - what must be true to finish this step
- **Failure condition** - what triggers a retry or rollback
- **Escalation** - when to stop and ask the user

**Example:**

```
Step: Execute
  Entry: Plan exists, has <5 subtasks
  Exit: All subtasks completed, each has output
  Failure: Subtask fails 3 times -> rollback, go to Reflector
  Escalation: 2 rollback cycles -> ask user
```

**Hard rule: every step must have a max retry count.** Loops without retry limits run forever.

### Step 4: Define constraints

- **Cost budget** - max tokens / max $ / max API calls
- **Time budget** - max wall-clock time
- **Irreversible actions** - which steps need human confirmation
- **Degradation path** - what to do when budget runs out (cheap model? skip verifier? return partial?)

**Degradation is mandatory.** If your loop can't degrade gracefully when resources run low, it will fail in production. Define at least one fallback:

```
If cost > 50% budget: switch to cheaper model for remaining steps
If cost > 80% budget: skip Reflector, return current output
If cost > 100% budget: stop, return partial output + status
```

### Step 5: Write & test

Write the loop as a skill (see [examples/](../examples/) for templates). Then test:

1. **Happy path** - does it complete the normal case?
2. **Each failure mode** - does it handle the 3+ failures you listed in Step 1?
3. **Budget exhaustion** - does it degrade gracefully?
4. **Irreversible action** - does it pause for confirmation?

If any test fails, go back to the step that's broken. Do not publish a loop that hasn't been tested against its own failure modes.

## Anti-patterns (do not do these)

- **"Infinite reflection"** - reflecting forever without terminating. Always set a max.
- **"Verification theater"** - verifying with a check that can't fail. Make sure your verifier can actually catch failures.
- **"Loop for everything"** - wrapping single-step tasks in a loop. If it's one step, just do it.
- **"No degradation"** - assuming infinite budget. Always define what happens when you run out.
- **"Human-in-the-loop everywhere"** - pausing for every step. Only pause for irreversible / data-mutating / over-budget.

## Related

- [using-oh-my-loop](../using-oh-my-loop/SKILL.md) - When to loop vs not
- [core/patterns/](../core/patterns/) - Existing patterns to extend
- [core/components/](../core/components/) - Reusable pieces
- [examples/](../examples/) - Few-shot templates


## Dogfooding: how we designed Oh My Loop itself

We used this 5-step flow to design Oh My Loop. Here's the record.

### Step 1: Define goal

- **What**: A methodology that helps anyone design a good agentic loop
- **Why**: Most people don't know when to loop, which pattern to use, or when to stop. Existing frameworks (LangGraph, AutoGen) provide runtime but not methodology.
- **Success**: A user can pick the right pattern in <5 minutes; a new loop can be designed in <30 minutes following the 5-step flow
- **Failure modes**:
  1. User wraps every task in a loop (over-engineering)
  2. User claims "done" without verifying (under-verifying)
  3. User asks which pattern to use instead of deciding from context
  4. Patterns are too abstract to compose
  5. No code implementation - "PPT open source"

### Step 2: Choose pattern

- Failure mode #1 (over-engineering) -> `using-oh-my-loop` router decides if loop is needed
- Failure mode #2 (under-verifying) -> `verify-before-claim` component
- Failure mode #3 (user picks) -> router auto-decides by failure mode
- Failure mode #4 (too abstract) -> examples show concrete composition
- Failure mode #5 (no code) -> `reference-implementations/` provides Python+TS

### Step 3: Checkpoints

- Entry: user has a task
- Exit: user knows if they need a loop, and if so, which pattern
- Failure: user still asks "which pattern" -> router didn't decide clearly enough
- Escalation: pattern doesn't fit -> user reads `write-a-loop` and designs custom

### Step 4: Constraints

- Cost: zero (no LLM calls in router, pure heuristics)
- Time: <5 minutes to route, <30 minutes to design new loop
- Irreversible: none (methodology doesn't mutate state)
- Degradation: if router unsure, default to `execute_verify` (simpler is better)

### Step 5: Write & test

- Wrote 5 patterns, 5 components, 8 examples
- Tested router against 50 labeled tasks: 98% accuracy (see `benchmarks/`)
- Tested against failure modes:
  - #1 over-engineering: router returns `direct_answer` for trivial tasks ✅
  - #2 under-verifying: `verify-before-claim` is a hard gate ✅
  - #3 user picks: router auto-decides ✅
  - #4 too abstract: examples show concrete use ✅
  - #5 no code: Python+TS implementations ✅

**Honest limitation**: The benchmark measures router decision accuracy, not end-to-end loop success. End-to-end success depends on the LLM and tools the user brings. We can't benchmark that without API credits.
