# scroll-chrome

滚动提示是开场邀请，还是位置轨道？邀请只在顶上；轨道点的是比例，不是章节。

理念说明见 [idea.md](idea.md)。

## 运行

独立 playground：

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5206/`。

在 Lab 里打开：`make dev` → `http://127.0.0.1:5173/s/scroll-chrome`。

舞台：`/s/scroll-chrome/stage?kind=track&state=mid`（默认）。`kind=native|cue|track`，`state=start|mid|end|fit`。

建议按这个顺序点一遍：

1. 对照台：同一篇长文，左边邀请、右边轨道。先停在顶上，再滚一边。
2. 锁到中段：邀请已卸，轨道还在报比例。标题和点对不上。
3. 装得下：两根条都 hidden。
4. 系统条：第三片叶子，拇指还在，连续拖。
5. 舞台 `fit`：装得下，轨道 hidden。
