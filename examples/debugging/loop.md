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


## Failure branch

What if the loop fails? One realistic failure scenario and how reflexion handles it.

- **Failure**: Attempt 1 hypothesized a race condition in session creation and added a mutex. The integration test still failed intermittently - the mutex was irrelevant to the actual root cause.
- **Handling**: reflexion's Reflect phase kicks in. Instead of trying another random fix, it re-reads the logs and notices failures cluster around 3-4 AM UTC (nightly batch window). The old hypothesis is discarded; a new hypothesis (DB connection pool exhaustion) is formed from evidence, not guessing.
- **Result**: Attempt 2 increases the pool size and adds a connection timeout. The test passes 100 times in a row. Without the Reflect phase, the agent might have tried 3 more irrelevant fixes and hit the attempt cap.

## Why this pattern, not others

- **Why not react?** We have a specific bug to fix, not open exploration. The shape of the problem is "hypothesize -> verify -> learn", which is exactly reflexion's loop. React's Thought/Action/Observation is for discovering unknown steps, not for converging on a root cause.
- **Why not plan-execute?** The root cause is unknown upfront - we can't plan "step 1: fix the bug" because we don't know what the bug is. Plan-execute needs a decomposable plan; debugging needs trial-and-learn.
- **Why not multi-agent?** Single bug, single fix path. Multiple reviewers won't help - the bottleneck is evidence (logs, reproduction), not perspective.
- **Why not self-refine?** Bug fixing is binary (repro passes or not), not subjective polish. There's no "make the fix better" - there's only "did it work?".
