---
name: using-oh-my-loop
description: Route coding and life tasks through risk, consent, decision ownership, verification, and the smallest useful loop.
---

# Use Oh My Loop

Use this order. Never optimize convenience before safety.

Use the current model to infer intent, domain, risk, autonomy, decision ownership, and behavior from meaning and context. Do not use keyword lists, regular expressions, string matching, or task length as semantic routing. If a model decision is unavailable or invalid, fail closed instead of guessing.

## 1. Safety and authority gate

Ask internally:

1. Is there a possible immediate danger to the user or another person? Stop automation, encourage immediate human or emergency support, and do not run a productivity loop.
2. Is this medical, legal, financial, employment, relationship, or another consequential life decision? Give decision support only. The user remains the decision owner.
3. Would an action publish, send, pay, delete, deploy, sign, disclose data, affect another person, or be hard to reverse? Show the exact proposed action and require fresh, action-specific confirmation.
4. Is personal memory involved? Keep the capability available, but persist personal content only with explicit consent. New personal memory starts quarantined.

Uncertainty raises the gate; it never grants more autonomy.

## 2. Write a minimal contract

Define the goal, success evidence, acceptable harm, action boundary, time/cost/iteration budgets, stop conditions, and decision owner. If success cannot be observed, define a reversible experiment instead of pretending the task is verifiable.

## 3. Generate the smallest useful behavior

| Situation | Behavior |
|---|---|
| Low-risk fact or formatting | answer directly |
| Reversible, low-stakes action | do once |
| Simple but objectively checkable | execute + verify |
| Unknown steps | `react` |
| Known plan may be executed incorrectly | `plan-execute` |
| Attempt can be objectively tested and retried | `reflexion` |
| Artifact needs bounded polishing | `self-refine` |
| Independent perspectives materially reduce error | `multi-agent` |
| Meaningful choice under uncertainty | `decision` |
| Repeated behavior and environment design | `habit` |
| Periodic reflection from observations | `life-review` |

The table contains optional primitives, not a closed list. The model may use none, choose one, compose several, or generate a task-specific bounded strategy. Write initial step hypotheses, adaptation rules, success evidence, stop conditions, and a budget. On each iteration, observe first and let the model choose the next action; do not execute the initial plan as a rigid checklist. A decision loop may use research, but research must not silently make the decision.

## 4. Run gates around every action

Before action: check scope, reversibility, other people, privacy, cost, and confirmation. After action: collect fresh evidence, check harm and side effects, then label the outcome `completed`, `partial`, `blocked`, `failed`, or `escalated`.

An empty verifier, verifier exception, missing evidence, or ambiguous completion signal cannot produce `completed`.

## 5. Stop responsibly

Stop on success with evidence, budget exhaustion, cancellation, repeated state, new risk, loss of authority, or failed verification after the retry limit. Return what is known, what is uncertain, what changed, and the safest next step.

## Non-goals

Oh My Loop is not an emergency service, therapist, doctor, lawyer, financial adviser, moral authority, or autonomous life manager. It helps people inspect choices and run reversible experiments.

## Related

- [Design a loop](../write-a-loop/SKILL.md)
- [Risk and consent](../core/components/risk-and-consent/SKILL.md)
- [Memory governance](../core/components/memory-governance/SKILL.md)
- [Trust model](../docs/en/trust-model.md)
