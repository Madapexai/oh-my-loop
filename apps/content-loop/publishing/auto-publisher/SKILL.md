---
name: auto-publisher
description: Use when the user wants to automatically publish content to social media platforms, schedule posts, or says "自动发布", "定时发布", "一键发布", "auto publish", "schedule post", "批量发布". Integrates with Wechatsync, RPA tools, and platform APIs for hands-free publishing.
---

> **职责边界**：本 skill 负责**发布自动化**（Wechatsync CLI/影刀RPA/官方API的自动化编排、定时/批量发布工作流）。
> - 各平台内容适配规则 -> 见 [content-publisher](../content-publisher/SKILL.md)
> - 跨平台同步策略与矩阵运营 -> 见 [cross-platform-sync](../cross-platform-sync/SKILL.md)

# Auto Publisher — 自动化发布引擎

内容写好了，让机器帮你发，把时间留给创作。

## 三种发布方式

### 方式A：Wechatsync（推荐）
基于开源 Wechatsync 的跨平台同步方案。

**原理**：
- 浏览器扩展复用用户已登录态的 Cookie
- 直接调用各平台官方 Web API（非爬虫、不模拟登录）
- 数据不离开设备，安全合规

**支持平台**：
微信公众号、知乎、掘金、小红书、头条、CSDN、简书、WordPress、Typecho 等 29+ 平台

**使用方式**：
```bash
# 安装 CLI
npm install -g @wechatsync/cli

# 同步文章到指定平台
wechatsync sync article.md -p zhihu,juejin,xiaohongshu

# 从当前页面提取文章
wechatsync extract -o article.md
```

**优势**：
- 零配置，利用已有登录态
- 与人工操作完全等价，稳定性高
- 默认草稿模式，人工确认后发布

**局限**：
- 需要浏览器保持登录状态
- 部分平台可能需要验证码
- 不支持完全无人值守的定时发布

### 方式B：影刀RPA
基于影刀RPA的模拟人工操作方案。

**适用场景**：
- Wechatsync 不支持的平台
- 需要复杂交互的发布流程（如上传视频、选择封面、设置标签）
- 需要定时发布的场景

**实现思路**：
1. 用影刀录制一次完整发布流程
2. 将录制流程参数化（标题、内容、图片路径等）
3. 通过影刀API或定时任务触发执行

**优势**：
- 几乎支持所有有网页版的平台
- 可以处理复杂交互
- 支持定时执行

**局限**：
- 需要影刀商业授权
- 流程需要定期维护（网页改版后可能失效）
- 运行时需要占用桌面环境

### 方式C：平台官方API
直接调用各平台官方开发者API。

**支持平台及API**：
| 平台 | API类型 | 申请难度 | 功能限制 |
|------|---------|---------|---------|
| 微信公众号 | 微信开放平台 | 中 | 需认证公众号 |
| 知乎 | 知乎开放平台 | 中 | 需申请权限 |
| 小红书 | 小红书开放平台 | 高 | 需企业认证 |
| X/Twitter | X API v2 | 低 | 有速率限制 |
| LinkedIn | LinkedIn API | 低 | 需开发者账号 |
| Dev.to | Dev.to API | 低 | 功能完整 |
| 掘金 | 掘金API | 低 | 功能较完整 |

**优势**：
- 最稳定、最可靠
- 支持完全自动化
- 可以获取发布后的数据

**局限**：
- 申请门槛高（尤其是国内平台）
- 有速率限制
- 功能可能不完整

## 发布工作流

### 工作流1：即时发布
```
内容准备完成
  → 选择发布方式（Wechatsync/RPA/API）
  → 选择目标平台
  → 预览确认
  → 发布
  → 记录发布数据
```

### 工作流2：定时发布
```
内容准备完成
  → 设置发布时间
  → 系统到时间自动执行
  → 发布完成通知
  → 记录发布数据
```

### 工作流3：批量发布
```
多篇内容准备完成
  → 设置发布排期
  → 系统按排期逐篇发布
  → 每篇发布后记录数据
  → 全部完成后生成报告
```

## 发布前检查清单

- [ ] 内容已通过 content-publisher 平台适配
- [ ] 标题符合目标平台公式
- [ ] 字数在平台限制内
- [ ] 图片已准备且尺寸正确
- [ ] 标签/话题已添加
- [ ] 默认发布为草稿（首次使用新平台时）
- [ ] 发布后首小时运营计划已准备

## 发布后自动化

发布后可以自动执行：
- **数据抓取**：发布后24h/72h/7d自动抓取数据
- **评论监控**：监控评论区，高价值评论自动提醒
- **互动回复**：预设回复模板，快速回复常见问题
- **效果报告**：自动生成发布效果简报

## 与 content-os 的协作

auto-publisher 是 content-os 流水线的最后一步：
```
content-os 生成内容
  → content-publisher 平台适配
  → auto-publisher 自动发布
  → content-analytics 数据追踪
  → 数据反馈到 content-os 优化下一轮
```

## 安全提醒

- **首次使用新平台**：务必先发布为草稿，人工确认后再正式发布
- **批量发布**：不要同时发布完全相同的内容到多个平台（可能被判定抄袭）
- **频率控制**：遵守各平台发布频率限制，避免触发风控
- **账号安全**：定期更换密码，启用二次验证
```
