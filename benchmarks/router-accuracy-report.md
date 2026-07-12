# Router Accuracy Benchmark Report

**Date**: 2026-07-13
**Tasks**: 50
**Accuracy**: 98.0%

## Methodology

50 tasks labeled with expected routing decisions. router.route() called on each, output compared to label.

## Results

- Trivial (10 tasks): direct_answer expected
- Simple verifiable (10 tasks): do_once expected
- Bug fixes (8 tasks): reflexion expected
- Refactors/features (8 tasks): plan_execute expected
- Research (7 tasks): react expected
- Content (4 tasks): self_refine expected
- Multi-perspective (3 tasks): multi_agent expected
