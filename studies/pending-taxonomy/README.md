# pending-taxonomy

内容还没到，屏幕上该留什么？骨架占布局位子；空状态给人话和下一步；壳未知时整页遮罩。不要转圈，不要假进度条。

理念说明见 [idea.md](idea.md)。

## 运行

独立 playground：

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5204/`。

在 Lab 里打开：`make dev` → `http://127.0.0.1:5173/s/pending-taxonomy`。

舞台：`/s/pending-taxonomy/stage?kind=skeleton&state=loading`（默认）。`state=ready` 看到真卡片。空状态：`kind=empty&state=empty`。整页遮罩：`kind=page&state=loading`。

建议按这个顺序点一遍，对照会最清楚：

1. 骨架屏：三张假卡扫光，短交叉淡入成真卡。不要转圈。
2. 空状态：0 条列表，图标 + 人话标题 + 引导 + 「新建简报」。不要「暂无数据」。
3. 整页遮罩：品牌标记盖住未知的壳，就绪后淡出。不要假进度条。
