# 🔌 Oh My Loop Plugins

Oh My Loop 支持插件扩展，以下是已规划或开发中的插件。

## 官方插件

### openmaic（动效解释引擎）

**状态**：🚧 WIP

**功能**：把skill执行过程生成动效GIF/视频，用于：
- 教学演示
- PR说明
- 社交媒体分享

**集成方式**：
```bash
# 安装openmaic
pip install openmaic

# 用oh-my-loop的skill生成动效
openmaic --skill ~/.oh-my-loop/core/think-like-human --output demo.gif
```

### loop-engineering

**状态**：📋 Planned

**功能**：Loop工程方法论插件，提供：
- M-LOOP 9步的CLI工具
- Loop断点管理
- Loop沉淀知识图谱

### voko-skills

**状态**：📋 Planned

**功能**：VokoForge AI Agent Skills 兼容层，支持：
- 导入 voko-skills 格式
- 导出为 oh-my-loop 格式
- 双向同步

## 第三方插件

欢迎开发第三方插件！只需遵循：

1. 插件目录放在 `plugins/` 下
2. 必须有 README.md
3. 必须标注兼容的 oh-my-loop 版本
4. 提PR收录到官方列表

## 插件开发指南

```python
# 示例：一个最小的oh-my-loop插件
from oh_my_loop.plugin import Plugin

class MyPlugin(Plugin):
    name = "my-plugin"
    version = "1.0.0"
    
    def on_skill_load(self, skill_path):
        """skill加载时触发"""
        pass
    
    def on_skill_execute(self, skill, input):
        """skill执行时触发"""
        pass
    
    def on_skill_complete(self, skill, output):
        """skill完成时触发"""
        pass
```

更多文档见 [Plugin API](api.md) 📋 WIP
