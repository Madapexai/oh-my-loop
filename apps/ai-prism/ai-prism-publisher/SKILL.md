---
name: ai-prism-publisher
version: 1.0.0
description: "AI Prism专栏跨平台发布适配规范。当用户需要发布AI Prism系列文章到多平台、适配格式、管理发布频率时使用。"
---

# ai-prism-publisher

> **通用平台适配规则**：8个平台（微信/知乎/掘金/小红书/即刻/X/LinkedIn/Dev.to）的格式规则、适配工作流、检查清单，详见 [content-publisher](../content-publisher/SKILL.md) skill。
>
> 本 skill 仅定义 AI Prism 专栏的专属发布差异。

## Name
ai-prism-publisher

## Description
When the user wants to publish content to multiple social media platforms, adapt articles for WeChat, Zhihu, Juejin, Xiaohongshu, Jike, X/Twitter, LinkedIn, or Dev.to. Use this skill whenever the user mentions publishing, distributing content, posting to social media, or adapting articles for different platforms.

## AI Prism 发布频率表

| Platform | Frequency | Best Time (CST) | Notes |
|----------|-----------|-----------------|-------|
| WeChat | 1-2 per week | Tue/Thu 20:00-21:00 | Highest engagement |
| Zhihu | 1 per week | Wed/Sun 12:00-14:00 | Long-tail traffic |
| Juejin | 1 per week | Tue/Thu 10:00-12:00 | Developer active hours |
| Xiaohongshu | 3-5 per week | Daily 12:00-13:00, 20:00-22:00 | Visual-first |
| Jike | Daily | Anytime | Low effort, high frequency |
| X/Twitter | Daily | 08:00-10:00 CST (global overlap) | Thread on article days |
| LinkedIn | 2-3 per week | Tue-Thu 08:00-09:00 CST | B2B audience |
| Dev.to | 1 per week | Sync with Juejin | English only |

## AI Prism 专属发布工作流

AI Prism 专栏的发布工作流遵循 [content-publisher](../content-publisher/SKILL.md) 的通用适配工作流，无额外差异：

1. 以完整中文文章为母版（微信公众号版本）
2. 长文平台（知乎、掘金、Dev.to）：按需裁剪或扩展，保留结构
3. 短内容平台（小红书、即刻、X）：提取最有价值的单一洞察
4. 专业平台（LinkedIn）：重新框架为职业/效率洞察
5. 所有版本在规则允许时包含回链到完整文章

## AI Prism 专属平台适配差异

AI Prism 专栏在通用平台规则（见 content-publisher）基础上，无额外平台适配差异。所有平台均遵循 [content-publisher](../content-publisher/SKILL.md) 的标准规则。

如需查看具体平台的字数、格式、标签要求，请参考 [content-publisher](../content-publisher/SKILL.md)。
