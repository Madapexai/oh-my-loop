---
name: plan-execute
description: Plan then execute for tasks with known steps
---

# Plan-Execute Pattern

Plan first, then execute. Use when you know the steps but might do them wrong.

## When to use

- Multi-file refactors with a clear plan
- Migration scripts
- Feature implementation with known components

## When NOT to use

- You don't know the steps -> use react
- It's a single step -> just do it
- The plan is likely wrong -> use reflexion

## The loop

```
Plan: break task into subtasks
Execute: do each subtask
Verify: check each result
-> if all pass: done
-> if any fail: re-plan that part
```

**Termination**: max 2 re-plans. After that, escalate.

## Checkpoints

- **Entry**: task can be decomposed into <10 subtasks
- **Exit**: all subtasks complete and verified
- **Failure**: subtask fails 2 times -> re-plan, or escalate

## Constraints

- **Cost budget**: plan in cheap model, execute in capable model
- **Degradation**: if budget low, skip verifier for low-risk subtasks
- **Parallel**: independent subtasks can run in parallel

## Example

Task: "Add a new API endpoint /users/:id/settings"

```
Plan:
  1. Add route handler
  2. Add validation
  3. Add DB query
  4. Add tests
  5. Update docs
Execute:
  1. route handler done
  2. validation done
  3. DB query done
  4. tests done, all pass
  5. docs done
Verify: all pass
-> done
```

## Related

- [task-decomposition](../../components/task-decomposition/SKILL.md) - The planner component
- [react](../react/SKILL.md) - When steps are unknown
