# Show HN: Oh My Loop – Prompt-governed agentic loops for code and life

Oh My Loop is a small zero-dependency CLI and Agent Skill for deciding when an agent should answer once, verify an action, or run a bounded adaptive loop.

The current agent model interprets intent, risk, decision ownership, and the smallest useful behavior from context. There is no keyword, embedding, or task-length classifier. Existing behaviors such as ReAct, Reflexion, planning, decision support, habits, and life review are reusable primitives rather than a closed enum. The model can compose them or generate a task-specific strategy.

The prompt gives the agent freedom to plan and adapt after every observation. Deterministic code does only the parts that should not be negotiable: schema validation, risk-based autonomy reduction, exact-action confirmation, evidence requirements, iteration caps, cancellation, and safe failure when model output is missing or invalid.

Inside Codex, Claude Code, or Gemini, the host model performs routing directly. Standalone CLI routing supports an OpenAI-compatible endpoint.

The project is intentionally honest about its boundary: internal tests establish engineering behavior, not improved wellbeing or real-world safety. Generated evaluation results stay local, and high-impact life decisions remain user or expert owned.

Repo: https://github.com/Madapexai/oh-my-loop
