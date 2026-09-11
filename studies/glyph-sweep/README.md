# glyph-sweep

扫光跟字形走。光带宽度用 ch，时长等于字数乘每字秒数。

理念说明见 [idea.md](idea.md)。

## 运行

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5179/`。

在 Lab 里打开：`make dev` → `http://127.0.0.1:5173/s/glyph-sweep`。

对照台左边跟字形、右边扫整块。点左边一行改字，时长应跟着字数变；右边每行仍是 1.8s / 72px。打开「停住」把高光停在字形上。
