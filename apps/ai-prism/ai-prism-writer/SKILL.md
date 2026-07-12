---
name: ai-prism-writer
version: 1.0.0
description: "AI Prism专栏双语写作规范。当用户需要撰写AI Prism系列文章、使用特定标题公式和结构、遵循口语化第一人称voice rules时使用。"
---

# ai-prism-writer

> **通用写作规范**：标题公式、开篇模式、文章结构、voice rules、Mermaid规则、脱敏规则等通用内容，详见 [article-writer](../article-writer/SKILL.md) skill。
>
> 本 skill 仅定义 AI Prism 专栏的专属差异。

## Name
ai-prism-writer

## Description
When the user wants to write AI insights articles, tech blog posts, WeChat public account articles, or any bilingual (Chinese/English) content for the AI Prism column. Use this skill whenever the user mentions writing articles, creating content, drafting posts, or needs help with the AI Prism writing workflow.

## AI Prism 专栏定位

AI Prism 是一个聚焦 AI 领域洞察的双语专栏，以"第一人称 + 口语化 + 具体数字"为风格特征。

通用写作规范全部遵循 [article-writer](../article-writer/SKILL.md) skill，包括：
- 标题公式（冲突/数字冲击/免费钩子/痛点直击等）
- 开篇模式（场景代入/痛点共鸣/热点事件/个人故事等）
- 文章结构（6段式/故事线/时间线/对比线/清单体/发现之旅）
- Voice rules（第一人称、口语化、具体数字、Before vs After）
- 金句结尾
- Mermaid 图表规则
- 脱敏规则

## 双语（中英）写作要求（AI Prism 专属）

AI Prism 专栏的核心专属特征是中英双语独立撰写：

- 中文和英文版本**独立撰写**，不是互译关系
- 英文版本可针对全球读者调整语调（更直接、减少背景铺垫）
- 中文版本可使用本地化引用、网络梗和文化语境
- 两个版本共享相同的核心结构和关键数据点
- 文件命名约定：相同 basename，不同语言目录
