# LightUI

存放和探索 UI/UX 理念的工作区：自己实现过的交互，或别处遇到、值得留下来复刻的行为。

仓库：<https://github.com/boomytc/LightUI>

可呈现入口是站点（`products/lab`）：作品、图谱、笔记、关于。每个理念是独立的 `studies/<slug>/`。

## 怎么用

```bash
make install
make dev
```

浏览器打开 `http://127.0.0.1:5173/`。

只跑某一个 study 的独立 playground：

```bash
make dev-study STUDY=intent-cascade
```

`http://127.0.0.1:5174/`

## 目录

```
skills/                       本仓库的 agent skill
design/                       色板、字体、圆角（站点与 study 共用）
docs/catalog.md               由 study.json 生成的索引
docs/writing.md               公开笔记约定
writing/                      关于页 + 笔记原文
products/lab/                 站点：首页 / 作品 / 图谱 / 笔记 / 关于
studies/<slug>/               一则理念 + 独立 playground
```

根目录是工作区，可运行单元在下一层：站点在 `products/lab/`，每则理念在 `studies/<slug>/`。

## 当前 study

索引见 [docs/catalog.md](docs/catalog.md)。问题怎么串，在站点 `/graph`。

## 以后怎么长

同一问、换皮肤，给现有 study 加一种。换了一个要先回答的问题，再开 `studies/<slug>/`，用 `asks` 和 `links` 挂上。Lab 会自己扫到。不要先做组件库，也不要为空想法建空目录。

适合继续收进来的方向（有真实材料再开）：指针吸附 / 对齐参考线、两段式破坏确认、IME 安全撤销。

Agent 入口：`/lightui`、`/lightui-study`、`/lightui-lab`。
