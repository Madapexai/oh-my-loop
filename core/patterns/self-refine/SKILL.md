---
name: self-refine
description: Iterative polishing for output that needs refinement
---

# Self-Refine Pattern

Generate, critique, refine. Use when output needs polishing, not fixing.

## When to use

- Writing (docs, articles, emails)
- Code that works but could be cleaner
- Any output where "good enough" can become "great"

## When NOT to use

- Output is binary (pass/fail) -> use reflexion
- Output is subjective and one pass is fine -> just do it
- Cost-sensitive, no polishing budget -> skip

## The loop

```
Generate: produce initial output
Critique: identify what could be better
Refine: improve based on critique
-> if critique says "good enough": done
-> else: back to Critique
```

**Termination**: max 3 refinements. Diminishing returns after that.

## Checkpoints

- **Entry**: output has quality dimensions that can be critiqued
- **Exit**: critique says "no more improvements needed", or 3 rounds done
- **Failure**: critique keeps finding issues -> return best version, note limitations

## Constraints

- **Cost budget**: refinement is cheap model territory
- **Degradation**: if 3rd round exceeds budget, return round 2
- **Quality bar**: define "good enough" upfront, don't chase perfection

## Example

Task: "Write a README for a new open-source library"

```
Generate: draft README
Critique: intro too long, no install section, missing examples
Refine: shorten intro, add install, add examples
Critique: install assumes Linux, no Windows
Refine: add Windows instructions
Critique: good enough
-> done
```

## Related

- [reflexion](../reflexion/SKILL.md) - For fixing, not polishing
