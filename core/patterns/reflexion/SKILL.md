---
name: reflexion
description: Self-correction loop for tasks likely to fail on first try
---

# Reflexion Pattern

Try, reflect on failure, retry. Use when the first attempt is likely wrong and you can verify.

## When to use

- Bug fixes where the first hypothesis is often wrong
- Code generation where tests will catch errors
- Tasks with a clear verifier but unclear solution

## When NOT to use

- First attempt is likely correct -> just verify and done
- You can't define a verifier -> reflexion won't help
- Cost-sensitive -> each retry doubles cost

## The loop

```
Attempt: try a solution
Verify: run the verifier
  -> if pass: done
  -> if fail: reflect on why, generate new hypothesis
-> back to Attempt
```

**Termination**: max 3 attempts. After 3 failures, escalate.

## Checkpoints

- **Entry**: verifier exists, failure modes are listable
- **Exit**: verifier passes, or 3 attempts exhausted
- **Failure**: 3 attempts fail -> stop, return best attempt + failure analysis, ask user

## Constraints

- **Cost budget**: each attempt uses same budget; if attempt 2 exceeds 50% budget, downgrade model
- **Degradation**: if 3rd attempt would exceed budget, return attempt 2 + failure analysis
- **Irreversible**: if attempt mutates state, rollback before retry

## Example

Task: "Fix the bug where login fails for users with special chars in password"

```
Attempt 1: escape special chars in SQL query
Verify: run test_login_special_chars
-> fail (test still fails)
Reflect: SQL escape isn't the issue. Check password hashing.
Attempt 2: check password hashing logic
Verify: run test
-> pass
-> done
```

## Related

- [self-refine](../self-refine/SKILL.md) - For polishing, not fixing
- [verify-before-claim](../../components/verify-before-claim/SKILL.md) - The verifier component
