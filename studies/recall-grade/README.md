# recall-grade

翻开之后提交的是记得程度，还是只是下一张？翻面是为了对照；提交的是间隔。

理念说明见 [idea.md](idea.md)。

## 运行

独立 playground：

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5199/`。

在 Lab 里打开：`make dev` → `http://127.0.0.1:5173/s/recall-grade`。

舞台：`/s/recall-grade/stage?state=answer`（默认，三个打分按钮可见）。`state=question` 只有「查看答案」。`state=empty` 是今日无到期的人话空状态。

建议按这个顺序点一遍，对照会最清楚：

1. 问题面：先想，只能点「查看答案」。不要在这一面打分。
2. 答案面：对照「我的答案 / 正确答案」，再点忘了 / 模糊 / 记得。忘了会回到今天末尾，不是明天。
3. 把三张都交完：空状态是图标 + 人话 + 「再练一遍」，不是「暂无数据」。
