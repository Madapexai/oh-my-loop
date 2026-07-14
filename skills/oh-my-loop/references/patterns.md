# Loop primitives

| Dominant uncertainty | Behavior | Stop condition |
|---|---|---|
| none; low-risk response | direct | answer delivered |
| one reversible action | do once | action observed |
| simple objective task | execute + verify | independent checks pass |
| steps discovered through action | react | answer/evidence or bounded stop |
| plan known, execution fragile | plan-execute | every non-empty step verified |
| attempt has an objective oracle | reflexion | oracle passes or retry limit |
| artifact needs critique | self-refine | acceptance rubric passes or partial |
| independent viewpoints reduce error | multi-agent | synthesized evidence passes |
| human choice under uncertainty | decision | decision brief; user chooses |
| repeated behavior | habit | review date and continue/change/stop |
| periodic reflection | life-review | one bounded experiment or no action |

This table is a vocabulary, not a router allowlist. The model may use none, select one, compose several, or describe a task-specific bounded strategy. Every generated loop must include observation-driven adaptation, evidence, budgets, and stop conditions.

Primitives compose but do not expand authority. Multi-agent roles are not independent when they share a model, prompt, evidence, or mutable state. Never remove a required verifier or safety gate as a budget degradation.
