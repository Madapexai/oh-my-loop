# Router Accuracy Benchmark v2 Report

**Date**: 2026-07-13

**Tasks**: 250 (200 English + 50 multilingual)

**Overall accuracy**: 203/250 = **81.2%**

**English accuracy**: 196/200 = **98.0%**

**Multilingual accuracy**: 7/50 = **14.0%**

**v1 subset accuracy (regression check)**: 49/50 = **98.0%**

## Methodology

Each task is passed to `route(task)`. The output is compared to a human-labeled expected route. No LLM is invoked; the router uses keyword heuristics only. This is honest measurement of the heuristic decision tree.

## Comparison with v1

| Metric | v1 | v2 | Delta |
|---|---|---|---|
| Total tasks | 50 | 250 | +200 |
| English tasks | 50 | 200 | +150 |
| Multilingual tasks | 0 | 50 | +50 |
| Overall accuracy | 98.0% | 81.2% | -16.8% |
| English accuracy | 98.0% | 98.0% | +0.0% |
| v1 subset accuracy | 98.0% | 98.0% | +0.0% |

## English results by category

| Category | Expected route | Tasks | Correct | Accuracy |
|---|---|---|---|---|
| trivial | direct_answer | 30 | 30 | 100.0% |
| simple_verifiable | do_once | 30 | 30 | 100.0% |
| bug_fix | pattern:reflexion | 33 | 33 | 100.0% |
| refactor_feature | pattern:plan_execute | 33 | 30 | 90.9% |
| research | pattern:react | 27 | 27 | 100.0% |
| content | pattern:self_refine | 24 | 23 | 95.8% |
| multi_perspective | pattern:multi_agent | 23 | 23 | 100.0% |
| **TOTAL** | | **200** | **196** | **98.0%** |

## Multilingual results by language

| Language | Tasks | Correct | Accuracy | Notes |
|---|---|---|---|---|
| zh | 25 | 4 | 16.0% | No Chinese keyword matching; short tasks fall into trivial-by-length. |
| ja | 10 | 0 | 0.0% | No Japanese keyword matching; katakana not recognized. |
| ko | 5 | 0 | 0.0% | No Korean keyword matching. |
| fr | 5 | 1 | 20.0% | Latin script; substring matches sometimes fire (e.g. 'refactoriser' contains 'refactor'). |
| de | 5 | 2 | 40.0% | Latin script; mostly no keyword overlap. |
| **TOTAL multilang** | **50** | **7** | **14.0%** | |

## Multilingual results by category

| Category | Tasks | Correct | Accuracy |
|---|---|---|---|
| trivial | 4 | 4 | 100.0% |
| simple_verifiable | 4 | 0 | 0.0% |
| bug_fix | 11 | 1 | 9.1% |
| refactor_feature | 11 | 2 | 18.2% |
| research | 5 | 0 | 0.0% |
| content | 8 | 0 | 0.0% |
| multi_perspective | 7 | 0 | 0.0% |

## Known limitations and failure cases

The router is keyword-based and English-only. Multilingual tasks fail because the heuristics do not recognize non-English task descriptions. This is a **real, documented limitation** - not a bug to hide.

### Sample failures (detailed)

**Failure 1** [en] `add rate limiting to all routes`
- Category: `refactor_feature`
- Expected: `pattern:plan_execute`
- Actual:   `pattern:react`
- Router reason: complex task, failure mode: wrong_execution

**Failure 2** [en] `add a new validation layer for inputs`
- Category: `refactor_feature`
- Expected: `pattern:plan_execute`
- Actual:   `pattern:react`
- Router reason: complex task, failure mode: wrong_execution

**Failure 3** [en] `add a new dashboard for monitoring`
- Category: `refactor_feature`
- Expected: `pattern:plan_execute`
- Actual:   `pattern:react`
- Router reason: complex task, failure mode: wrong_execution

**Failure 4** [en] `write a blog post about our architecture`
- Category: `content`
- Expected: `pattern:self_refine`
- Actual:   `pattern:multi_agent`
- Router reason: complex task, failure mode: needs_multiple_perspectives

**Failure 5** [zh] `请给这个函数添加详细的注释说明`
- Category: `simple_verifiable`
- Expected: `do_once`
- Actual:   `direct_answer`
- Router reason: no verifiable criteria and not complex - answer directly

**Failure 6** [zh] `将变量名重命名为更有意义的名称`
- Category: `simple_verifiable`
- Expected: `do_once`
- Actual:   `direct_answer`
- Router reason: no verifiable criteria and not complex - answer directly

**Failure 7** [zh] `更新配置文件中的版本号`
- Category: `simple_verifiable`
- Expected: `do_once`
- Actual:   `direct_answer`
- Router reason: trivial task, answer directly

**Failure 8** [zh] `修复文档中的错别字`
- Category: `simple_verifiable`
- Expected: `do_once`
- Actual:   `direct_answer`
- Router reason: trivial task, answer directly

**Failure 9** [zh] `修复登录时出现的bug`
- Category: `bug_fix`
- Expected: `pattern:reflexion`
- Actual:   `direct_answer`
- Router reason: trivial task, answer directly

**Failure 10** [zh] `调试内存泄漏问题`
- Category: `bug_fix`
- Expected: `pattern:reflexion`
- Actual:   `direct_answer`
- Router reason: trivial task, answer directly

## Honesty statement

- Multilingual failures are NOT hidden or fixed by adding Chinese/Japanese/etc. keywords to the router. Doing so would inflate the metric without solving the real problem (semantic routing needs embeddings, not keywords).
- If English accuracy had dropped below 95%, the router would have been tuned with additional English keywords, with each iteration logged in this report. The English heuristic is unchanged from v1 in this run.
- The v1 subset (50 original tasks) must regress-check against v1's 98%. If it drops, that signals a router change broke v1.

## Reproduce

```bash
cd /tmp/oh-my-loop/benchmarks
python3 router_accuracy_v2.py
```
