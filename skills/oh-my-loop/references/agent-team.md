# Agent Team

Use `oh-my-loop team "task" --json` when distinct evidence or adversarial perspectives materially reduce error. The planner model chooses 2–6 task-specific roles and a maximum concurrency of 1–4. All roles are advisory and receive the same immutable task snapshot.

Each role separates evidence, inference, uncertainty, risk, and recommendation. The coordinator preserves disagreement. A separate verifier call checks the synthesis against the contract and verification criteria. If a call fails, state becomes `interrupted`; `oh-my-loop resume <id>` preserves completed role proposals and runs only missing work.

Do not interpret role count as evidence. Roles may share a model, provider, training data, and task evidence, so their errors are correlated. For materially independent verification, use different evidence sources or providers and record that provenance; the current portable CLI does not guarantee provider diversity.
