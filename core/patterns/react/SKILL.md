---
name: react
description: Reason + Act loop for tasks with unknown steps
---

# ReAct Pattern

Reason + Act. Use when you don't know all the steps upfront and need to figure it out as you go.

## When to use

- The task requires exploration (e.g. "find why this integration broke")
- Steps depend on intermediate results
- You need to call tools and decide next action based on output

## When NOT to use

- You already know all the steps -> use plan-execute
- The task is a single action -> just do it, no loop
- You need to polish output, not explore -> use self-refine

## The loop

```
Thought: what should I do next?
Action: call a tool / take a step
Observation: read the result
-> back to Thought
```

**Termination**: max 10 iterations, or when Thought says "I have the answer".

## Checkpoints

- **Entry**: task has no predefined step list
- **Exit**: answer produced, or 10 iterations reached
- **Failure**: 10 iterations without answer -> stop, return what you found, ask user

## Constraints

- **Cost budget**: switch to cheaper model after 5 iterations
- **Degradation**: if budget exceeded, return partial findings + status

## Example

Task: "Find out why the CI pipeline is failing"

```
Thought: I should check the latest CI run logs
Action: read CI logs
Observation: tests failing in test_auth.py, line 42
Thought: I should look at that test
Action: read test_auth.py
Observation: test expects token expiry but code doesn't handle it
Thought: I should check the auth code
Action: read auth.py
Observation: token expiry logic missing
Thought: I have the answer - token expiry not implemented
-> return answer
```

## Related

- [plan-execute](../plan-execute/SKILL.md) - When you know the steps
- [reflexion](../reflexion/SKILL.md) - When first attempt likely wrong
