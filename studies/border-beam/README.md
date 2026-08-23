# border-beam

高光沿圆角边框绕行，不要铺满卡片。

理念说明见 [idea.md](idea.md)。

## 运行

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5197/`。

在 Lab 里打开：`make dev` → `http://127.0.0.1:5173/s/border-beam`。

舞台：`?stage=1&kind=beam&state=run`（默认）。`kind=fill` 是铺满反例；`state=park` 把高光停在边上。

切到「边框光束」应只见边框上的弧在走。切到「铺满」整张卡会亮。打开「停住」可把光束钉在一角。
