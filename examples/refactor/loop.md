---
name: example-refactor
description: Example loop for a refactor task. Use as a template for multi-file refactors with regression risk.
---

# Example: Refactor Loop

Task: "Refactor the auth module to support OAuth without breaking existing session auth."

## Analysis

- **Reversible**: yes (git revert)
- **Verifiable**: yes (existing tests pass + new OAuth tests pass)
- **Complexity**: high (multi-file, regression risk)
- **Failure mode**: break existing auth, miss an integration point

## Pattern chosen: multi-agent

Reasoning: high complexity, multiple concerns (design, implementation, testing). Different roles reduce regression risk.

## Loop run

### Round 1

**Planner**: 4 subtasks
1. Design: OAuth flow + how it coexists with session auth
2. Implement: add OAuth routes, keep session routes
3. Test: write OAuth tests, ensure session tests still pass
4. Review: security review of OAuth flow

**Executor 1 (design)**: proposes OAuth flow with shared user model
**Executor 2 (test, parallel)**: writes OAuth tests based on design

**Verifier**: run all tests
- OAuth tests: pass
- Session tests: 2 fail (auth middleware changed signature)

**Reflector**: auth middleware signature change broke session tests. Need to either update tests or keep signature.

### Round 2

**Planner**: re-plan, add subtask "update session tests for new middleware signature"

**Executor**: update tests
**Verifier**: all tests pass (OAuth + session)
**Reflector**: no further issues

### Result
Done. Cost: ~15000 tokens, ~45 minutes. 2 rounds.

## Failure modes considered

- Break existing auth -> verifier caught it, reflector diagnosed
- Miss security issue -> dedicated Review role
- Infinite loop -> max 2 rounds, stopped at 2

## Reusable for

- Any multi-file refactor with regression risk
- Replace the subtasks and roles

## Related

- [multi-agent](../../core/patterns/multi-agent/SKILL.md) - The pattern used
- [verify-before-claim](../../core/components/verify-before-claim/SKILL.md) - The verifier role
