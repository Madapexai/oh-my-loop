# oh-my-loop 宣传截图包

这个目录包含一组可运行的宣传 demo 和真实运行截图，用来支撑社媒文章里的对比说明。

## 重新生成截图

```bash
cd /Users/yason/Documents/books/github/oh-my-loop
node assets/promo-runtime-demo/capture.mjs
```

脚本会启动本地静态服务，并用 Chrome headless 截取四张图：

- `screenshots/game-runtime.png`：旋转陀螺怪兽游戏的真实 canvas 运行截图。
- `screenshots/agent-comparison.png`：有无 oh-my-loop 的对比看板运行截图。
- `screenshots/school-district-decision.png`：学区房/孩子教育决策边界截图。
- `screenshots/investment-framework.png`：投资理财决策边界截图。

## 发文时的标注建议

`game-runtime.png` 可以标注为真实运行画面。

`agent-comparison.png` 建议标注为“实验对比看板”，不要写成已经完成 OpenCode/DeepSeek/Codex 全量实测。真正的模型实测截图应再补充各 CLI 的终端输出、会话日志和最终产物截图。

生活与投资两张图可以标注为“高影响决策边界示例”，强调 oh-my-loop 只提供分析框架，不替用户做最终决定。
