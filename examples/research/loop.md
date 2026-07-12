---
name: example-research
description: Example loop for a research task. Use as a template for open-ended investigation.
---

# Example: Research Loop

Task: "Find the best open-source agent framework for our use case (multi-tool, multi-agent, low cost)."

## Analysis

- **Reversible**: yes (research is read-only)
- **Verifiable**: yes (criteria defined, evidence collected)
- **Complexity**: high (unknown landscape, many options)
- **Failure mode**: miss good options, biased by first findings

## Pattern chosen: react

Reasoning: don't know all the options upfront. Need to explore, find options, evaluate, possibly find more.

## Loop run

### Thought 1
Need a list of frameworks. Search GitHub and awesome-lists.

### Action 1
WebSearch "open source AI agent framework 2026"

### Observation 1
Found: LangGraph, AutoGen, CrewAI, superpowers, baoyu-skills, Pydantic AI. Need criteria to evaluate.

### Thought 2
Define criteria: multi-tool support, multi-agent, cost, community, docs quality.

### Action 2
Fetch each framework's GitHub README and docs.

### Observation 2
- LangGraph: graph-based, multi-agent, typed
- AutoGen: conversation-based, multi-agent
- CrewAI: role-based, sequential/hierarchical
- superpowers: skill collection, not framework
- Pydantic AI: typed, single-agent focus

### Thought 3
Need to evaluate against criteria. Build comparison matrix.

### Action 3
Build matrix: criteria x frameworks.

### Observation 3
| Framework | Multi-tool | Multi-agent | Cost | Community |
|---|---|---|---|---|
| LangGraph | yes | yes | medium | 10k stars |
| AutoGen | yes | yes | high (conversation) | 54k stars |
| CrewAI | yes | yes | medium | 41k stars |
| Pydantic AI | yes | partial | low | growing |

### Thought 4
Have enough to make a recommendation. Don't need to keep exploring.

### Result
Recommendation: LangGraph or CrewAI for multi-agent. Provide matrix + tradeoffs.
Cost: ~5000 tokens, ~15 minutes. 4 iterations (well under 10 max).

## Failure modes considered

- Miss good options -> searched multiple sources (awesome-lists + GitHub + HN)
- Biased by first findings -> forced to build comparison matrix, considered 6 frameworks
- Infinite exploration -> max 10 iterations, stopped at 4 when enough

## Reusable for

- Any open-ended research with unknown landscape
- Replace the search queries and criteria

## Related

- [react](../../core/patterns/react/SKILL.md) - The pattern used


## Failure branch

What if the loop fails? One realistic failure scenario and how react handles it.

- **Failure**: After Action 1 (WebSearch), only 3 frameworks surfaced (LangGraph, AutoGen, CrewAI). The agent nearly stopped early, missing Pydantic AI and two smaller frameworks that actually fit the "low cost" criterion better.
- **Handling**: react's Observation phase checks against the stated goal ("multi-tool, multi-agent, low cost"). Only 3 options is not enough signal. The agent decides the criteria need a second source - it searches awesome-lists and HN separately, which surfaces 3 more candidates.
- **Result**: The comparison matrix expands from 3 to 6 frameworks. Pydantic AI turns out to be the best fit for the "low cost" axis. Without react's observe-and-decide-more loop, the recommendation would have been biased toward whichever framework ranked first on Google.

## Why this pattern, not others

- **Why not plan-execute?** Can't plan upfront - we don't know how many frameworks exist, what criteria will matter, or when we have "enough". Plan-execute needs a fixed subtask list; research needs to discover the list itself.
- **Why not reflexion?** Not a fix-verify-retry task. There's no "failure" to reflect on - we're gathering information, not correcting a broken attempt. Reflexion's reflect step assumes a verifiable failure; research has no such signal.
- **Why not multi-agent?** Single researcher is fine here. The challenge is exploration depth, not perspective breadth. Spinning up 3 agents to search the same query in parallel would 3x the cost without more coverage.
