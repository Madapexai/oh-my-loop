---
name: open-source-first
version: 1.0.0
description: "开源社区优先求助路径。当用户遇到问题、报错、选型、卡住时使用。开源社区90%概率有答案。参考Yason多次强调的原则。"
---

# 开源社区优先求助路径

## 🎯 核心理念

> "不懂就找资料，开源社区优先，开源社区90%的概率你能找到答案"
> "报错遇到不能解决的问题找资料，开源社区90%的概率你能找到答案"
> "习惯上开源社区，各种靠谱的网站product hunter, reddit, dev.to, 微信公众号，知乎，头条，小红书，抖音，tiktok，ins，x等等"
> -- Yason 6-26, 7-02

开源优先 = **先查再问，先搜再发，先试再求助**

## 🪜 求助优先级阶梯（从低到高）

### Level 1: 先问自己（think-like-human）
- 我调研的详细了吗？
- 还有什么内容需要补充？
- 这个方案对吗？
- 有没有更好的？

### Level 2: 再问代码库
- SearchCodebase / Grep 搜索本地代码
- 读取相关文件、配置、文档
- 检查 AGENTS.md / README / docs

### Level 3: 再问开源社区（本skill核心）
- GitHub Issues / Discussions
- Stack Overflow
- Reddit
- dev.to
- Product Hunter
- 微信公众号 / 知乎 / 小红书 / 头条

### Level 4: 再问AI
- WebSearch 搜索最新信息
- WebFetch 抓取具体页面
- 让AI总结、分析、对比

### Level 5: 最后问Yason（带方案问）
- 带着调研结果问，不带空白问
- 带着ABC方案+推荐问
- 带着数据+来源问

> **禁止跳级**：不要自己没查就直接问Yason，那是浪费Yason时间。

## 🔍 开源社区查询清单

### GitHub（优先级最高）
- **Issues** - 搜关键词，看closed的，往往有解决方案
- **Discussions** - 问问题的地方
- **README / docs/** - 官方文档
- **Pull Requests** - 看最近PR，了解最新进展
- **Releases** - 看changelog，了解版本变化
- **Stars/Forks趋势** - 判断项目活跃度

### Stack Overflow
- 搜错误信息（带引号精确搜）
- 看高票答案
- 看最近更新的答案（老答案可能过时）

### Reddit
- r/programming, r/webdev, r/MachineLearning等
- 搜关键词，看热门帖
- 看评论区的实践经验

### dev.to / Hashnode / Medium
- 技术博客，实践案例
- 教程类内容

### Product Hunter
- 新工具发现
- 产品对比

### 中文社区
- **微信公众号** - 国内最新动态
- **知乎** - 深度分析
- **掘金** - 前端/全栈
- **小红书** - 用户视角
- **头条** - 大众视角
- **CSDN** - 注意质量参差

### 视频/短视频
- **抖音/TikTok** - 快速了解
- **B站/YouTube** - 教程、深度视频
- **X/Twitter** - 实时动态、官方账号

## 🎯 查询技巧

### 错误信息查询
```
1. 复制完整错误信息
2. 去掉特定路径/ID（保留错误码和关键信息）
3. 加引号精确搜
4. GitHub Issues搜 -> Stack Overflow搜 -> Reddit搜
5. 看最近30天的答案（优先）
```

### 选型查询
```
1. 搜"X vs Y comparison 2026"
2. 搜"X alternative"
3. 看GitHub stars趋势
4. 看最近commit时间（活跃度）
5. 看Issues响应速度（维护质量）
6. 看文档完整性（上手成本）
```

### 最佳实践查询
```
1. 搜"best practices for X 2026"
2. 看官方文档的guide/tutorial
3. 看大厂的工程实践博客
4. 看GitHub awesome-X列表
5. 看开源项目的源码实现
```

## 📊 查询产物要求

### 调研报告标准
- **多源交叉** - 至少3个独立来源
- **最新数据** - 优先近30天，最长90天
- **可追溯** - 每条信息标注来源链接
- **有结论** - 不只罗列，必须有判断和建议
- **图文并茂** - 数据趋势图、对比表格

### 输出格式
```markdown
## 调研主题: XXX

### 关键发现
1. 发现1（来源: [链接]）
2. 发现2（来源: [链接]）

### 对比表
| 维度 | 方案A | 方案B |
|------|-------|-------|
| ... | ... | ... |

### 结论与建议
推荐方案A，因为...
```

## 🚫 不要做的事

- ❌ 没查就问Yason
- ❌ 只看一篇就说"了解了"
- ❌ 只看中文/只看英文（要交叉）
- ❌ 看老资料不标注时间
- ❌ 罗列信息不下结论
- ❌ 等GitHub限速才慢悠悠做（Yason 6-02原话）
- ❌ 遇到问题不主动找方案

## ✅ 正确做法

- ✅ 遇到问题先搜错误信息
- ✅ 多源交叉验证
- ✅ 优先官方文档和开源社区
- ✅ 标注来源和时间
- ✅ 给出判断和建议
- ✅ 遇到限流/封禁找替代方案（如微信抓取被限，找抓取工具）

## 🔗 相关 skill
- [team-sop](../team-sop/SKILL.md) - 总目录
- [think-like-human](../think-like-human/SKILL.md) - 先问自己
- [verification-gate](../verification-gate/SKILL.md) - 验证调研结果
- [cost-consciousness](../cost-consciousness/SKILL.md) - 开源=免费
