---
name: feedback-loop
description: Capture and feed back outcomes to improve future runs. Use after any loop to evolve the pattern.
---

# Feedback Loop

A loop that doesn't learn from its outcomes will repeat the same mistakes.

## The feedback cycle

```
1. Run the loop
2. Record outcome (success / failure / partial)
3. If failure: what failure mode? Was it predicted in Step 1?
4. Update the pattern: add the failure mode, adjust checkpoints
5. Next run: the pattern is smarter
```

## What to record

- **Task** - what was attempted
- **Pattern used** - which loop pattern
- **Outcome** - success / failure / partial
- **Failure mode** (if any) - what went wrong
- **Was it predicted?** - did Step 1 list this failure?
- **Cost** - tokens / time / API calls
- **What to change** - pattern adjustment

## Storage and consent

Persistence is off by default. Ask for explicit consent before storing task text or personal outcomes; minimize or redact sensitive content, define retention, and support correction and deletion. New personal learnings should be quarantined until reviewed. A local JSON example is suitable only for non-secret, low-sensitivity use:

```json
{
  "task": "fix login bug",
  "pattern": "reflexion",
  "outcome": "success",
  "attempts": 2,
  "cost_tokens": 5000,
  "failure_modes_predicted": ["wrong hypothesis"],
  "failure_modes_actual": ["wrong hypothesis"],
  "learning": "first hypothesis was wrong, second was right"
}
```

## Anti-patterns

- **Feedback without action** - recording outcomes but never updating patterns
- **Over-recording** - storing every detail -> noise drowns signal
- **Never purging** - old failures dominate; keep recent N, archive the rest
- **Silent persistence** - useful data is still personal data; no consent means no write
- **Poisoned learning** - one incorrect outcome must not become an active rule without review and provenance

## Related

- [self-refine](../../patterns/self-refine/SKILL.md) - Uses feedback to refine
- [memory-governance](../memory-governance/SKILL.md) - Consent, quarantine, correction, and forgetting
