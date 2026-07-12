---
name: task-decomposition
description: Break a complex task into verifiable subtasks. Use when a task has more than 3 steps or unclear success criteria.
---

# Task Decomposition

Break tasks down until each subtask has clear entry, exit, and verification.

## The decomposition rules

1. **Each subtask must have a single, verifiable outcome.** If you can't state the outcome in one sentence, keep decomposing.
2. **Subtasks should be independent where possible.** Dependencies make loops complex.
3. **Stop decomposing when each subtask is doable in one focused pass.** Over-decomposition wastes planning effort.
4. **Define DoD (Definition of Done) for each subtask.** No DoD = no subtask.

## DoD template

For each subtask, answer:

- **What** must be true to call this done?
- **How** do I verify that? (command, test, output check)
- **When** is the deadline / budget?
- **What** is the failure mode? (what would make this subtask fail)

## Anti-patterns

- **Vague subtasks** - "improve the code" -> improve what, measured how?
- **Over-decomposition** - 20 subtasks for a 1-day task -> you're procrastinating
- **No DoD** - subtask without verification criteria -> you'll never know if it's done

## Related

- [plan-execute](../../patterns/plan-execute/SKILL.md) - Uses this as its plan step
- [verify-before-claim](../verify-before-claim/SKILL.md) - How to verify each subtask
