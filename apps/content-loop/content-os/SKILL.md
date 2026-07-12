---
name: content-loop
description: Use when the user wants to systematically produce content, manage a content pipeline, monitor topics, analyze authors, auto-publish, or says "写文章", "做内容", "内容运营", "创作", "content creation", "content strategy", "监测话题", "追踪作者", "自动发布", "auto publish". This is the self-evolving orchestrator that routes to specialized sub-skills and learns from every interaction.
---

> 📝 **改名说明**：本 skill 原名 ContentOS，因与区块链项目 Contentos (COS) 重名，2026-07-12 改名为 ContentLoop。突出 M-LOOP 闭环理念，避免商标混淆。

# ContentLoop — 自进化内容操作系统

内容生产的总调度中心。将"写文章"从一次性动作变成自进化的系统化流水线。

## 核心设计理念

不是只针对GitHub热门主题 — ContentLoop 是一套方法论，适用于任何主题领域：
- AI/技术、职场、财经、生活方式、教育、医疗...任何领域都可以
- 用户定义主题 → 系统自动学习该领域的语言、热点渠道、关键作者
- 主题配置文件：~/.contentos/themes/{theme-name}.md

像人一样思考 — 系统会：
- 记住你的偏好（风格、习惯、选择）
- 从每次互动中学习（你改了什么、选了什么、效果如何）
- 主动推荐（发现你可能感兴趣的话题）
- 自我进化（越用越懂你）

## 五层架构

```
进化层：self-learn（自学习引擎）
  - 记忆系统、反馈闭环、主动学习

执行层：监测 + 分析 + 自动化
  - topic-monitor、author-analyzer、auto-publisher

内容策略层：战略规划与矩阵运营
  - content-strategist（内容策略规划）、cross-platform-sync（跨平台矩阵同步）

方法论层：创作核心流程（文章+视频+小说）
  - 热点→选题→撰写(文章/视频/小说)→改写→发布→评论→复用→复盘

变现层：内容价值最大化
  - content-marketing（内容营销增长）、knowledge-monetization（知识变现）
```

## 完整流水线（自进化闭环）

```
topic-monitor 持续扫描 → 发现新话题/作者动态/竞品更新
  ↓
content-strategist 内容策略规划（月度/季度）
  ↓
topic-analyzer 分析选题 + author-analyzer 分析对标作者
  ↓
分支A: article-writer 撰写文章
分支B: video-script-writer 撰写视频脚本
分支C: novel-writer 创作小说章节
  ↓
humanize-writing 改写（文章/脚本/小说）
  ↓
content-publisher 适配 + cross-platform-sync 矩阵分发
  ↓
auto-publisher 自动发布
  ↓
content-marketing 增长运营（投放/互动/裂变）
  ↓
comment-analyzer 评论解读 + 自动回帖
  ↓
content-analytics 数据分析
  ↓
knowledge-monetization 变现优化（课程/电子书/社群）
  ↓
self-learn 学习反馈 → 优化下一轮所有决策
  ↓
回到 topic-monitor，循环往复
```

## 20个子技能路由表

### 方法论层（创作核心）
| 阶段 | 子技能 | 触发场景 |
|------|--------|---------|
| 快速入门 | content-loop-quickstart | "怎么开始"、"新手"、"第一次用" |
| 热点发现 | trending-discover | "找热点"、"选题灵感"、"trending" |
| 选题分析 | topic-analyzer | "分析这个选题"、"话题分析" |
| 文章撰写 | article-writer | "写文章"、"写公众号"、"draft article" |
| 视频脚本 | video-script-writer | "写脚本"、"短视频"、"视频文案"、"video script"、"抖音/B站/YouTube" |
| 小说创作 | novel-writer | "写小说"、"网文"、"novel"、"番茄小说"、"起点"、"Wattpad"、"KDP" |
| 人类化改写 | humanize-writing | "去AI感"、"humanize" |
| 评论解读 | comment-analyzer | "分析评论"、"comment analysis" |
| 多平台发布 | content-publisher | "发布"、"适配平台"、"publish" |
| 内容复用 | content-repurposer | "一鱼多吃"、"repurpose" |
| 数据复盘 | content-analytics | "数据分析"、"内容复盘"、"performance review" |

### 执行层（监测+分析+自动化）
| 阶段 | 子技能 | 触发场景 |
|------|--------|---------|
| 话题监测 | topic-monitor | "监测话题"、"追踪主题"、"监控更新"、"alert me" |
| 作者分析 | author-analyzer | "分析这个作者"、"竞品分析"、"对标账号" |
| 自动发布 | auto-publisher | "自动发布"、"定时发布"、"auto publish"、"schedule post" |

### 内容策略层（战略规划）
| 阶段 | 子技能 | 触发场景 |
|------|--------|---------|
| 内容策略规划 | content-strategist | "内容规划"、"矩阵策略"、"roadmap"、"内容日历" |
| 跨平台矩阵 | cross-platform-sync | "矩阵运营"、"多平台同步"、"Wechatsync"、"cross post" |

### 变现层（价值最大化）
| 阶段 | 子技能 | 触发场景 |
|------|--------|---------|
| 内容营销 | content-marketing | "增长"、"涨粉"、"viral"、"growth hack"、"AARRR" |
| 知识变现 | knowledge-monetization | "变现"、"知识付费"、"课程"、"电子书"、"monetize"、"被动收入" |

### 进化层（自学习）
| 阶段 | 子技能 | 触发场景 |
|------|--------|---------|
| 自学习 | self-learn | "学习我的风格"、"记住我的偏好"、"越用越好" |

## 主题适配系统

ContentLoop 不限定于任何主题。使用主题配置文件定义你的领域：

```markdown
## 主题配置：[主题名称]

### 领域定义
- 主题名称：[如"AI工具测评"、"职场成长"、"理财入门"]
- 目标受众：[描述]
- 内容定位：[如"实用工具推荐+个人使用体验"]

### 热点渠道（该领域的核心信息源）
- [ ] GitHub Trending（技术类）
- [ ] Product Hunt（产品类）
- [ ] 知乎热榜（讨论类）
- [ ] 小红书热门（生活方式类）
- [ ] 36氪/虎嗅（商业类）
- [ ] 行业垂直媒体：[具体名称]
- [ ] 关键作者：[作者列表]

### 领域语言
- 常用术语：[术语列表]
- 行业黑话：[黑话列表]
- 读者熟悉的引用：[如"ChatGPT"、"FIRE运动"]

### 对标作者
- [作者A] — [平台] — [学习点]
- [作者B] — [平台] — [学习点]

### 监测关键词
主关键词：[核心词]
扩展关键词：[相关词]
排除关键词：[不相关词]
```

使用方式：
- 首次使用某主题时，系统引导你创建主题配置
- 后续该主题的所有skill自动使用配置中的参数
- 支持多主题切换（"切换到职场主题"、"用AI主题分析这个选题"）

## 快速模式

### 模式A：一键创作
"帮我写一篇关于XX的文章"
自动走完整流水线：
1. self-learn 读取用户风格偏好
2. topic-analyzer 分析选题（使用主题配置）
3. article-writer 生成初稿（匹配用户风格）
4. humanize-writing 去AI感
5. content-publisher 适配目标平台
6. self-learn 记录本次创作决策

### 模式B：监测+创作
"监测AI领域的新动态，有值得写的告诉我"
1. topic-monitor 设置AI领域监测
2. 发现高相关性内容时主动推送
3. 用户确认后进入模式A

### 模式C：对标+差异化
"分析一下[对标作者]，我想做类似内容"
1. author-analyzer 深度分析对标作者
2. topic-analyzer 找到差异化切入点
3. 进入模式A创作

### 模式D：自动发布
"这篇文章帮我定时发布到微信和小红书"
1. content-publisher 适配微信+小红书格式
2. auto-publisher 设置定时发布
3. 发布后 content-analytics 自动追踪数据

### 模式E：视频创作
"帮我写一个关于XX的短视频脚本"
自动走视频流水线：
1. self-learn 读取用户风格偏好
2. video-script-writer 生成脚本（含黄金3秒hook）
3. humanize-writing 口语化改写
4. content-publisher 适配目标视频平台（抖音/B站/YouTube）
5. self-learn 记录本次创作决策

### 模式F：小说连载
"帮我写一章小说"
1. novel-writer 读取世界观设定和前文大纲
2. 生成新章节（黄金三章法则 + 悬念钩子）
3. humanize-writing 润色
4. content-publisher 适配目标小说平台（番茄/起点/Wattpad/KDP）
5. self-learn 记录角色发展和读者反馈

### 模式G：全矩阵发布
"这篇文章帮我全平台发布"
1. content-strategist 规划矩阵发布策略
2. content-publisher 为每个平台生成适配版本
3. cross-platform-sync 协调发布时间和节奏
4. auto-publisher 执行定时发布
5. content-marketing 发布后增长运营

### 模式H：知识变现规划
"我想把内容变现"
1. knowledge-monetization 分析内容资产和变现路径
2. content-strategist 规划变现内容矩阵
3. 生成变现产品（课程大纲/电子书结构/社群方案）
4. auto-publisher 发布到变现平台

## 内容日历模式

当用户说"规划本周内容"、"内容排期"时：
1. self-learn 读取历史最佳发布时间和效果数据
2. topic-monitor 推荐本周可写的选题
3. 基于平台最佳时间表生成排期
4. 为每个时间槽分配skill执行计划

## 平台最佳发布时间速查

| 平台 | 频率 | 最佳时间 (CST) | 核心指标 |
|------|------|---------------|---------|
| 微信公众号 | 1-2/周 | 二/四 20:00-21:00 | 阅读量+转发 |
| 小红书 | 3-5/周 | 每日 12:00-13:00, 20:00-22:00 | CES评分 |
| 知乎 | 1/周 | 三/日 12:00-14:00 | 赞同+收藏 |
| 掘金 | 1/周 | 二/四 10:00-12:00 | 浏览+点赞 |
| 即刻 | 每日 | 任意时间 | 互动讨论 |
| X/Twitter | 每日 | 08:00-10:00 | Retweets |
| LinkedIn | 2-3/周 | 二-四 08:00-09:00 | Comments |
| Dev.to | 1/周 | 与掘金同步 | Claps |
| 抖音 | 每日1-3条 | 12:00-13:00, 18:00-20:00 | 完播率+互动率 |
| B站 | 2-3/周 | 五/六/日 18:00-20:00 | 播放+三连 |
| YouTube | 1-2/周 | 根据受众时区 | Watch Time+CTR |
| 视频号 | 每日1-2条 | 12:00-13:00, 20:00-21:00 | 转发+完播 |
| 番茄小说 | 日更4000+ | 固定时间更新 | 读完率+追更 |
| 起点 | 日更4000+ | 固定时间更新 | 月票+订阅 |
| Wattpad | 周更2-3章 | 周末 | Reads+Votes |
| Kindle KDP | 一次性发布 | 任意 | 销量+Review |

## 内容形态矩阵

ContentLoop 支持多种内容形态的协同生产：

| 形态 | 核心Skill | 辅助Skill | 发布平台 |
|------|----------|----------|---------|
| 深度文章 | article-writer | humanize-writing, content-publisher | 公众号/知乎/掘金/即刻 |
| 短视频 | video-script-writer | humanize-writing, content-publisher | 抖音/视频号/B站/YouTube |
| 中视频 | video-script-writer | content-repurposer | B站/YouTube |
| 网文小说 | novel-writer | humanize-writing | 番茄/起点/晋江/Wattpad |
| 出版小说 | novel-writer | content-publisher | KDP/实体出版 |
| 图文笔记 | article-writer | content-publisher | 小红书/即刻 |
| 付费课程 | knowledge-monetization | article-writer | 小鹅通/知识星球/Teachable |
| 电子书 | knowledge-monetization | novel-writer/article-writer | KDP/ Gumroad |

同一主题可一鱼多吃：
- 文章 → 拆成短视频脚本（content-repurposer）
- 视频 → 转文章/图文（content-repurposer）
- 小说 → 拆成短视频引流（content-repurposer + video-script-writer）
- 课程 → 拆成免费文章引流（content-repurser）

## 全平台SOP速查

### 国内平台矩阵
| 平台 | 内容类型 | 发布频率 | 核心算法 | 关键动作 |
|------|---------|---------|---------|---------|
| 微信公众号 | 长文 | 1-2/周 | 打开率+分享 | 标题优化+封面图 |
| 小红书 | 图文/短视频 | 3-5/周 | CES评分 | 关键词+封面+标签 |
| 知乎 | 问答/文章 | 1/周 | 赞同+收藏 | 回答热题+长尾SEO |
| 抖音 | 短视频 | 每日1-3 | 完播率+互动 | 黄金3秒+音乐+标签 |
| B站 | 中视频 | 2-3/周 | 播放+三连 | 封面+标题+分区 |
| 视频号 | 短视频 | 每日1-2 | 转发+完播 | 社交裂变+直播联动 |
| 番茄小说 | 网文 | 日更4000+ | 读完率 | 黄金三章+日更 |
| 起点 | 网文 | 日更4000+ | 月票+订阅 | 新书期+推荐位 |

### 海外平台矩阵
| 平台 | 内容类型 | 发布频率 | 核心算法 | 关键动作 |
|------|---------|---------|---------|---------|
| X/Twitter | 短内容 | 每日 | 互动率 | 线程+话题标签 |
| LinkedIn | 职场内容 | 2-3/周 | Comments | 专业见解+故事 |
| Medium | 长文 | 1-2/周 | Reads+Claps | Publication投稿 |
| YouTube | 视频 | 1-2/周 | Watch Time | 缩略图+标题+SEO |
| Wattpad | 小说 | 周更2-3 | Reads+Votes | 封面+标签+互动 |
| Kindle KDP | 电子书 | 一次性 | 销量+Review | 封面+描述+关键词 |
| Reddit | 讨论 | 按需 | Upvotes | 社区规则+价值贡献 |
| Dev.to | 技术文章 | 1/周 | Reactions | 标签+系列文章 |

## 自进化机制

ContentLoop 通过 self-learn 实现持续进化：

### 记忆积累
每次创作后自动记录：
- 风格记忆：你的写作风格特征
- 决策记忆：你的选择偏好（标题/结构/平台）
- 效果记忆：什么有效、什么无效
- 素材记忆：金句、案例、数据点

### 反馈闭环
创作 → 发布 → 数据 → 分析 → 学习 → 优化 → 下次创作

### 主动进化
- 系统不确定时主动询问你（最小化打扰）
- 根据历史行为预测你的偏好
- 定期生成"进化报告"，展示学习成果

## 与已有Skill的协作关系

| 场景 | 先用 | 再用ContentLoop |
|------|------|--------------|
| 有零散素材想整理 | writing-fragments | article-writer 使用素材 |
| 有素材需要精雕成文章 | writing-shape | content-publisher 发布 |
| 文章需要精修 | edit-article | content-publisher 发布 |
| 需要发布到飞书 | content-publisher 生成 → | lark-doc 发布 |
| 需要生成PDF | content-publisher 生成 → | pandoc 转换 |

## 默认处理规则

- 未指定主题 → 使用默认主题或询问用户
- 未指定平台 → 默认微信公众号为主平台，同时适配小红书+即刻
- 未指定字数 → 按平台默认甜蜜点
- 未指定风格 → 从 self-learn 读取用户风格，无记录则用口语化第一人称
- 未指定结构 → 从 self-learn 读取用户偏好，无记录则用6段式
- 无选题素材 → topic-monitor 检查是否有监测到的新话题 → 否则走 trending-discover 找热点

## 进化路线图

### Phase 1（当前）— 核心流水线
- [x] 20个skill创建完成
- [x] 主题适配系统
- [x] 自学习引擎基础架构
- [x] 视频+小说+营销+变现全链路覆盖

### Phase 2 — 数据驱动进化
- [ ] 每次创作后自动记录完整数据
- [ ] 基于效果数据自动优化标题公式、结构偏好、发布时间
- [ ] 素材库自动积累和管理

### Phase 3 — 自动化增强
- [ ] topic-monitor 定时扫描（每日自动推送选题）
- [ ] auto-publisher 一键全平台定时发布
- [ ] comment-analyzer 自动监控+回复建议
- [ ] content-analytics 周报自动生成

### Phase 4 — AI深度协作
- [ ] self-learn 训练个人写作风格模型
- [ ] 自动识别内容缺口（竞品写了什么你没写）
- [ ] 读者画像动态更新
- [ ] A/B测试自动执行和结果分析
