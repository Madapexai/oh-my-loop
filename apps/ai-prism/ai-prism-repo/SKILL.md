---
name: ai-prism-repo
version: 1.0.0
description: "AI Prism GitHub仓库管理规范。当用户需要管理AI Prism仓库的目录结构、i18n双语规则、Git工作流、commit message格式时使用。"
---

# ai-prism-repo

## Name
ai-prism-repo

## Description
When the user wants to manage the AI Prism GitHub repository, create or update articles, handle Git operations, manage the bilingual directory structure, or ensure content compliance. Use this skill whenever the user mentions GitHub, repo management, article numbering, directory structure, or content review.

## Directory Structure

```
ai-prism/
├── README.md
├── AGENTS.md
├── posts/
│   ├── external-lens/
│   │   ├── en/
│   │   │   └── day-NN.md
│   │   └── zh/
│   │       └── day-NN.md
│   └── yason-and-roberts/
│       ├── en/
│       │   └── chNN.md
│       └── zh/
│           └── chNN.md
```

- **external-lens**: industry observation series, numbered by day (`day-01.md`, `day-02.md`, ...)
- **yason-and-roberts**: personal AI collaboration series, numbered by chapter (`ch01.md`, `ch02.md`, ...)
- Each article exists in both `en/` and `zh/` subdirectories
- Use zero-padded two-digit numbers for sorting

## Language Toggle Format

Place this at the very top of every article file, before the title:

```markdown
<!-- LANG: zh | en -->
```

For Chinese files, use `zh | en`. For English files, use `en | zh`. This allows scripts or readers to quickly identify language and find the counterpart file.

## Git Workflow

Follow this exact sequence for every new article or update:

1. **Research** — gather sources, test tools, collect data
2. **Write** — draft both language versions
3. **Add Mermaid** — insert diagrams where they clarify structure
4. **Update README** — add new entries to the Table of Contents
5. **Git add** — `git add -A` (stage all changes)
6. **Commit** — use the commit message format below
7. **Push** — `git push origin main`

## Commit Message Format

- **External Lens**: `🔭 Day NN: <topic>`
  - Example: `🔭 Day 07: MCP 协议初探`
- **Yason & Roberts**: `🤖 Ch NN: <topic>`
  - Example: `🤖 Ch 03: 第一次让 AI 写生产代码`

Keep the topic concise (under 50 characters total for the subject line).

## README Update Rules

When adding a new article:
1. Add the new entry to the Table of Contents in `README.md`
2. Maintain chronological order (newest at top for ongoing series)
3. Include both language links if both are published
4. Use the format: `- [Day NN: Title](posts/external-lens/zh/day-NN.md) | [EN](posts/external-lens/en/day-NN.md)`

## i18n Structure Rules

- **Independent writing**: Chinese and English versions are written separately, not translated
- **Sync by structure**: both versions share the same headings, diagrams, and code blocks
- **Sync by data**: numbers, dates, and technical facts must match across languages
- **Cultural adaptation**: examples and references may differ to suit each audience
- **Filename pairing**: `zh/day-NN.md` ↔ `en/day-NN.md`; same basename, different directory

## Content Compliance Checklist

Before every commit, verify:

1. [ ] **No secrets**: no API keys, tokens, passwords, or credentials in any file
2. [ ] **No internal URLs**: no dashboard links, admin panels, or internal endpoints
3. [ ] **Anonymized entities**: company names, colleague names, and projects are generic or pseudonymous
4. [ ] **No cost leaks**: internal pricing, budget numbers, or spend data are removed or generalized
5. [ ] **No IDs**: no open_id, app_id, user_id, or internal identifiers
6. [ ] **Mermaid valid**: all Mermaid diagrams render without syntax errors and contain no emoji
7. [ ] **Both languages**: if publishing, both `en/` and `zh/` versions exist and are in sync

If any item fails, fix it before committing.
