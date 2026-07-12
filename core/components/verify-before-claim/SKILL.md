---
name: verify-before-claim
description: Gate function that prevents claiming a task is done without running fresh verification. Use before any "I'm done" claim.
---

# Verify Before Claim

**Iron rule: No completion claims without fresh verification evidence.**

Skipping verification is not efficiency, it's dishonesty.

## The gate function

```
1. IDENTIFY: what command/output proves this claim?
2. RUN: execute it (fresh, not cached)
3. READ: full output + exit code + failure count
4. VERIFY: does output confirm the claim?
   - NO  -> state actual status with evidence
   - YES -> claim with evidence
5. CLAIM: only after YES

Skipping any step = lying, not verifying.
```

## Common claims and required verification

| Claim | Required verification | Not enough |
|---|---|---|
| Tests pass | Test command output: 0 failures | "Should pass" |
| Build succeeds | Build command: exit 0 | "Looks right" |
| Bug fixed | Original symptom no longer reproduces | "Code changed" |
| Refactor done | Diff shows only intended changes + tests pass | "Compiles" |

## Red flags (stop if you hear yourself thinking these)

- "Should be fine" -> RUN the verification
- "I'm sure" -> certainty is not evidence
- "Just this once" -> no exceptions
- "Looks right" -> looks is not verified
- "Trust me" -> trust requires evidence

## Anti-patterns

- **Verification theater** - running a check that can't fail. Make sure your verifier can actually catch failures.
- **Cached verification** - "I ran it 10 minutes ago". Run it fresh.
- **Partial verification** - "3 of 4 tests pass". Partial doesn't prove the whole.

## Related

- [reflexion](../../patterns/reflexion/SKILL.md) - Uses this as its verify step
- [task-decomposition](../task-decomposition/SKILL.md) - Defines what to verify
