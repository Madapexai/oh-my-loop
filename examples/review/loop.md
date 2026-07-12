---
name: example-review
description: Example loop for reviewing a PR across multiple concern dimensions. Use as a template for multi-perspective code review.
---

# Example: Review Loop

Task: "Review a PR for security, performance, and style issues."

## Analysis

- **Reversible**: yes (review is read-only, comments can be edited)
- **Verifiable**: yes (each finding cites a line + rule + severity)
- **Complexity**: high (multiple concern dimensions, easy to miss one)
- **Failure mode**: miss security issue, focus only on style, bias toward one dimension

## Pattern chosen: multi-agent

Reasoning: high complexity across 3 distinct dimensions (security, performance, style). A single reviewer will anchor on whichever dimension they see first. Dedicated reviewer roles per dimension + a synthesizer reduce blind spots.

## Loop run

### Round 1

**Planner**: 4 roles
1. Security reviewer: scan for injection, auth bypass, secret leaks
2. Performance reviewer: scan for N+1 queries, unnecessary allocations, hot paths
3. Style reviewer: scan for naming, structure, consistency with codebase
4. Synthesizer: merge findings, dedupe, rank by severity

**Security reviewer** (parallel):
- `auth.py:42` - SQL query built via string concat -> SQL injection risk (high)
- `auth.py:88` - secret logged in error message (medium)
- No auth check on `DELETE /users/:id` (high)

**Performance reviewer** (parallel):
- `user.py:120` - N+1 query in `get_users_with_settings` (medium)
- `billing.py:55` - `len(list(items))` materializes full list just to count (low)

**Style reviewer** (parallel):
- Inconsistent naming: `getUser` vs `fetch_user` in same module (low)
- `calculate_total` function is 87 lines - extract sub-functions (low)

**Synthesizer**:
- Total findings: 7
- Dedupe: 0 duplicates (dimensions are orthogonal)
- Rank by severity: 2 high (security), 2 medium (security + perf), 3 low (perf + style)
- Output: structured review comment on the PR

### Verify
- Each finding cites a file:line -> yes
- Each finding has a severity + suggested fix -> yes
- No dimension skipped -> all 3 reviewers returned findings

### Result
Done. Cost: ~6000 tokens, ~8 minutes. 1 round (parallel).

## Failure branch

What if the loop fails? One realistic failure scenario and how multi-agent handles it.

- **Failure**: The security reviewer flagged `auth.py:42` as SQL injection (high severity). The synthesizer almost published it - but the performance reviewer noticed the same line uses a parameterized query wrapper that the security reviewer missed. The finding is a false positive.
- **Handling**: multi-agent's synthesizer cross-checks findings across reviewers before publishing. It detects the conflict (security says "injection", performance says "uses parameterized wrapper"), flags it, and asks the security reviewer to re-verify with the wrapper context. The security reviewer retracts the finding.
- **Result**: Final review has 6 findings (not 7). The false positive is caught before it reaches the PR author. Without the cross-reviewer synthesis step, the team would have lost trust in the review bot after one false alarm.

## Why this pattern, not others

- **Why not plan-execute?** Review isn't a "decompose and execute" task - it's a "look at the same thing from 3 angles" task. Plan-execute's linear subtask flow doesn't capture parallel perspectives.
- **Why not react?** Steps are known (review security, review perf, review style, synthesize). No exploration needed - the PR is fixed, the dimensions are fixed.
- **Why not reflexion?** There's no "try, fail, retry" - the review either catches issues or doesn't. Reflexion assumes a verifiable failure signal; review has none until the synthesizer cross-checks.
- **Why not self-refine?** Review findings are factual (file:line + rule), not subjective prose to polish. The value is in coverage of dimensions, not in refining a single output.

## Related

- [multi-agent](../../core/patterns/multi-agent/SKILL.md) - The pattern used
- [self-questioning](../../core/components/self-questioning/SKILL.md) - Multi-perspective check
- [verify-before-claim](../../core/components/verify-before-claim/SKILL.md) - Each finding needs evidence
