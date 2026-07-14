# Security Policy

## Report privately

Do not open a public issue for a vulnerability or include real personal data in a report. Use GitHub's **Security → Report a vulnerability** private reporting flow for this repository. If private reporting is unavailable, open a minimal issue asking the maintainer to enable a private channel, without vulnerability details.

Please include affected version, minimal reproduction with synthetic data, impact, and suggested mitigation. Response times are best-effort until the project publishes a staffed security SLA.

## In scope

- Unsafe routing or authority escalation
- Confirmation bypass or action substitution after confirmation
- Evidence gates that can pass empty, stale, forged, or failed checks
- Prompt/tool injection across trust boundaries
- Data loss, unintended external action, privacy leakage, or secret exposure
- Memory poisoning, retention, corruption, or failure to forget
- Budget, cancellation, stagnation, and loop termination failures
- Dependency and release-pipeline vulnerabilities

LLM and tool behavior is in scope when this project fails to contain, label, or safely handle it. Report upstream vulnerabilities to the upstream project as well.

## Safe harbor

Good-faith research must use systems and data you own or are authorized to test, minimize access and retention, avoid service disruption and harm, and report privately. We will not pursue action against research meeting these conditions.
