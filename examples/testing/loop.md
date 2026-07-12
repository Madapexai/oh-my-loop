---
name: example-testing
description: Example loop for generating a test suite with a coverage target. Use as a template for test-generation tasks.
---

# Example: Testing Loop

Task: "Generate a test suite for an existing module with 80% coverage target."

## Analysis

- **Reversible**: yes (tests can be deleted)
- **Verifiable**: yes (coverage % is a number, tests pass/fail)
- **Complexity**: medium (decompose by function, write tests per function)
- **Failure mode**: coverage stalls below 80%, tests pass but miss branches

## Pattern chosen: plan-execute

Reasoning: steps are known (enumerate functions, write tests per function, measure coverage, fill gaps). The risk is execution quality, not exploration. Plan-execute lets us decompose by function and verify coverage per subtask.

## Loop run

### Plan
1. Enumerate public functions in `billing/calculator.py` (5 functions: `calc_subtotal`, `apply_discount`, `calc_tax`, `calc_total`, `round_currency`)
2. Write unit tests for each function (happy path + edge cases)
3. Run coverage: `pytest --cov=billing.calculator --cov-report=term-missing`
4. Identify uncovered branches, add targeted tests
5. Verify final coverage >= 80%

### Execute (each subtask verified)
1. Enumerate - done, 5 functions found
2. Write tests per function:
   - `calc_subtotal`: 3 tests (empty cart, single item, multiple items)
   - `apply_discount`: 4 tests (no discount, percent, fixed, stack overflow)
   - `calc_tax`: 3 tests (zero tax, standard rate, exempt category)
   - `calc_total`: 2 tests (composition, negative guard)
   - `round_currency`: 3 tests (round up, round down, banker's rounding)
3. Run coverage: 71% - below target
4. Uncovered branches: `apply_discount` edge case when discount > subtotal; `calc_tax` when category is None
5. Add 2 targeted tests for the uncovered branches
6. Re-run coverage: 84% - above target

### Verify
- `pytest tests/test_calculator.py` -> 15 passed, 0 failed
- `pytest --cov=billing.calculator --cov-report=term-missing` -> 84% coverage
- All DoD criteria met (>= 80% target)

### Result
Done. Cost: ~4500 tokens, ~12 minutes. 1 re-plan (coverage gap fill).

## Failure branch

What if the loop fails? One realistic failure scenario and how plan-execute handles it.

- **Failure**: After step 3, coverage is 71% - below the 80% target. The first test pass missed two branches: `apply_discount` when discount exceeds subtotal, and `calc_tax` when category is None.
- **Handling**: plan-execute doesn't claim "done" at 71%. The Verify checkpoint fails explicitly (71 < 80). The executor re-plans: insert a subtask "Add targeted tests for the 2 uncovered branches reported by `--cov-report=term-missing`". Only the gap-fill subtask re-runs.
- **Result**: Re-run coverage hits 84%. The loop terminates because the Verify checkpoint passes. Without the explicit coverage gate, the agent might have shipped 71% and called it done.

## Why this pattern, not others

- **Why not react?** Steps are known upfront (enumerate, test, measure, fill gaps). No exploration needed - the failure is a measurable gap, not an unknown landscape.
- **Why not reflexion?** The first attempt wasn't "wrong" - it was incomplete (71% is partial success). Reflexion's full retry would waste tokens re-writing tests that already pass.
- **Why not self-refine?** Coverage is a number, not subjective prose. There's nothing to "polish" - either the number hits 80% or it doesn't.
- **Why not multi-agent?** Single module, single test author. Spinning up parallel testers per function would help speed but not quality - the bottleneck is branch discovery, not perspective.

## Related

- [plan-execute](../../core/patterns/plan-execute/SKILL.md) - The pattern used
- [verify-before-claim](../../core/components/verify-before-claim/SKILL.md) - The coverage gate
- [task-decomposition](../../core/components/task-decomposition/SKILL.md) - Decompose by function
