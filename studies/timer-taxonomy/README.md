# timer-taxonomy

这一段时间是正数累计，还是倒数专注？累计没有上限；专注到 0 自己停住。

理念说明见 [idea.md](idea.md)。

## 运行

独立 playground：

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5198/`。

在 Lab 里打开：`make dev` → `http://127.0.0.1:5173/s/timer-taxonomy`。

舞台：`/s/timer-taxonomy/stage?kind=focus&state=running`（默认）。`kind=stopwatch|focus`，`state=idle|running|paused|done`。舞台锁住 elapsed，不跟墙上的钟走。

建议按这个顺序点一遍，对照会最清楚：

1. 累计：从 0 往上。开始 / 暂停 / 结束。暂停保留已过时间。不要上限，不要转圈。
2. 进行中切到「计划」：顶栏仍有一颗时间 chip。这是占用，不是第三叶。
3. 专注：playground 是 1 分钟（产品里常用 25）。数字往下走。到 0 自己停住，不是一条 toast。
