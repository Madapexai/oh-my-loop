# Oh My Loop - 60s Demo Video Script

Total: 60s | 6 scenes x 10s

---

## Scene 1 (0-10s) - Hook

**画面描述**
黑色背景，中央淡入一行等宽字体代码：一个写满 5 层嵌套的 agent loop（reflect -> plan -> critique -> retry）。镜头缓慢推进，loop 突然"咔哒"折叠成一行直接输出。

**字幕**
Most tasks need a simpler loop than you think.

**旁白**
"You don't need a five-step agent loop for everything. Most tasks are simpler than you think."

**音效/转场**
低频 ambient 底噪 + 键盘敲击声；折叠瞬间一声短促的"咔哒"。转场：硬切。

---

## Scene 2 (10-20s) - 简单任务演示

**画面描述**
终端窗口。光标闪烁，用户输入 `> format this string as lowercase`。回车后 0.3 秒内直接输出结果，中间没有任何 "thinking" 步骤或 loop 动画。右上角小角标显示 `pattern: zero-shot · 1 call · 320ms`。

**字幕**
Simple task -> direct answer. No loop.

**旁白**
"A string formatting task? Just generate. No reflection, no planning. Fast and cheap."

**音效/转场**
键盘打字声 + 完成时一声清脆的"ding"。转场：向右滑出。

---

## Scene 3 (20-30s) - 复杂任务演示

**画面描述**
同一终端窗口。用户输入 `> fix this bug in auth.py`。回车后显示当前 Agent 模型从完整上下文生成一个有界策略：先复现、观察失败证据，再选择修复与验证步骤。`reflexion` 作为可选原语出现，但不是固定分类结果。右上角显示 `adaptive loop · bounded`。

**字幕**
Complex task -> router picks reflexion.

**旁白**
"A bug fix? The router picks reflexion - generate, critique, regenerate."

**音效/转场**
路由选择时一声"whoosh"；critique 步骤一声低沉的"hm"。转场：zoom in 进入 GIF。

---

## Scene 4 (30-40s) - 智能路由动效

**画面描述**
全屏展示动态 Loop：任务进入模型路由器后，可以直接完成，也可以生成由多个原语组成的初始策略；每次 observation 都回流给 Agent，Agent 据此选择下一步、调整计划或停止。安全护栏独立包围整个循环。

**字幕**
Prompt-governed routing. Flexible strategy. Hard safety boundaries.

**旁白**
"One router. Five patterns. The right loop for each task - not the biggest one."

**音效/转场**
动效自带节奏感脉冲音；分流时每条支路一个音阶。转场：动效结束后淡出。

---

## Scene 5 (40-50s) - 五个 Patterns 速览

**画面描述**
五个卡片横向排列，依次翻入：
1. Zero-shot - 图标：单条直线
2. RAG - 图标：放大镜 + 直线
3. Plan-then-Execute - 图标：树状分解
4. Reflexion - 图标：环形箭头
5. Tree-of-Thought - 图标：分叉树
每张卡片下方一行小字标注典型适用场景。第 5 张翻入后，五张卡片一起轻微脉冲。

**字幕**
5 loop patterns, one methodology.

**旁白**
"Zero-shot, retrieve, plan-then-execute, reflexion, and tree-of-thought. Pick by need, not by hype."

**音效/转场**
每张卡片翻入一声"flip"音效，共五声递增。转场：卡片缩小归位。

---

## Scene 6 (50-60s) - CTA

**画面描述**
深色背景，中央浮现 Oh My Loop logo（文字标识）。下方一行等宽字体 GitHub 链接 `github.com/yourorg/oh-my-loop`，右侧出现一个 "Star" 按钮，被一只光标点击后点亮成金黄色，旁边冒出 "+1" 粒子动效。底部一行小字 `Open source · MIT · Star welcome`。

**字幕**
github.com/yourorg/oh-my-loop · Star welcome

**旁白**
"Oh My Loop - open source. Star welcome, feedback welcome."

**音效/转场**
Star 点亮时一声温暖的 chime；结尾 ambient 渐弱收束。转场：黑场结束。
