---
name: multi-agent
description: Multi-perspective loop for complex tasks needing different roles
---

# Multi-Agent Pattern

Spawn specialized agents for different roles. Use when one perspective isn't enough.

## When to use

- Complex tasks needing planning + execution + verification + reflection
- Tasks where a second opinion catches errors
- Cross-domain tasks (e.g. code + legal review)

## When NOT to use

- Single-domain task -> use single-agent pattern
- Cost-sensitive -> multi-agent doubles cost
- Simple coordination -> one agent with multiple tools is enough

## The loop

```
Planner: break down task, assign roles
Executor(s): do the work (can be parallel)
Verifier: check the output
Reflector: learn from any failures
-> if verifier passes: done
-> if fails: reflector feeds back to planner
```

**Termination**: max 2 rounds of plan-execute-verify-reflect.

## Checkpoints

- **Entry**: task is complex enough to warrant multiple agents
- **Exit**: verifier passes, or 2 rounds exhausted
- **Failure**: 2 rounds fail -> escalate to user with analysis
- **Coordination**: agents receive immutable snapshots and return versioned proposals. A coordinator validates and merges; no role silently mutates another role's state.

## Constraints

- **Cost budget**: parallel agents multiply cost; budget accordingly
- **Degradation**: if budget is low, stop with a partial result or merge non-safety roles. Never remove an independent verifier required by the contract.
- **Human-in-loop**: if any agent proposes irreversible action, pause

## Roles and when to spawn them

| Role | When to spawn |
|---|---|
| Planner | Task has >3 subtasks |
| Executor (multiple) | Subtasks are independent |
| Verifier | Output has objective success criteria |
| Reflector | First attempt failed and cause is unclear |

**Do not spawn all 4 by default.** Only spawn what the failure modes demand.

Role names do not create independence. Use different evidence, prompts, tools, or reviewers where correlated error matters, and disclose when several roles are the same model. The verifier cannot approve its own unsupported assertion.

## Example

Task: "Refactor the auth module to support OAuth"

```
Planner: 4 subtasks - design, implement, test, docs
Executor 1 (design): propose OAuth flow
Executor 2 (test): write tests for OAuth flow (parallel)
Verifier: run tests, check design
-> tests fail (missing token refresh)
Reflector: token refresh needs explicit handling
Planner: re-plan, add token refresh subtask
Executor: implement refresh
Verifier: tests pass
-> done
```

## Related

- [plan-execute](../plan-execute/SKILL.md) - Single-agent version
- [verify-before-claim](../../components/verify-before-claim/SKILL.md) - Verifier role
