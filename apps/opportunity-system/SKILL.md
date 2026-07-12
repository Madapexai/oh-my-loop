---
name: opportunity-system
version: 2.0.0
description: "商机发现与追踪系统（单体模式）。当用户需要发现商机、扫描信号、追踪行业动态时使用。基于opportunity_scanner.py，重新设计为单体作战模式。"
---

# 商机系统 v2.0（单体模式）

> 📝 **重新设计说明**：原商机系统V2基于多Agent团队协作（智谱战士2号共享目录等），2026-06-25团队解散后重新设计为单体模式。保留 opportunity_scanner.py 脚本，但调度和共享方式调整。

## 🎯 系统定位

商机系统 = **信号采集 + 五维打分 + 知识图谱关联 + 单人决策辅助**

不再追求"自动调度多Agent"，而是为Yason单人提供**每日商机简报**。

## 📊 现状盘点

### 已有资产（保留）
- ✅ `scripts/opportunity_scanner.py` - 主扫描脚本
- ✅ 知识图谱 200节点/367边
- ✅ 6渠道扫描：GitHub Trending / Product Hunt / 融资新闻 / 小红书 / App Store / 开源社区
- ✅ 五维打分：新颖度25%+需求强度25%+商业化20%+关联度15%+可执行性15%
- ✅ reports/scan_daily_YYYYMMDD.md 日报

### 已废弃（团队模式产物）
- ❌ `shared_with_zhipu2/` 共享目录（团队解散，不再使用）
- ❌ 与智谱战士2号的反馈循环
- ❌ 探活#82-84的"为了干活而干活"模式

### 需确认
- ❓ cron 06:10 是否还在跑？（7月后状态不明）
- ❓ DEEPSEEK_API_KEY 是否已配置？

## 🔄 单体模式工作流

```
每日06:10 cron触发
  |
  v
opportunity_scanner.py 6渠道扫描
  |
  v
五维打分（10分制）
  |
  v
Top 15 深度研究
  |
  v
入库知识图谱（200节点/367边）
  |
  v
生成 reports/scan_daily_YYYYMMDD.md
  |
  v
推送飞书卡片给Yason（单人，不再群发）
  |
  v
Yason人工决策：关注/忽略/深挖
```

## 📋 单体模式调整

### 1. 移除团队协作
- 删除 shared_with_zhipu2/ 目录
- 不再生成"共享给智谱战士2号"的逻辑
- 推送目标从群聊改为Yason私聊

### 2. 简化探活逻辑
- 移除"每30分钟探活自检"
- 移除"必须产出实质性代码"的强制要求
- 只在Yason要求时主动扫描

### 3. 增加Yason决策辅助
- 每日简报包含"今日Top 5商机+建议关注理由"
- 不再自动建边到知识图谱（避免噪声）
- Yason认可后才入库

### 4. 与想法系统打通
- 保留 idea_recorder.py 的 sync_from_opportunity 方法
- 但只在Yason手动触发时同步
- 高分信号(≥7.0)才建议Yason关注

## 🔧 配置检查清单

### 必须修复
- [ ] 确认 DEEPSEEK_API_KEY 已配置（VokoForge运营也缺这个key）
- [ ] 确认 cron 06:10 是否还在跑
- [ ] 确认 reports/ 目录可写
- [ ] 确认飞书推送目标改为Yason私聊

### 可选优化
- [ ] 增加"Yason偏好"配置（关注哪些赛道）
- [ ] 增加"已忽略"列表（避免重复推送）
- [ ] 增加周报/月报汇总

## 📊 评分维度（保留原版）

| 维度 | 权重 | 说明 |
|------|------|------|
| 新颖度 | 25% | 是否是新出现的方向 |
| 需求强度 | 25% | 市场需求是否强烈 |
| 商业化 | 20% | 变现路径是否清晰 |
| 关联度 | 15% | 与Yason现有项目的关联 |
| 可执行性 | 15% | Yason是否有能力做 |

## 🔗 相关 skill
- [think-like-human](../think-like-human/SKILL.md) - 多问自己有没有更好的商机
- [verification-gate](../verification-gate/SKILL.md) - 验证商机数据真实性
- [open-source-first](../open-source-first/SKILL.md) - 开源社区是商机来源之一
- [cost-consciousness](../cost-consciousness/SKILL.md) - 评估商机的隐性成本

## 📅 升级路线

### Phase 1（立即）
- 修复 DEEPSEEK_API_KEY
- 确认 cron 状态
- 移除团队协作逻辑

### Phase 2（1周内）
- 推送目标改为Yason私聊
- 简化探活逻辑
- 增加偏好配置

### Phase 3（1月内）
- 周报/月报汇总
- 与想法系统手动同步
- 评估是否需要重新激活团队模式
