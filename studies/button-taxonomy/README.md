# button-taxonomy

「做个按钮」只说了能点。先定这一区的主操作、次操作还是弱操作，一区只能有一个面状。

理念说明见 [idea.md](idea.md)。

## 运行

独立 playground：

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5190/`。

在 Lab 里打开：`make dev` → `http://127.0.0.1:5173/s/button-taxonomy`。

建议按这个顺序点一遍，对照会最清楚：

1. 面状：立即下载，实心，这一区最重，只能有一个
2. 线状：了解更多，一圈描边，不跟主按钮抢戏
3. 文字：稍后再说，没有铬；不是去别的页的链接
4. 对照错例：同一条里两个面状

舞台查询：`?stage=1&kind=solid|outline|text&state=ok|wrong`，默认 `solid` / `ok`。`wrong` 是两个主按钮。
