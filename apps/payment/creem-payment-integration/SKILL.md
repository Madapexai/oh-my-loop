---
name: creem-payment-integration
version: 1.0.0
description: "Creem支付接入最佳实践。当用户需要接入支付、订阅、收款、跨境支付时使用。MindApex首选支付方案，先做验证。alipay作为国内备选参考。"
---

# Creem 支付接入

## 🎯 定位

> **Yason决策（2026-07-12）**：支付走 creem，先做验证。

Creem 是 MindApex 的**首选支付方案**，原因是：
- 跨境收款友好（非国内市场）
- 集成简单（API/SDK成熟）
- 支持订阅制（SaaS场景）
- 不需要国内资质

> ⚠️ alipay-payment-integration skill 保留作为**国内备选参考**，但不再是首选。

## 📋 Creem 接入清单

### 前置准备
- [ ] 注册 Creem 账号
- [ ] 获取 API Key（Publishable Key + Secret Key）
- [ ] 配置 Webhook URL（用于支付回调）
- [ ] 设置测试模式（sandbox）

### 验证流程（Yason要求"先做验证"）

#### Phase 1: 沙箱验证
1. 创建测试产品（最低金额）
2. 走完整支付流程：下单->支付->回调->退款
3. 验证 Webhook 签名
4. 验证订单状态同步

#### Phase 2: 真实小额验证
1. 上线真实产品（¥1或$1）
2. 真实支付一笔
3. 验证到账
4. 验证退款

#### Phase 3: 正式接入
1. 接入到正式产品
2. 监控支付成功率
3. 监控 Webhook 延迟

## 🔒 安全红线

1. **Secret Key 只存密码管理器** - 不进飞书/GitHub/代码库
2. **Webhook 必须验签** - 防止伪造回调
3. **金额服务端校验** - 不信任前端传的金额
4. **幂等处理** - 同一订单重复回调不重复发货
5. **退款权限隔离** - 退款需要二次确认
6. **日志脱敏** - 不记录完整卡号/CVV
7. **HTTPS强制** - 所有API调用走HTTPS

## 🔄 与 alipay 的对比

| 维度 | Creem | Alipay |
|------|-------|--------|
| 适用市场 | 跨境/海外 | 国内 |
| 集成难度 | 低 | 中 |
| 资质要求 | 无国内资质 | 需要国内企业资质 |
| 订阅支持 | 原生支持 | 需要单独签约 |
| 费率 | 约3.5%+¥2 | 约0.6% |
| 结算周期 | T+7 | T+1 |
| Webhook | 标准 | 标准 |
| 退款 | 支持 | 支持 |

## 📐 集成架构

```
用户下单
  |
  v
后端创建Creem Order
  |
  v
返回支付链接给前端
  |
  v
用户在Creem页面支付
  |
  v
Creem Webhook回调后端
  |
  v
后端验签+幂等检查
  |
  v
更新订单状态+发货
```

## 🚫 不要做的事

- ❌ Secret Key 提交到代码库
- ❌ 前端直接调用 Creem Secret API
- ❌ 信任前端传的金额
- ❌ 不验签就处理 Webhook
- ❌ 不做幂等处理
- ❌ 日志记录完整卡号

## 🔗 相关 skill
- [alipay-payment-integration](../alipay-payment-integration/SKILL.md) - 国内备选支付方案
- [verification-gate](../verification-gate/SKILL.md) - 支付验证门控
- [cost-consciousness](../cost-consciousness/SKILL.md) - 支付费率成本评估
