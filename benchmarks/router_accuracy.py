"""Benchmark: router accuracy on 50 labeled tasks.

Measures: does route() pick the expected pattern?
Real verification, not vibes.
"""
import sys
sys.path.insert(0, "../reference-implementations/python")

from oh_my_loop import route

# 50 labeled tasks with expected routing
TASKS = [
    # trivial -> direct_answer (10)
    ("what's 2+2", "direct_answer"),
    ("format this string as uppercase", "direct_answer"),
    ("summarize this email in one sentence", "direct_answer"),
    ("translate hello to spanish", "direct_answer"),
    ("draft a welcome email for new users", "direct_answer"),
    ("compose a tweet about our launch", "direct_answer"),
    ("what is the capital of france", "direct_answer"),
    ("convert this json to yaml", "direct_answer"),
    ("count words in this paragraph", "direct_answer"),
    ("suggest a name for my cat", "direct_answer"),

    # simple + verifiable -> do_once (10)
    ("add a comment to the auth module", "do_once"),
    ("rename variable x to user_count", "do_once"),
    ("add type hints to function foo", "do_once"),
    ("update the version string", "do_once"),
    ("fix this typo in the docs", "do_once"),
    ("add a log line to the handler", "do_once"),
    ("remove this unused import", "do_once"),
    ("add a blank line here", "do_once"),
    ("reorder these imports", "do_once"),
    ("add a docstring", "do_once"),

    # bug fixes -> reflexion (8)
    ("fix the bug where login fails for special chars", "pattern:reflexion"),
    ("debug why the cron job doesn't run", "pattern:reflexion"),
    ("fix the intermittent test failure", "pattern:reflexion"),
    ("debug the memory leak in the worker", "pattern:reflexion"),
    ("fix the off-by-one error in the loop", "pattern:reflexion"),
    ("debug why the api returns 500", "pattern:reflexion"),
    ("fix the race condition in the cache", "pattern:reflexion"),
    ("debug the null pointer exception", "pattern:reflexion"),

    # refactors/features -> plan_execute (8)
    ("refactor the auth module to support OAuth", "pattern:plan_execute"),
    ("add a new api endpoint for user settings", "pattern:plan_execute"),
    ("migrate the database from mysql to postgres", "pattern:plan_execute"),
    ("implement the payment integration", "pattern:plan_execute"),
    ("add validation to all api endpoints", "pattern:plan_execute"),
    ("refactor to use the new orm", "pattern:plan_execute"),
    ("implement the search feature", "pattern:plan_execute"),
    ("add rate limiting to all routes", "pattern:plan_execute"),

    # research -> react (7)
    ("investigate the best agent framework", "pattern:react"),
    ("find out why the ci is slow", "pattern:react"),
    ("explore the codebase to understand the auth flow", "pattern:react"),
    ("research the latest papers on rag", "pattern:react"),
    ("analyze the competition for our feature", "pattern:react"),
    ("find the root cause of the performance regression", "pattern:react"),
    ("investigate open source alternatives to our stack", "pattern:react"),

    # content -> self_refine (4)
    ("write a readme for the open source project", "pattern:self_refine"),
    ("draft the launch blog post", "pattern:self_refine"),
    ("write the api documentation", "pattern:self_refine"),
    ("improve the marketing copy", "pattern:self_refine"),

    # review/multi-perspective -> multi_agent (3)
    ("review this pr for security and performance", "pattern:multi_agent"),
    ("audit the codebase for compliance", "pattern:multi_agent"),
    ("analyze the architecture from multiple perspectives", "pattern:multi_agent"),
]


def run_benchmark():
    correct = 0
    failures = []

    for task, expected in TASKS:
        result = route(task)
        actual = result.decision.value
        if result.pattern:
            actual = f"pattern:{result.pattern}"

        if actual == expected:
            correct += 1
        else:
            failures.append({
                "task": task,
                "expected": expected,
                "actual": actual,
                "reason": result.reason,
            })

    total = len(TASKS)
    accuracy = correct / total

    print(f"Router Accuracy Benchmark")
    print(f"=" * 50)
    print(f"Total tasks: {total}")
    print(f"Correct: {correct}")
    print(f"Accuracy: {accuracy:.1%}")
    print()

    if failures:
        print(f"Failures ({len(failures)}):")
        for f in failures:
            print(f"  Task: {f['task'][:50]}")
            print(f"    Expected: {f['expected']}")
            print(f"    Actual:   {f['actual']}")
            print(f"    Reason:   {f['reason']}")
            print()

    return accuracy


if __name__ == "__main__":
    accuracy = run_benchmark()
    # Write report
    with open("router-accuracy-report.md", "w") as f:
        f.write(f"# Router Accuracy Benchmark Report\n\n")
        f.write(f"**Date**: 2026-07-13\n")
        f.write(f"**Tasks**: {len(TASKS)}\n")
        f.write(f"**Accuracy**: {accuracy:.1%}\n\n")
        f.write(f"## Methodology\n\n")
        f.write(f"50 tasks labeled with expected routing decisions. router.route() called on each, output compared to label.\n\n")
        f.write(f"## Results\n\n")
        f.write(f"- Trivial (10 tasks): direct_answer expected\n")
        f.write(f"- Simple verifiable (10 tasks): do_once expected\n")
        f.write(f"- Bug fixes (8 tasks): reflexion expected\n")
        f.write(f"- Refactors/features (8 tasks): plan_execute expected\n")
        f.write(f"- Research (7 tasks): react expected\n")
        f.write(f"- Content (4 tasks): self_refine expected\n")
        f.write(f"- Multi-perspective (3 tasks): multi_agent expected\n")
    print(f"\nReport written to router-accuracy-report.md")
