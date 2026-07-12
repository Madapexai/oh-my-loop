---
name: example-content
description: Example loop for a content task. Use as a template for writing tasks that need polish.
---

# Example: Content Loop

Task: "Write a launch blog post for our new open-source project."

## Analysis

- **Reversible**: yes (drafts can be revised)
- **Verifiable**: subjective, but has quality dimensions (clarity, structure, hook)
- **Complexity**: medium (single output, but needs polish)
- **Failure mode**: flat writing, no hook, too long

## Pattern chosen: self-refine

Reasoning: output needs polishing, not fixing. Generate, critique, refine.

## Loop run

### Generate (round 1)
Draft: 800 words, covers features, install, examples.

### Critique 1
- Hook weak (starts with "We are excited to announce")
- No install section until paragraph 5
- No examples in first half
- Tone too corporate

### Refine 1
- New hook: "Stop writing prompts from scratch."
- Move install to paragraph 2
- Add code example in first half
- Tone: direct, developer-friendly

### Critique 2
- Better hook
- Install section assumes Linux
- Missing "why this matters"

### Refine 2
- Add Windows/macOS install
- Add "why this matters" section after hook

### Critique 3
- Good enough
- Minor: could add a comparison table

### Result
Done. Cost: ~4000 tokens, ~10 minutes. 3 rounds (diminishing returns reached).

## Failure modes considered

- Flat writing -> critique forced hook + structure changes
- Too long -> kept to 800 words, refined instead of adding
- Perfectionism -> max 3 rounds, stopped when "good enough"

## Reusable for

- Any writing task that needs polish
- Replace the critique dimensions

## Related

- [self-refine](../../core/patterns/self-refine/SKILL.md) - The pattern used
