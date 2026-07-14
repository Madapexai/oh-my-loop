# Trust model

Oh My Loop is an alpha methodology and persistent control-plane runtime. It is designed to reduce predictable loop failures; it does not make model output inherently true or safe.

## Invariants

- Risk and authority are checked before convenience routing.
- The routing model identifies critical risk; once classified, no execution or optimization model is called and automation stops.
- High-impact life decisions keep the user as decision owner.
- External or irreversible action needs exact-action confirmation.
- Completion needs fresh, relevant evidence and harm checks.
- Empty or broken verification fails closed.
- Every run is bounded by iterations, time, cost, stagnation, and cancellation.
- Memory capability is enabled by default. Personal persistence is consent-gated; new entries are quarantined, correctable, expiring, and forgettable.

## Threats considered

Incorrect routing; ambiguous completion; verifier collusion; stale observations; prompt or tool injection; excessive autonomy; budget exhaustion; repeated non-progress; corrupted or poisoned memory; privacy leakage; proxy optimization; dependence; and harm to people who did not consent.

## Boundaries

Semantic routing is model-owned and can still misread euphemisms, cultural context, ambiguity, or adversarial wording. There is no rule-based semantic fallback; missing or invalid model output fails closed. Local run and memory JSON is not encrypted and is unsuitable for secrets or highly sensitive records. The hash chain helps expose modification but cannot stop a local attacker from rewriting the entire chain. The CLI is a persistent control plane, not a sandboxed arbitrary-tool executor; a user or host agent performs proposed actions. Agent Team roles may share correlated model/provider/evidence failures. No implementation replaces emergency, medical, legal, financial, or mental-health services.

## What “completed” means

`completed` means the contract's stated evidence and gates passed in this run. It does not mean the broader life outcome is guaranteed. Other terminal states are first-class: `partial`, `blocked`, `failed`, `escalated`, and `cancelled`.

## Evaluation

Local router evaluations are internal regression evidence, not independent evidence of real-world wellbeing or safety. Generated results are not committed. Trust claims require held-out scenarios, red-team cases, calibration by risk group and language, end-to-end outcome studies, incident reporting, and independent review.
