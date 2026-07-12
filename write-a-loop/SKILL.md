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
