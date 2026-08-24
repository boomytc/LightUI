# scroll-chrome

滚动提示是开场邀请，还是位置轨道？邀请只在顶上；轨道点的是比例，不是章节。

理念说明见 [idea.md](idea.md)。

## 运行

独立 playground：

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5200/`。

在 Lab 里打开：`make dev` → `http://127.0.0.1:5173/s/scroll-chrome`。

舞台：`/s/scroll-chrome/stage?kind=track&state=mid`（默认）。`kind=native|cue|track`，`state=start|mid|end|fit`。

建议按这个顺序点一遍：

1. 系统条：拇指还在，连续拖。
2. 邀请：只在顶上。点箭头滚一屏，箭头卸掉。
3. 轨道：点列跟滚动比例走。点一下跳到那个比例，不是标题。
4. 舞台 `fit`：装得下，轨道 hidden。
