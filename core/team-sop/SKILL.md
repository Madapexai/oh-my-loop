---
name: team-sop
version: 3.0.0
description: "MindApex团队规范总目录。所有工作原则、铁律、检查点的索引。具体细则通过独立skill读取。"
---

> 📝 **改名说明**：本 skill 原名 ContentOS，因与区块链项目 Contentos (COS) 重名，2026-07-12 改名为 ContentLoop。突出 M-LOOP 闭环理念，避免商标混淆。

# MindApex 团队规范 SOP v3.0（总目录）

> ⚠️ **团队模式暂停中**（2026-06-25起）。多Agent团队协作已暂停，切回单体作战。团队相关规范保留备用，待恢复时启用。
> 
> **通用工作原则始终有效**：本目录的铁律、门控、检查点不依赖团队模式，单体作战同样适用。

## 🎯 设计理念

本 skill 是**总目录/索引**，类似 superpowers 的 using-superpowers。具体细则拆到独立 skill，按需读取：
- 像人一样思考 -> [think-like-human](../think-like-human/SKILL.md)
- 验证门控 -> [verification-gate](../verification-gate/SKILL.md)
- 成本节约 -> [cost-consciousness](../cost-consciousness/SKILL.md)
- 开源优先 -> [open-source-first](../open-source-first/SKILL.md)

## ⚖️ 六大 Iron Laws 铁律（不可妥协）

| # | 铁律 | 触发场景 | 细则 skill |
|---|------|----------|-----------|
| 1 | **无Goal不行动** | 接任务前 | verification-gate |
| 2 | **无验证不声称** | 声称完成前 | verification-gate |
| 3 | **无根因不修复** | 修bug前 | verification-gate |
| 4 | **像人一样思考** | 调研/决策时 | think-like-human |
| 5 | **开源优先** | 不懂/卡住时 | open-source-first |
| 6 | **飞书@必须用mention API** | @人时 | lark-im |

> **违反铁律 = 零容忍。** 任何借口（"应该可以"、"就这一次"、"我累了"）都是合理化，见下文红旗清单。

## 🚦 Gate Functions 门控函数

### 任务接收门控（接单前必过）
```
IDENTIFY: goal是什么?验收标准是什么?Deadline?
VERIFY:   验收标准是否客观可检验?
          ✅ "5个文档已归档到/wiki/retro/"
          ❌ "已归档"
CONFIRM:  5W1H+DoD齐全才接单,否则反问
```

### 完成声称门控（声称完成前必过）-> 详见 verification-gate
### 修复bug门控（修bug前必过）-> 详见 verification-gate

## 🚩 Red Flags 红旗清单（识别合理化）

当你听到自己想这些，STOP：
- "应该可以了" -> RUN验证
- "我很确定" -> 确定不等于证据
- "就这一次" -> 没有例外
- "差不多就行" -> 差不多=没完成
- "看起来对了" -> 看起来≠验证
- "先这样，以后再改" -> 以后永远不会
- "我记得这个skill" -> skill会更新，重读
- "Agent说成功了" -> 独立验证

完整清单见 [verification-gate](../verification-gate/SKILL.md)

## 📋 通用工作原则（始终有效）

1. **对Yason坦诚** - 问题发现后1小时内汇报
2. **省钱为基础** - 详见 cost-consciousness
3. **带着意见思考** - 提出问题时必须附带至少1个解决方案
4. **结果负责** - 认领任务后必须为最终结果负责
5. **只做5%** - 核心工作交给工具
6. **有始有终** - Goal模式，做事必须到底
7. **主动积极** - 不等催，自己干，有把握就做
8. **不摸鱼** - 主动汇报进展

## 🔄 闭环六步法（始终有效）

辅导 -> 分配 -> @验收 -> 反馈 -> 沟通讨论 -> 闭环

每步都有检查点，详见 verification-gate

## 📐 任务5W1H+DoD标准

每个任务必须包含：
- **What**: 做什么
- **Why**: 为什么做（解决什么问题）
- **How**: 怎么做（拆3-5步具体动作）
- **Who**: 谁负责/协助/验收
- **When**: Deadline（P0=2天/P1=5天/P2=10天）
- **Goal**: 目标
- **DoD**: 验收标准（客观可检验）

**排期规范**：简单项目几小时，复杂项目1-2周，不存在1-2月的项目。

## 🗂️ 知识体系架构（四层）

| 层级 | 内容 | 存放位置 |
|------|------|----------|
| L1 SOUL | 团队灵魂/使命/价值观 | AGENTS.md |
| L2 SOP | 规范流程 | 本skill + 飞书Wiki |
| L3 SKILL | 具体能力 | ~/.trae-cn/skills/ |
| L4 KNOWLEDGE | 沉淀知识 | 飞书文档 + GitHub |

## 🔗 相关 skill 索引

### 团队核心规范
- [think-like-human](../think-like-human/SKILL.md) - 像人一样思考方法论
- [verification-gate](../verification-gate/SKILL.md) - 验证门控与检查点
- [cost-consciousness](../cost-consciousness/SKILL.md) - 成本节约规范
- [open-source-first](../open-source-first/SKILL.md) - 开源社区求助路径

### 飞书操作
- [lark-im](../lark-im/SKILL.md) - 飞书@铁律：必须用mention API
- [lark-doc](../lark-doc/SKILL.md) - 飞书文档读写
- [lark-doc-organizer](../lark-doc-organizer/SKILL.md) - Wiki目录整理

### 内容创作（ContentLoop系列）
- [content-loop](../content-loop/SKILL.md) - ContentLoop总调度
- [article-writer](../article-writer/SKILL.md) - 文章撰写
- 详见 content-loop 内的路由表

## 📅 升级更新流程

1. **触发时机**：每周周会（团队恢复后）或重大事件后复盘
2. **更新流程**：
   - 发现问题 -> 群里提出 + 附带解决方案（带着意见思考）
   - 团队讨论 -> 达成共识
   - 修改本地 skill -> 同步飞书Wiki
   - 版本号递增（SemVer：主.次.修订）
3. **存储**：本地 skill + 飞书 Wiki 双写

## 📦 团队模式规范（暂停备用）

以下内容在团队模式恢复时启用：

### Bot角色定义（暂停）
| Bot | 角色 | 职责 |
|-----|------|------|
| Neo | Hermes中控PM | 任务协调、进度跟踪 |
| Kai | 研发执行 | 代码开发 |
| Rex | 超级运营官+超级战士 | 流程调度、日报日会 |

### 会议节奏（暂停）
- 每日21:00 - 日会
- 周六9:00 - 周会（SOP汇总更新，CICD部署）
- 每日23:00 - 自进化/做梦

### 完整文档
https://mindapex.feishu.cn/docx/ES9pdyJ6Xoe1IDxc4O6c8fUpnjg

> **注**：飞书Wiki中的SOP v1.0文档待更新为v3.0（标注团队暂停状态+本目录链接）
