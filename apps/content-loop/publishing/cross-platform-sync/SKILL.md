---
name: cross-platform-sync
description: Use when the user wants to sync content across multiple platforms, manage content distribution, or says "跨平台同步", "内容分发", "多平台发布", "content sync", "distribution", "矩阵运营", "一键多发". Integrates with Wechatsync and other tools for seamless cross-platform publishing.
---

> **职责边界**：本 skill 负责**跨平台同步策略**（多平台矩阵运营、防关联策略、内容分发策略）。
> - 各平台内容适配规则 -> 见 [content-publisher](../content-publisher/SKILL.md)
> - 发布自动化工具与工作流 -> 见 [auto-publisher](../auto-publisher/SKILL.md)

# Cross Platform Sync — 跨平台内容同步

一篇内容，全网分发，最大化内容ROI。

## 同步策略

### 策略A：中心化分发（推荐）
以公众号/博客为内容母版，分发到所有平台：
```
公众号长文（母版）
  → 知乎：保留完整结构
  → 小红书：提取要点做成图文
  → 即刻：提取金句
  → X/Twitter：5条线程
  → 掘金：技术部分+代码
  → 视频号/B站：改编为视频脚本
```

### 策略B：平台原生创作
每个平台独立创作，内容不重复：
- 适合：团队运营、多账号矩阵
- 优势：平台算法更青睐原生内容
- 劣势：工作量大

### 策略C：混合模式
核心内容中心化分发，日常内容平台原生：
- 深度长文：中心化分发
- 日常短内容：平台原生

## 同步工具

### 工具1：Wechatsync（推荐）
- 开源跨平台同步Chrome扩展
- 支持29+平台：知乎、头条、掘金、小红书、CSDN、简书等
- 原理：复用浏览器Cookie，直接调用官方API
- 使用：
```bash
npm install -g @wechatsync/cli
wechatsync sync article.md -p zhihu,juejin,xiaohongshu
```

### 工具2：影刀RPA
- 模拟人工操作发布
- 适合Wechatsync不支持的平台
- 支持定时执行

### 工具3：各平台官方API
- 最稳定可靠
- 申请门槛高
- 适合有开发者资源的团队

## 平台适配检查清单

同步前检查每个平台的适配：

| 检查项 | 微信 | 知乎 | 小红书 | 即刻 | X | 掘金 |
|--------|------|------|--------|------|---|------|
| 字数限制 | 无 | 无 | 1000 | 无 | 280/500 | 无 |
| 图片数量 | 无限制 | 无限制 | 9张 | 无限制 | 4张 | 无限制 |
| 格式支持 | 富文本 | Markdown | 图文 | 纯文本 | 纯文本 | Markdown |
| 链接支持 | 内链 | 外链 | 无 | 有 | 有 | 有 |
| 标签数量 | 无 | 5个 | 10个 | 3个 | 无 | 5个 |
| 最佳时间 | 20:00 | 12:00 | 20:00 | 任意 | 08:00 | 10:00 |

## 同步工作流

```
内容创作完成
  ↓
Step 1: 确定母版平台（通常是公众号/博客）
  ↓
Step 2: 按平台规则适配内容
  - 小红书：提取要点，做3-5张图
  - 即刻：提取金句，200字以内
  - X：拆成5条线程
  - 知乎：补充深度分析
  - 掘金：补充代码示例
  ↓
Step 3: 准备各平台素材
  - 封面图（按平台尺寸）
  - 标签/话题
  - 简介/摘要
  ↓
Step 4: 使用工具同步发布
  - Wechatsync：一键同步到多个平台
  - 或手动逐个发布
  ↓
Step 5: 记录发布数据
  - 各平台链接
  - 发布时间
  - 后续追踪数据
```

## 矩阵运营

### 账号矩阵设计

**同平台多账号**：
- 主号：核心定位，深度内容
- 小号A：细分领域，测试新方向
- 小号B：轻松内容，维持活跃度
- 小号C：互动账号，评论区活跃

**跨平台矩阵**：
- 每个平台1-2个账号
- 内容差异化，避免完全重复
- 互相引流，形成闭环

### 防关联策略
- 不同账号用不同手机号/邮箱
- 不同账号用不同设备或指纹浏览器
- 发布时间错开，不要同时发布相同内容
- 内容做差异化处理，不要完全复制

## 与 content-os 的协作

cross-platform-sync 是 content-publisher 和 auto-publisher 的补充：
- content-publisher 负责单平台内容适配
- cross-platform-sync 负责多平台同步策略
- auto-publisher 负责自动化执行
- 三者配合实现"一次创作，全网分发"
