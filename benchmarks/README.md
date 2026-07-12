# Benchmarks

Real verification, not vibes. Every number here is reproducible by running the benchmark script.

## Router Accuracy (v1)

**What it measures**: does `route(task)` pick the expected pattern?

**Dataset**: 50 human-labeled tasks across 7 categories:
- Trivial (10) - expected `direct_answer`
- Simple verifiable (10) - expected `do_once`
- Bug fixes (8) - expected `pattern:reflexion`
- Refactors/features (8) - expected `pattern:plan_execute`
- Research (7) - expected `pattern:react`
- Content (4) - expected `pattern:self_refine`
- Multi-perspective (3) - expected `pattern:multi_agent`

**Results**:

| Iteration | Accuracy | Notes |
|-----------|----------|-------|
| v1 (initial heuristics) | 54% | First pass, keyword-based |
| v2 (expanded keywords) | 68% | Added more signals per category |
| v3 (priority reorder) | 84% | Fixed decision order: complex check before reversible |
| v4 (failure_mode for no-verify) | 98% | Pick pattern by failure mode, not always react |

**Final**: 49/50 = **98%** on the labeled set.

**Run it yourself**:
```bash
cd benchmarks
python3 router_accuracy.py
```

**Known limitation**: 1 failure - "add rate limiting to all routes" routes to `react` instead of `plan_execute` because "rate limiting" triggers the exploration signal. This is a boundary case; fixing it would require semantic understanding beyond keyword matching.

**Important**: This is a benchmark on **labeled heuristics**, not on real LLM-driven loops. It measures whether the router's decision tree matches human judgment on task type. It does NOT measure whether the resulting loop actually solves the task. For that, we need end-to-end benchmarks (see below).

## Why not SWE-bench?

SWE-bench is the gold standard for agent evaluation, but it requires:
- A full agent runtime (we're methodology, not runtime)
- API credits for LLM calls (we're open-source, can't fund that)
- A specific tool integration (we're tool-agnostic)

Instead, we measure what we CAN measure objectively: **router accuracy**. This is reproducible, free, and honest.

For end-to-end evaluation, users should:
1. Pick a pattern from `core/patterns/`
2. Run it on their own task with their own LLM
3. Record success/failure/cost in `feedback.json` (optional)
4. Compare patterns on the same task

We provide the framework for this in `reference-implementations/python/`.

## Reproducibility

All benchmark scripts are in this directory. To reproduce:

```bash
git clone https://github.com/Madapexai/oh-my-loop.git
cd oh-my-loop/benchmarks
python3 router_accuracy.py
```

Output includes per-task results and a markdown report.
