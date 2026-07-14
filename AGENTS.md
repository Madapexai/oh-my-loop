# Coding agent instructions

Use [`skills/oh-my-loop/SKILL.md`](skills/oh-my-loop/SKILL.md) when work is iterative, safety-sensitive, externally visible, irreversible, or needs evidence before completion. Use the current model to classify meaning and risk; never use keyword matching. Preserve user authority and never claim completion from an empty or stale check.

Run the smallest relevant verification command. Do not commit generated test reports, coverage output, benchmark output, logs, secrets, or personal memory.
