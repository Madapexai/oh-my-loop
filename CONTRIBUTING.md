# Contributing to Oh My Loop

Thanks for your interest! This project accepts contributions that make loops smarter, not more complex.

## What we accept

### New patterns

A new pattern is accepted if:
- It handles a failure mode that existing patterns don't
- It has a clear "when to use / when NOT to use"
- It has termination conditions (no infinite loops)
- It has at least one end-to-end example

### New examples

A new example is accepted if:
- It's end-to-end (analysis, pattern choice, loop run, result)
- It includes verification commands
- It's not company-specific (no internal tools, no proprietary names)

### Improvements to existing patterns

Improvements are accepted if:
- They address a failure mode the current pattern misses
- They don't add complexity without value

## What we do NOT accept

- Company-specific SOPs disguised as generic patterns
- "Loop for everything" wrappers (if it's one step, just do it)
- Patterns without failure-mode analysis
- Patterns that ask the user to choose instead of deciding based on context
- Anything that bakes in a specific tool/vendor

## How to contribute

1. Fork the repo
2. Read [using-oh-my-loop](using-oh-my-loop/SKILL.md) and [write-a-loop](write-a-loop/SKILL.md) first
3. Create your pattern/example following the existing structure
4. Test it against at least 3 scenarios
5. Open a PR with:
   - The new file(s)
   - A brief explanation of what failure mode it addresses
   - At least one worked example

## Skill writing conventions

- All skill content in English (docs can be bilingual)
- Use YAML frontmatter with name + description
- Description is a trigger ("when to use me"), not a summary
- Use progressive disclosure: short SKILL.md, details in references/
- Every pattern must have termination conditions
- Every pattern must have a degradation path

## License

By contributing, you agree your contributions are licensed under the MIT license.
