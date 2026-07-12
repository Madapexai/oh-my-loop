# Security Policy

## Reporting a vulnerability

If you discover a security vulnerability in Oh My Loop, please report it responsibly.

**Do NOT open a public GitHub issue.**

Instead, email: madapexai@users.noreply.github.com with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt within 48 hours and provide a timeline for a fix.

## Scope

Oh My Loop is a methodology framework with reference implementations. Security issues include:

- The router making unsafe routing decisions (e.g., routing an irreversible action to `do_once`)
- The `verify-before-claim` gate being bypassable
- Reference implementation bugs that could lead to data loss

## Not in scope

- LLM-specific issues (hallucination, prompt injection) - these are upstream
- Tool-specific vulnerabilities - report to the tool's maintainers
- Issues in user-written loops based on Oh My Loop

## Safe harbor

I will not take legal action against researchers who:
- Make a good faith effort to avoid privacy violations, destruction of data, and interruption of services
- Only test on their own installations or with explicit permission
- Report vulnerabilities responsibly (as above)
