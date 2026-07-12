# 🤝 Contributing to Oh My Loop

感谢你有兴趣贡献 Oh My Loop！这个项目欢迎任何形式的贡献。

## 快速贡献

### 修typo / 小修复

1. Fork 仓库
2. 直接在 GitHub Web 界面编辑
3. 提PR

### 新增skill

1. **Fork & Clone**
```bash
git clone https://github.com/<your-username>/oh-my-loop.git
```

2. **创建分支**
```bash
git checkout -b feat/your-skill-name
```

3. **创建skill目录**
```bash
# 底层方法论
mkdir -p core/your-skill-name

# 或应用层
mkdir -p apps/<scenario>/your-skill-name
```

4. **写 SKILL.md**（参考 [template](core/team-sop/SKILL.md)）

5. **本地测试**
```bash
# 复制到你的trae skills目录测试
cp -r core/your-skill-name ~/.trae-cn/skills/
```

6. **提PR**
```bash
git add .
git commit -m "feat: add your-skill-name skill"
git push origin feat/your-skill-name
```

## Skill 编写规范

### 必须包含的元素

```markdown
---
name: your-skill-name
version: 1.0.0
description: "一句话说清做什么。当用户XXX时使用。"
---

# Skill 名称

> 📝 如果有改名/调整历史，写在这里

## 🎯 核心理念
（这个skill解决什么问题，为什么这样设计）

## 📋 使用场景
（什么情况下用这个skill）

## 🔄 工作流
（具体步骤，最好有Mermaid图）

## ✅ 检查点
（每个阶段的验证清单）

## 🔗 相关skill引用
（引用其他skill的相对路径）
```

### 质量要求

- [ ] 有使用示例（至少3个）
- [ ] 有Mermaid架构图（如果适用）
- [ ] 有检查点清单
- [ ] 引用了core的skill（如果是app层）
- [ ] 没有重复已有skill的功能

### 命名规范

- skill名：`kebab-case`（如 `topic-analyzer`）
- 目录名：与skill名一致
- 文件名：`SKILL.md`（大写）

## PR 审查清单

审阅者会检查：

- [ ] SKILL.md 格式正确
- [ ] 有YAML frontmatter
- [ ] 引用路径正确（相对路径）
- [ ] 没有硬编码绝对路径
- [ ] 没有敏感信息（token/password）
- [ ] 中英文标点正确

## 行为准则

- 尊重所有贡献者
- 用数据说话，不用情绪
- 带着意见思考——提问题附带解决方案
- 对社区坦诚——问题及时汇报

## 发布流程

维护者会：

1. 审查PR（1-3天）
2. 合并到 main
3. 更新版本号
4. 发布release notes

## 联系方式

- GitHub Issues：bug报告 + feature请求
- GitHub Discussions：问答 + 讨论
- 邮件：madapexai@users.noreply.github.com

感谢你的贡献！🙏
