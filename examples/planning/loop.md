---
name: example-planning
description: Example loop for planning a migration with unknown steps. Use as a template for exploratory planning tasks.
---

# Example: Planning Loop

Task: "Plan a 2-week migration from REST to GraphQL."

## Analysis

- **Reversible**: yes (planning is read-only, plan can be revised)
- **Verifiable**: yes (plan covers all REST endpoints, has a rollback strategy)
- **Complexity**: high (unknown codebase, unknown dependencies, unknown steps)
- **Failure mode**: miss existing endpoints, underestimate complexity, no rollback plan

## Pattern chosen: react

Reasoning: don't know the codebase shape upfront. Need to explore: which REST endpoints exist, which clients consume them, which are internal vs external. Can't plan until we explore.

## Loop run

### Thought 1
Need to know the scope. How many REST endpoints exist today?

### Action 1
`grep -r "@app.route\|@router\." api/ --include="*.py" | wc -l`

### Observation 1
47 endpoints across 8 modules. Too many to migrate in 2 weeks at once - need to phase.

### Thought 2
Need to know which endpoints are external (breaking changes hurt clients) vs internal.

### Action 2
Check API docs + client SDK usage: `grep -r "api.example.com" clients/`

### Observation 2
- 12 endpoints are public (used by mobile + web SDK)
- 35 are internal (used only by our own services)
- Public endpoints have stricter backward-compat requirements

### Thought 3
Need to know schema shape. GraphQL needs a unified schema - are the REST payloads consistent?

### Action 3
Sample 5 endpoints, inspect request/response shapes.

### Observation 3
- Inconsistent: some return `{data: ...}`, some return raw objects, some return `{result, meta}`
- Will need a normalization layer in the GraphQL resolvers
- This adds ~2 days to the estimate

### Thought 4
Have enough to draft a phased plan. Stop exploring.

### Result
Plan:
- Week 1: Phase 1 - internal endpoints (35), build schema, resolvers, normalization layer
- Week 2: Phase 2 - public endpoints (12), backward-compat layer, client SDK update
- Rollback: feature flag per endpoint group, can switch back to REST in <5 min
- Risk: normalization layer adds ~2 days; budget for it explicitly

Cost: ~3500 tokens, ~20 minutes. 4 iterations (under 10 max).

## Failure branch

What if the loop fails? One realistic failure scenario and how react handles it.

- **Failure**: After Action 1, the agent counted 47 endpoints and nearly drafted a plan assuming uniform migration cost. It missed that 12 of those are public (external clients) with stricter compat requirements.
- **Handling**: react's Observation phase checks "do I have enough to plan safely?" - the answer is no, because the agent hasn't distinguished public from internal. Action 2 is spawned: check client SDK usage. The new observation (12 public, 35 internal) forces a re-think: the plan must phase public endpoints separately.
- **Result**: The final plan has 2 phases (internal first, public second) with a backward-compat layer. Without react's observe-and-decide-more loop, the plan would have treated all 47 endpoints the same and broken mobile clients in week 1.

## Why this pattern, not others

- **Why not plan-execute?** Can't plan upfront - the scope (47 endpoints), the public/internal split, and the schema inconsistency were all unknown until we explored. Plan-execute needs a fixed subtask list; migration planning needs to discover the list first.
- **Why not reflexion?** Not a "try, fail, retry" task. There's no failed attempt to reflect on - we're gathering information to prevent failure, not reacting to it.
- **Why not multi-agent?** Single planner exploring a single codebase. The challenge is depth of exploration, not breadth of perspective. Spinning up parallel planners would produce 3 plans, not 1 better plan.
- **Why not self-refine?** The plan is verifiable (covers all endpoints, has rollback), not subjective prose. There's nothing to "polish" - either the plan covers the scope or it doesn't.

## Related

- [react](../../core/patterns/react/SKILL.md) - The pattern used
- [task-decomposition](../../core/components/task-decomposition/SKILL.md) - Phase the migration
- [verify-before-claim](../../core/components/verify-before-claim/SKILL.md) - Plan must cover all endpoints
