---
name: verification-gate
version: 1.0.0
description: "验证门控与检查点。当用户需要声称完成、修复bug、接任务、做决策时使用。证据先于声称，无验证不声称。参考开源verification-before-completion+systematic-debugging范式。"
---

# 验证门控与检查点

## 🎯 核心理念

> "Claiming work is complete without verification is dishonesty, not efficiency."
> "Evidence before claims, always."
> -- verification-before-completion

> Yason原话："检验标准是什么，怎么检验都不清楚"（6-14批评看板）

## ⚖️ 三大 Iron Laws（不可妥协）

### 铁律1: 无Goal不行动
任何任务必须有明确goal和客观可检验的验收标准。

### 铁律2: 无验证不声称
声称完成前必须跑验证命令，出示新鲜证据。

### 铁律3: 无根因不修复
修复bug前必须完成根因调查，不猜不试。

## 🚦 Gate Function: 任务接收门控

```
IDENTIFY: goal是什么?验收标准是什么?Deadline?
VERIFY:   验收标准是否客观可检验?
          ✅ "5个文档已归档到/wiki/retro/"
          ❌ "已归档"
          ✅ "测试34/34通过,exit 0"
          ❌ "测试通过"
          ✅ "API返回code=0"
          ❌ "API通了"
CONFIRM:  5W1H+DoD齐全才接单,否则反问
```

### 5W1H+DoD模板
- What: 做什么
- Why: 为什么做（解决什么问题）
- How: 怎么做（拆3-5步）
- Who: 谁负责/协助/验收
- When: Deadline（P0=2天/P1=5天/P2=10天）
- Goal: 目标
- DoD: 验收标准（客观可检验）

## 🚦 Gate Function: 完成声称门控

```
BEFORE claiming any status:

1. IDENTIFY: 什么命令能证明这个claim?
2. RUN:      执行完整命令(新鲜输出,不是之前的)
3. READ:     完整输出 + exit code + 失败数
4. VERIFY:   输出是否确认claim?
   - NO  -> 陈述实际状态+证据
   - YES -> 陈述claim+证据
5. CLAIM:    只有YES才能声称完成

跳过任何一步 = 撒谎,不是验证
```

### 常见claim的验证要求

| Claim | 需要的验证 | 不够的 |
|-------|-----------|--------|
| 测试通过 | 测试命令输出:0 failures | 之前的运行、"应该通过" |
| Linter干净 | Linter输出:0 errors | 部分检查、推断 |
| 构建成功 | 构建命令:exit 0 | Linter通过、日志看起来好 |
| Bug修复 | 测试原始症状:passes | 代码改了、假设修好了 |
| 回归测试有效 | Red-green循环验证 | 测试通过一次 |
| Agent完成 | VCS diff显示变更 | Agent报告"成功" |
| 需求满足 | 逐行清单核对 | 测试通过 |

## 🚦 Gate Function: 修复bug门控（4阶段）

### Phase 1: 根因调查（必须完成才能进入Phase 2）

1. **仔细读错误信息** - 不跳过，stack trace完整读，记行号/文件/错误码
2. **稳定复现** - 能可靠触发吗？步骤是什么？每次都发生吗？
3. **检查最近变更** - git diff/最近commit/新依赖/配置变更
4. **多组件系统加诊断** - 每个组件边界log，定位失败层
5. **追踪数据流** - bad value从哪来？谁调用的？往上追到源头

### Phase 2: 模式分析

1. 找工作中的类似代码
2. 完整读参考实现（不skim）
3. 列出工作vs损坏的所有差异
4. 理解依赖

### Phase 3: 假设与测试

1. **形成单一假设** - "我认为X是根因，因为Y"
2. **最小测试** - 一次只改一个变量
3. **验证** - 成功->Phase 4；失败->新假设，不叠加fix
4. **不懂就说不懂** - 不装懂

### Phase 4: 实现

1. **创建失败测试** - 最简复现
2. **单一修复** - 一次一个改动，不"顺手改"
3. **验证修复** - 测试通过？没破坏其他？
4. **3次失败熔断** - STOP，质疑架构，不试第4次

## 🚩 Red Flags 红旗清单（识别合理化）

当你听到自己想这些，STOP：

| 想法 | 现实 |
|------|------|
| "应该可以了" | RUN验证 |
| "我很确定" | 确定不等于证据 |
| "就这一次" | 没有例外 |
| "差不多就行" | 差不多=没完成 |
| "看起来对了" | 看起来≠验证 |
| "先这样，以后再改" | 以后永远不会 |
| "我记得这个skill" | skill会更新，重读 |
| "这不算任务" | 任何动作都是任务 |
| "Agent说成功了" | 独立验证VCS diff |
| "我累了" | 累不是借口 |
| "部分验证够了" | 部分证明不了什么 |
| "紧急没时间" | 系统方法比瞎猜快 |

## 🛡️ Rationalization Prevention 合理化预防表

| 借口 | 现实 |
|------|------|
| "应该能跑通" | RUN命令 |
| "我之前试过类似" | 每次都验证 |
| "linter过了就行" | linter≠编译≠测试 |
| "Agent报告成功" | 检查VCS diff |
| "部分验证够了" | 部分证明不了什么 |
| "简单问题不用过程" | 简单问题也有根因 |
| "紧急没时间" | 系统方法比瞎猜快 |
| "先试一个fix看看" | 第一个fix定调，做对 |
| "多个改动一起测省时间" | 无法隔离什么有效，引入新bug |

## ✅ 检查点验证清单

### 任务接收检查点
- [ ] goal明确？
- [ ] 验收标准客观可检验？
- [ ] Deadline合理（简单几小时/复杂1-2周）？
- [ ] 5W1H+DoD齐全？
- 不齐全 -> 反问，不接单

### 执行中检查点
- [ ] 每步有验证？
- [ ] 中间产物已记录？
- [ ] 遇到blocker停止问？
- [ ] 不猜，不硬冲？

### 完成前检查点（verification-before-completion）
- [ ] 跑了验证命令？
- [ ] 看了完整输出？
- [ ] exit code=0？
- [ ] 失败数=0？
- [ ] 原始症状已消除？
- [ ] 没引入新问题？
- 任何一项NO -> 不能声称完成

### 修复bug检查点（diagnose Phase 6）
- [ ] 原始bug不再复现？
- [ ] 回归测试通过？
- [ ] DEBUG日志已清理？
- [ ] 临时脚本已删除？
- [ ] 正确假设已写入commit message？
- [ ] 思考：什么能预防这个bug？

## 📊 真实世界数据（参考systematic-debugging）

| 方法 | 首次修复率 | 耗时 | 引入新bug |
|------|-----------|------|-----------|
| 系统方法 | 95% | 15-30分钟 | 接近0 |
| 瞎猜瞎试 | 40% | 2-3小时 | 常见 |

## 🚫 何时必须停止（STOP）

- 遇到blocker（缺依赖、测试失败、指令不清）
- 不理解某个指令
- 验证反复失败
- 3次修复失败 -> 质疑架构，不试第4次
- 累了想凑合 -> STOP，恢复后再做

## 🔗 相关 skill
- [team-sop](../team-sop/SKILL.md) - 总目录
- [think-like-human](../think-like-human/SKILL.md) - 像人一样思考
- [systematic-debugging](../systematic-debugging/SKILL.md) - 开源调试范式
- [verification-before-completion](../verification-before-completion/SKILL.md) - 开源验证范式
- [diagnose](../diagnose/SKILL.md) - 开源诊断范式
