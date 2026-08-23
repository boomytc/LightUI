# layout-taxonomy

「做个页面」不是同一种东西。先定这一页的骨架，再谈皮肤。

理念说明见 [idea.md](idea.md)。

## 运行

独立 playground：

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5189/`。

在 Lab 里打开：`make dev` → `http://127.0.0.1:5173/s/layout-taxonomy`。

建议按这个顺序点一遍，对照会最清楚：

1. 单栏：一条轴，正文约 42rem，不是左右栏
2. 落地：首屏 + 功能带 + CTA；gutter 24px，区块 64–96px
3. 瀑布：五张不等高卡片，不是轮播
4. 全屏：一句话占满视口
5. 分栏：两格工作区，中间一条可拖分隔，不是抽屉
6. 仪表盘：KPI + 图 + 表；左栏占位是侧栏
7. 模块拼贴：一块一个主意，网格拉齐、底栏 mt-auto
