---
name: write-a-loop
description: Design a bounded, testable loop contract when existing Oh My Loop behaviors do not cover the task.
---

# Design a Loop Contract

Read [using-oh-my-loop](../using-oh-my-loop/SKILL.md) first. A loop is valid only if it states who owns the decision, what it may do, how progress is observed, and why it will stop.

## Contract

Write all of these fields:

- `goal`: one outcome, not a permanent identity such as “be successful”
- `decision_owner`: user by default for life tasks
- `success_evidence`: observable evidence and freshness requirement
- `harm_guardrails`: outcomes that invalidate apparent success
- `allowed_actions`: explicit capabilities and data scope
- `confirmation_boundary`: irreversible, external, costly, private, or other-person actions
- `budgets`: iterations, time, cost, and tolerated stagnation
- `memory_policy`: capability on by default; candidate quarantine, consent, sensitivity, retention, correction, and forgetting
- `stop_conditions`: completed, partial, blocked, failed, escalated, or cancelled

## Actors and separation

Use only roles demanded by a failure mode: planner, executor, observer/verifier, reflector, human. The verifier needs independent evidence; asking the same model whether its answer looks good is critique, not verification. Multi-agent roles must not share mutable state implicitly.

## Action and observation cycle

For every step define:

1. Entry assumptions and their sources.
2. Proposed action, scope, reversibility, expected effect, and cost.
3. Pre-action gate and required confirmation.
4. Observation method, baseline, freshness, and side-effect checks.
5. Transition on pass, fail, uncertainty, timeout, and cancellation.

## Life-loop questions

Ask more than “did it work?”:

- Why is this the user's goal rather than an inherited or socially rewarded goal?
- Why is a loop better than rest, acceptance, a conversation, or professional help?
- Who benefits, who bears the cost, and who did not consent?
- Which proxy could improve while real wellbeing worsens?
- What evidence would change the recommendation?
- Can the next step be made smaller and reversible?
- When should the loop deliberately end instead of optimizing the person forever?

## Required adversarial tests

Test normal completion plus: empty plan, empty verifier, verifier exception, false completion phrase, stale evidence, repeated state, exhausted budget, cancelled run, prompt/tool injection, corrupted memory, lack of consent, irreversible action, and emergent high risk. Life loops also need tests for user disagreement, changing values, no-action as a valid choice, and harm to another person.

## Acceptance rule

Do not publish a loop without executable tests for its claimed safety properties. Label untested assumptions and product maturity honestly. Never degrade by skipping a required safety or evidence gate; return a partial result instead.
