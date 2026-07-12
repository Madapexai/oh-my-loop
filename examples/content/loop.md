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


## Failure branch

What if the loop fails? One realistic failure scenario and how self-refine handles it.

- **Failure**: Round 1 draft started with "We are excited to announce our new open-source project." - flat hook, buried the install section at paragraph 5, corporate tone throughout. A reader would bounce before reaching the code.
- **Handling**: self-refine's Critique phase evaluates against quality dimensions (hook strength, structure, tone). It doesn't rewrite blindly - it pinpoints 4 specific weaknesses. The Refine phase addresses each one: new hook ("Stop writing prompts from scratch."), install moved to paragraph 2, code example added, tone shifted to direct/developer-friendly.
- **Result**: After 3 rounds, the post has a strong hook, clear structure, and right tone. Critique 3 reports "good enough" - diminishing returns reached, loop terminates. Without self-refine, the first draft would have shipped as-is.

## Why this pattern, not others

- **Why not plan-execute?** Output is subjective prose, not verifiable subtasks. You can't "plan" good writing the way you plan an API endpoint - quality emerges through revision, not decomposition.
- **Why not react?** Not an exploration task. We know what a good launch post looks like (strong hook, clear install, code examples). The challenge is polishing toward that known target, not discovering unknown territory.
- **Why not reflexion?** Writing quality is gradual, not binary pass/fail. Reflexion's "try, fail, reflect, retry" assumes a clear failure signal; a blog post has no such signal - only "is it good enough yet?".
- **Why not multi-agent?** A blog post needs a single voice. Multiple "author agents" would produce inconsistent tone and structure. The critique step in self-refine already plays the reviewer role without the overhead of a full multi-agent setup.
