---
name: example-debugging
description: Example loop for a debugging task. Use as a template for fixing bugs with unknown root cause.
---

# Example: Debugging Loop

Task: "Users report login fails intermittently. No error in logs."

## Analysis

- **Reversible**: yes (debugging doesn't mutate)
- **Verifiable**: yes (reproduce the bug, then verify fix)
- **Complexity**: high (unknown root cause, intermittent)
- **Failure mode**: first hypothesis likely wrong

## Pattern chosen: reflexion

Reasoning: bug is intermittent, first hypothesis probably wrong. Reflexion lets us try, verify, reflect, retry.

## Loop run

### Attempt 1
- Hypothesis: race condition in session creation
- Fix: add mutex around session creation
- Verify: run integration test that triggers 100 concurrent logins
- Result: test still fails intermittently

### Reflect 1
- Mutex didn't help -> not a race condition in session creation
- Logs show: failures cluster around 3-4 AM UTC
- New hypothesis: external dependency (DB connection pool exhaustion?)

### Attempt 2
- Hypothesis: DB connection pool too small, exhausted during nightly batch
- Fix: increase pool size, add connection timeout
- Verify: run integration test during nightly batch window
- Result: test passes 100 times in a row

### Verify (final)
- Deploy fix to staging
- Monitor for 24 hours: 0 failures
- Original symptom gone

### Result
Done. Cost: ~8000 tokens, ~30 minutes. 2 attempts.

## Failure modes considered

- Wrong hypothesis (occurred on attempt 1) -> reflexion handled
- Can't reproduce -> would escalate to user
- Fix too expensive -> would propose cheaper alternative

## Reusable for

- Any intermittent bug with unknown root cause
- Replace the hypotheses and verification commands

## Related

- [reflexion](../../core/patterns/reflexion/SKILL.md) - The pattern used
- [self-questioning](../../core/components/self-questioning/SKILL.md) - For reflecting on failure
