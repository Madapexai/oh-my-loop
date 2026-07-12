# Show HN: Oh My Loop – A methodology for designing good agentic loops

Hi HN,

I've been building agentic loops for about a year, and I kept running into the same problem: every task got the same elaborate loop. A simple string formatting task went through reflection, planning, and self-critique before producing three lines of output. That felt wrong, both in cost and latency.

So I built Oh My Loop. It's a methodology (and a small reference implementation) for picking the right loop pattern based on task complexity, rather than defaulting to the most sophisticated one available.

## What it does

The core is a tiny router that classifies incoming tasks into one of five loop patterns:

1. Zero-shot direct - no loop, just generate.
2. Retrieve-augmented - one retrieval pass, then generate.
3. Plan-then-execute - decompose, then execute subtasks.
4. Reflexion - generate, critique, regenerate.
5. Tree-of-thought - branch, evaluate, select.

The router itself is a small classifier (logistic regression over task embeddings, nothing fancy) trained on a hand-labeled set of ~400 tasks. It runs in under 5ms.

## Why I built it

Most agent frameworks optimize for the hardest case. That makes sense for demos, but in production I found 60-70% of real tasks are simple enough that a zero-shot call is both faster and more reliable than a full reflexion loop. Routing badly costs you either money (over-engineering) or quality (under-engineering).

## What it compares to

Conceptually similar to AutoGen's selector and LangChain's routing chains, but with two differences: the patterns are documented as a methodology rather than just code, and the router is intentionally dumb so it's easy to inspect and override.

## Current state

Working but early. The router hits ~78% agreement with my labels on a held-out set. All five patterns are implemented but tree-of-thought is rough. There's a small benchmark (~200 tasks) showing latency and cost reductions, but no quality regression numbers yet - that's the hard part I'm still figuring out.

## What I'd like feedback on

The classification is the weak link. Right now I'm using a single task embedding plus a linear classifier. If you've worked on task routing or agent orchestration: how do you decide when "simple" actually means "needs a loop"? I'm especially interested in edge cases where the router confidently picks the wrong pattern - what signals do you look for?

Repo: https://github.com/yourorg/oh-my-loop
