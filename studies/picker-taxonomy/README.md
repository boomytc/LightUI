# picker-taxonomy

这一次是选一个刻度、一段区间、按步加减、逐级路径，还是一段日期？尺子松手对齐；双端不交叉；下限禁用；换上级清空下级；止晚于起。

理念说明见 [idea.md](idea.md)。

## 运行

独立 playground：

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5230/`。

在 Lab 里打开：`make dev` → `http://127.0.0.1:5173/s/picker-taxonomy`。

舞台：`/s/picker-taxonomy/stage?kind=ruler&state=snap`（默认）。范围：`kind=range&state=span`。步进：`kind=stepper&state=floor`。级联：`kind=cascader&state=path`。日期：`kind=dates&state=span`。

建议按这个顺序点一遍，对照会最清楚：

1. 滑动标尺：指针固定，刻度横滑，松手对齐 0.1。
2. 范围滑块：两个端点，最低价到不了最高价上面。
3. 步进器：每次 1 个，减到 1 减号停。
4. 级联选择：点回「浙江省」，市和区都要重选。
5. 日期范围：先入住后离店，中间那几天亮着；今天之前的日期点不了。
