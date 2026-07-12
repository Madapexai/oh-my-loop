---
name: example-coding
description: Example loop for a coding task (add a feature with tests). Use as a template for your own coding loops.
---

# Example: Coding Loop

Task: "Add a `user_settings` API endpoint that returns and updates user preferences."

## Analysis

- **Reversible**: yes (can delete endpoint)
- **Verifiable**: yes (tests pass, endpoint returns expected response)
- **Complexity**: medium (multi-step but known)
- **Failure mode**: tests fail, schema mismatch

## Pattern chosen: plan-execute

Reasoning: steps are known (route, validation, DB, tests, docs), but execution might have issues. Plan-execute balances planning and verification.

## Loop run

### Plan
1. Add route handler `GET /users/:id/settings`
2. Add route handler `PATCH /users/:id/settings`
3. Add validation (settings schema)
4. Add DB queries (get + update)
5. Write tests (happy path + validation errors + auth)
6. Update API docs

### Execute (each subtask verified)
1. Route handler GET - done, returns 200 with mock data
2. Route handler PATCH - done, returns 200
3. Validation - done, rejects invalid schema with 400
4. DB queries - done, uses existing connection pool
5. Tests - 8 tests, all pass
6. Docs - updated openapi.yaml

### Verify
- `pytest tests/test_user_settings.py` -> 8 passed, 0 failed
- `curl localhost:8000/users/1/settings` -> 200, valid response
- All DoD criteria met

### Result
Done. Cost: ~3000 tokens, ~5 minutes.

## Failure mode not triggered

Predicted failure: "schema mismatch". Did not occur because validation was added before DB queries.

## Reusable for

- Any feature with clear steps and a test suite
- Adjust the plan steps and verification commands

## Related

- [plan-execute](../../core/patterns/plan-execute/SKILL.md) - The pattern used
- [verify-before-claim](../../core/components/verify-before-claim/SKILL.md) - The verification step


## Failure branch

What if the loop fails? One realistic failure scenario and how plan-execute handles it.

- **Failure**: On attempt 1, `pytest tests/test_user_settings.py` reports 2 failures. The validation schema rejected `null` for the `theme` field, but the DB layer expected a default value, causing a `KeyError` when PATCH is called with a partial payload.
- **Handling**: plan-execute detects the failure at the Verify checkpoint. The executor does NOT silently patch - it triggers a re-plan. A new subtask is inserted: "Add default-value coercion in the DB layer for nullable settings fields". The plan is re-executed from that subtask onward.
- **Result**: Attempt 2 runs only the affected subtask + re-verifies. All 8 tests pass. Cost stays within budget because only the failed branch re-ran, not the whole plan.

## Why this pattern, not others

- **Why not react?** Steps were known upfront (route, validation, DB, tests, docs). No exploration needed - the failure was a localized bug, not an unknown landscape.
- **Why not reflexion?** The first attempt was mostly correct (6/8 tests passed). Reflexion's full try-reflect-retry cycle would waste tokens re-deriving the whole plan when only one subtask needs a fix.
- **Why not multi-agent?** Single domain (backend API), single author. Spinning up a security reviewer + performance reviewer for a CRUD endpoint is overkill.
- **Why not self-refine?** Output is binary (tests pass/fail), not subjective prose. There's nothing to "polish" - the failure is a logic bug, not a style issue.
