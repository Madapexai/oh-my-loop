---
name: content-loop-quickstart
description: Use when the user is new to the ContentLoop system, asks "怎么开始", "如何使用", "入门指南", "quick start", "getting started", "第一次用", "新手". Provides a step-by-step onboarding to the content creation pipeline.
---

> 📝 **改名说明**：本 skill 原名 ContentOS，因与区块链项目 Contentos (COS) 重名，2026-07-12 改名为 ContentLoop。突出 M-LOOP 闭环理念，避免商标混淆。

# ContentLoop Quick Start — 快速入门指南

第一次用 ContentLoop？从这里开始，5分钟上手。

## 你的第一次内容创作

### 场景：你想写一篇关于某个话题的文章

**Step 1 — 说一句话**
> "我想写一篇关于 [你的话题] 的文章"

系统会自动走完整流水线：
1. 用 topic-analyzer 分析选题
2. 用 article-writer 生成初稿
3. 用 humanize-writing 去AI感
4. 用 content-publisher 适配目标平台

**Step 2 — 选择标题**
系统会给你3个候选标题，选一个或组合。

**Step 3 — 逐段确认**
系统按6段式结构逐段写作，每段你可以：确认/修改/重写/跳过。

**Step 4 — 发布**
系统生成适配你目标平台的最终版本，附带发布检查清单。

## 完整流水线速查

| 你说 | 系统做什么 | 涉及Skill |
|------|-----------|----------|
| "找选题" | 扫描热点，推荐选题 | trending-discover |
| "分析这个选题" | 分析受众、竞品、情绪切入点 | topic-analyzer |
| "写篇文章" | 完整写作流程 | article-writer |
| "这段太AI了" | 去AI感改写 | humanize-writing |
| "改成小红书版本" | 平台适配 | content-publisher |
| "一鱼多吃" | 全平台改编 | content-repurposer |
| "看看评论区" | 评论分析 | comment-analyzer |
| "分析一下数据" | 效果复盘 | content-analytics |

## 常见工作流

**工作流A：日更短内容（小红书/即刻/X）**
找选题 → 写小红书笔记 → 发布（约15-30分钟）

**工作流B：周更深度长文（公众号/知乎）**
周一：找选题 → 分析选题
周二-三：写初稿
周四：人类化改写
周五：适配多平台 → 发布
周末：评论互动 + 数据记录

**工作流C：内容复用（效率最大化）**
写一篇公众号 → 提取金句发即刻 → 提取要点发小红书 → 扩展技术部分发掘金 → 翻译英文发Dev.to
（1篇变5篇，约额外30分钟）

## 首次使用建议

1. 先写一个完整的单平台文章，不要一上来就追求全平台分发
2. 从你最熟悉的平台开始，熟悉流程后再扩展
3. 记录你的第一篇数据，作为后续优化的基准线
4. 不要追求完美，先完成再完美，数据会告诉你怎么优化

## 与其他Skill的关系

ContentLoop 与已有skill协作：
- 有素材碎片？ → 先用 writing-fragments 收集
- 需要精雕文章？ → 用 writing-shape 打磨
- 需要精修段落？ → 用 edit-article 润色
- 需要发布到飞书？ → 用 lark-doc
- 需要生成PDF？ → 用 pandoc

## 进阶路径

新手（第1-2周）→ 掌握单平台写作
进阶（第3-4周）→ 掌握多平台适配
熟练（第2-3月）→ 建立个人素材库，形成风格
专家（第3月+）→ 数据驱动迭代，A/B测试优化
