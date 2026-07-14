# Code-agent integration

Install the zero-dependency Node CLI from a checkout:

```bash
npm install --global --prefix "$HOME/.local" .
oh-my-loop install --agent all
oh-my-loop doctor
```

When the Skill is used inside Codex, Claude Code, Gemini, or Cursor, the current agent model performs intent and risk routing. No second API key or model configuration is needed for the prompt-governed host workflow. Host agents must still respect the Skill's confirmation and evidence gates; the project cannot technically intercept every host tool call.

Standalone `route`, `contract`, `run`, and `team` require an OpenAI-compatible model endpoint:

```bash
export OH_MY_LOOP_MODEL="your-model"
export OH_MY_LOOP_API_KEY="your-key"
export OH_MY_LOOP_BASE_URL="https://api.openai.com/v1" # optional default
export OH_MY_LOOP_TIMEOUT_MS="30000"                    # optional

oh-my-loop route "your task" --json
oh-my-loop run "your task" --json
oh-my-loop team "review this from independent perspectives" --json
```

There is no keyword fallback. Missing configuration, request failure, malformed JSON, or invalid schema fails closed.

The standalone runtime persists recoverable state in `~/.oh-my-loop`. Use `observe` only for facts actually returned by a user or tool, and `confirm` only with the exact pending action. Remote model endpoints must use HTTPS; plaintext HTTP is allowed only for loopback development servers.

Repository-scoped setup:

```bash
oh-my-loop install --agent all --scope project --project /path/to/project
oh-my-loop install --agent cursor --project /path/to/project
```

Discovery locations:

- Codex: `~/.codex/skills/oh-my-loop/`
- Claude Code: `~/.claude/skills/oh-my-loop/`; invoke `/oh-my-loop`
- Gemini CLI: `~/.gemini/skills/oh-my-loop/`
- Project scope: `.agents/skills/`, `.claude/skills/`, or `.gemini/skills/`
- Cursor: `.cursor/rules/oh-my-loop.mdc`

Official references: [Claude Code skills](https://code.claude.com/docs/en/slash-commands), [Gemini CLI skills](https://geminicli.com/docs/cli/using-agent-skills/), and [Cursor project rules](https://docs.cursor.com/context/rules-for-ai).
