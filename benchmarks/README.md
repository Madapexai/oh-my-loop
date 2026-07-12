# Benchmarks

Real verification, not vibes. Every number here is reproducible by running the benchmark script.

## Router Accuracy v2 (250 tasks)

**What it measures**: does `route(task)` pick the expected pattern?

**Dataset**: 250 tasks total:
- 200 English tasks across 7 categories
- 50 multilingual tasks (zh/ja/ko/fr/de)

**Results**:

| Dimension | Tasks | Accuracy |
|-----------|-------|----------|
| **Overall** | 250 | 81.2% |
| English | 200 | **98.0%** |
| Multilingual | 50 | 14.0% (known limitation) |
| v1 subset (regression) | 50 | 98.0% (no regression) |

**English by category**:

| Category | Tasks | Accuracy |
|----------|-------|----------|
| trivial -> direct_answer | 30 | 100% |
| simple_verifiable -> do_once | 30 | 100% |
| bug_fix -> reflexion | 33 | 100% |
| refactor_feature -> plan_execute | 33 | 90.9% |
| research -> react | 27 | 100% |
| content -> self_refine | 24 | 95.8% |
| multi_perspective -> multi_agent | 23 | 100% |

**Multilingual by language**:

| Language | Tasks | Accuracy | Note |
|----------|-------|----------|------|
| zh | 25 | 16.0% | Only 4 trivial-by-length hit |
| ja | 10 | 0.0% | Katakana/hiragana can't match English keywords |
| ko | 5 | 0.0% | No keyword overlap |
| fr | 5 | 20.0% | "refactoriser" contains "refactor" |
| de | 5 | 40.0% | "debugge" contains "debug", "implementiere" contains "implement" |

**Run it**:
```bash
cd benchmarks
python3 router_accuracy_v2.py
```

## Iteration History

| Iteration | Tasks | Accuracy | Change |
|-----------|-------|----------|-------|
| v1 | 50 | 54% | Initial heuristics |
| v1 | 50 | 68% | Expanded keywords |
| v1 | 50 | 84% | Reorder: complex check before reversible |
| v1 | 50 | 98% | Pick pattern by failure mode |
| v2 | 250 | 81.2% | +150 EN tasks (98% EN) + 50 multilingual (14%) |

## Known Failures (honest)

4 English failures (all boundary cases):
1. "add rate limiting to all routes" - react instead of plan_execute
2. "add a new validation layer for inputs" - react instead of plan_execute
3. "add a new dashboard for monitoring" - react instead of plan_execute
4. "write a blog post about our architecture" - multi_agent instead of self_refine

43 multilingual failures: keyword-based router doesn't recognize non-English task descriptions. Fix requires semantic understanding (embedding), not more keywords.

## Why not SWE-bench?

SWE-bench is the gold standard for agent evaluation, but it requires:
- A full agent runtime (we're methodology, not runtime)
- API credits for LLM calls (we're open-source, can't fund that)
- A specific tool integration (we're tool-agnostic)

Instead, we measure what we CAN measure objectively: **router accuracy**. This is reproducible, free, and honest.

## Reproducibility

```bash
git clone https://github.com/Madapexai/oh-my-loop.git
cd oh-my-loop/benchmarks
python3 router_accuracy.py      # v1: 50 tasks, 98%
python3 router_accuracy_v2.py   # v2: 250 tasks, 81.2% (EN 98%, multi 14%)
```
