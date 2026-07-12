# ⚙️ How Oh My Loop Works — 动效原理

> 本文解释 Oh My Loop 的设计原理：为什么这样做，以及它如何让 AI agent 像人一样工作。

## 核心理念

> "像人一样，不断地问自己是不是还有别的渠道"
> "至少问自己10个维度，每个维度不少于50个问题"
> -- MindApex 创始人 Yason

传统AI agent的工作方式是**线性的**：

```
用户提问 -> AI回答 -> 结束
```

这种方式的问题：
- ❌ 每次都从零开始
- ❌ 没有验证就声称完成
- ❌ 不会自我质疑
- ❌ 不会多视角思考
- ❌ 不会从错误中学习

Oh My Loop 的方式是**闭环的**：

```
用户提问 -> 探查 -> 规划 -> 执行 -> 验证 -> 讨论 -> 决策 -> 印证 -> 沉淀 -> 反馈 -> 下次更优
```

## 6大原理

### 原理1：Iron Laws 铁律（不可妥协）

**问题**：AI agent经常"合理化"——给自己找借口跳过验证。

> "应该可以了" / "就这一次" / "我累了" / "看起来对了"

**解决方案**：把不可妥协的原则写成铁律，任何借口都自动识别并拒绝。

```mermaid
graph LR
    A[想声称完成] --> B{跑了验证命令?}
    B -->|No| C[🚨 Red Flag<br/>识别合理化]
    B -->|Yes| D{看了完整输出?}
    D -->|No| C
    D -->|Yes| E{exit code=0?}
    E -->|No| C
    E -->|Yes| F{失败数=0?}
    F -->|No| C
    F -->|Yes| G[✅ 可以声称]
    C --> H[❌ 拒绝声称<br/>诚实陈述实际状态]

    style C fill:#e74c3c,color:#fff
    style H fill:#e74c3c,color:#fff
    style G fill:#2ecc71,color:#fff
```

**参考开源**：verification-before-completion, systematic-debugging

### 原理2：Gate Functions 门控函数

**问题**：原则太空泛，"双重验证"怎么执行不清晰。

**解决方案**：每个关键动作都有**函数式门控**——输入、处理、输出明确。

```python
# 完成·声称·门控
def gate_claim_complete(task, claim):
    """
    Returns: (can_claim: bool, evidence: str)
    """
    # IDENTIFY
    cmd = task.verify_command  # 什么命令能证明?
    
    # RUN
    raw_output = subprocess.run(cmd, capture_output=True)
    
    # READ
    output = raw_output.stdout.decode()
    exit_code = raw_output.returncode
    failures = count_failures(output)
    
    # VERIFY
    checks = {
        "exit_code_zero": exit_code == 0,
        "no_failures": failures == 0,
        "output_contains_expected": task.expected in output,
        "original_symptom_gone": not task.symptom in output,
    }
    
    # CLAIM or STATE
    if all(checks.values()):
        return True, format_evidence(checks, output)
    else:
        return False, format_actual_state(checks, output)
```

### 原理3：像人一样思考

**问题**：AI经常浅思考——只看一个维度就下结论。

**解决方案**：强制多维度展开+多视角辩论。

```mermaid
graph TB
    Q[问题来了] --> S1[自问清单<br/>5个核心问题]
    S1 --> S2[维度展开<br/>10个维度×50个问题]
    S2 --> S3[多视角辩论<br/>正方/反方/裁判]
    S3 --> S4{达成共识?}
    S4 -->|No| S5[Round 2/3<br/>深化辩论]
    S5 --> S4
    S4 -->|Yes| A[输出结论]
    
    style S2 fill:#3498db,color:#fff
    style S3 fill:#9b59b6,color:#fff
    style A fill:#2ecc71,color:#fff
```

#### 10个维度模板

1. 市场 2. 技术 3. 成本 4. 合规 5. 运营
6. 用户体验 7. 社区 8. 文档 9. 集成 10. 风险

#### 多视角辩论

```
正方：支持这个方案的理由（找优点）
反方：反对这个方案的理由（找缺点）  
裁判：综合判断，逼到最优
```

### 原理4：开源优先

**问题**：卡住就问人，浪费别人时间。

**解决方案**：5级求助阶梯，先查再问。

```mermaid
graph LR
    L1[Level 1<br/>先问自己] --> L2[Level 2<br/>问代码库]
    L2 --> L3[Level 3<br/>问开源社区<br/>90%概率有答案]
    L3 --> L4[Level 4<br/>问AI]
    L4 --> L5[Level 5<br/>最后问人<br/>带方案问]
    
    style L3 fill:#2ecc71,color:#fff
    style L5 fill:#e74c3c,color:#fff
```

#### 开源社区查询清单

- GitHub Issues/Discussions
- Stack Overflow
- Reddit
- dev.to / Hashnode / Medium
- Product Hunter
- 微信公众号 / 知乎 / 掘金 / 小红书

### 原理5：成本意识

**问题**：烧token厉害，不知道省钱。

**解决方案**：免费优先+隐性成本识别+token节约。

```mermaid
graph TD
    R[需求来了] --> F{免费能搞定?}
    F -->|Yes| FREE[用免费]
    F -->|No| C{便宜模型能搞定?}
    C -->|Yes| CHEAP[用便宜]
    C -->|No| E{必须用贵模型?}
    E -->|Yes| EXP[用，但精简prompt]
    E -->|No| RE[重新评估需求]
    
    style FREE fill:#2ecc71,color:#fff
    style CHEAP fill:#f39c12,color:#fff
    style EXP fill:#e74c3c,color:#fff
```

### 原理6：自演化

**问题**：skill是静态的，不会进化。

**解决方案**：3层记忆+4种进化机制。

```mermaid
graph TB
    U[使用skill] --> F[反馈记录]
    F --> M[3层记忆系统]
    
    M -->|短期| WM[工作记忆<br/>当前会话]
    M -->|中期| EM[情景记忆<br/>最近7天]
    M -->|长期| PM[程序记忆<br/>永久优化]
    
    PM -->|ADD| A[添加新知识]
    PM -->|UPDATE| U2[更新已有]
    PM -->|DELETE| D[删除过时]
    PM -->|NOOP| N[不操作]
    
    PM --> S[下次使用<br/>参数已优化]
    
    style PM fill:#9b59b6,color:#fff
    style S fill:#2ecc71,color:#fff
```

## 动效可视化

### 用 openmaic 可视化skill执行

> 📋 Planned：与 openmaic 插件集成，把skill执行过程生成动效GIF。

```mermaid
sequenceDiagram
    participant User
    participant Agent
    participant Core as core/think-like-human
    participant App as apps/content-loop/article-writer
    participant Gate as core/verification-gate
    participant Learn as apps/content-loop/learning/self-learn

    User->>Agent: 写一篇深度文章
    Agent->>Core: 加载思考方法论
    Core-->>Agent: 自问清单+10维度
    Agent->>App: 加载写作流水线
    App-->>Agent: 6步流水线
    Agent->>Agent: Probe -> Plan -> DAG
    Agent->>Gate: 完成前验证
    Gate-->>Agent: 检查点清单
    Agent->>Agent: Verify -> Discuss -> Confirm
    Agent->>Learn: 沉淀反馈
    Learn->>Learn: 3层记忆更新
    Agent-->>User: 带证据的文章
```

## 真实世界数据

参考 systematic-debugging 的统计：

| 方法 | 首次修复率 | 平均耗时 | 引入新bug |
|------|-----------|---------|----------|
| 系统方法（Oh My Loop） | 95% | 15-30分钟 | 接近0 |
| 瞎猜瞎试 | 40% | 2-3小时 | 常见 |

## 与其他框架的关系

Oh My Loop 不是凭空发明的，它整合了多个开源精华：

| 来源 | 借鉴了什么 | 我们的skill |
|------|-----------|------------|
| verification-before-completion | 无验证不声称 | verification-gate |
| systematic-debugging | 4阶段调试+3次熔断 | verification-gate |
| using-superpowers | skill发现+使用框架 | team-sop |
| grill-me | 多视角压力测试 | think-like-human |
| socratic-debate | 正方/反方/裁判 | think-like-human |
| self-evolving AI | 记忆系统+进化机制 | self-learn |

我们做的是**整合+中文场景适配+两层架构+Loop范式**。

## 扩展阅读

- [Architecture 详解](architecture.md)
- [M-LOOP 9步范式](loop-engineering.md) 📋 WIP
- [Skill 编写规范](../core/team-sop/SKILL.md)
