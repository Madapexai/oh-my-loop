# Persistent runtime

Use the CLI runtime only when `OH_MY_LOOP_MODEL` is intentionally configured. It provides state, policy gates, and evidence accounting; it does not execute arbitrary actions.

1. Start with `oh-my-loop run "task" --json`.
2. Inspect status, `pending_action`, `expected_evidence`, authority, and contract boundaries. If status is `awaiting_input`, return the requested context with `oh-my-loop input <id> "answer"`.
3. If status is `awaiting_confirmation`, show scope, disclosed data, cost, and the complete `pending_action.confirmation_text`; call `confirm` only with that exact approved text.
4. Perform the action through an authorized user or host tool.
5. Record only the result actually observed: `oh-my-loop observe <id> "evidence" --source tool`.
6. Continue until evidence-backed completion or an honest terminal state. Use `status`, `resume`, or `cancel` as needed.

Every proposal cites existing event hashes. Before an action is exposed, a separate semantic gate checks scope, authority, privacy, affected people, cost, reversibility, and exact contract boundaries. Every event links to the prior SHA-256 hash. After each observation, an independent progress assessment detects stagnation; two consecutive non-advancing rounds stop the loop. Completion must cite observation events and pass a separate verifier model call. Iteration, elapsed-time, and estimated-token budgets stop further model steps.

The token count is a conservative character-based estimate, not provider billing data. Local state uses restricted permissions but is not encrypted. Never place secrets or highly sensitive life information in tasks, observations, or memory.
