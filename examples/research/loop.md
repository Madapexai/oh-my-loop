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
