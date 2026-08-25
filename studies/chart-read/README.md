# chart-read

图画好之后，这一手是读数、过滤还是改窗口。

理念说明见 [idea.md](idea.md)。

## 运行

独立 playground：

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5205/`。

在 Lab 里打开：`make dev` → `http://127.0.0.1:5173/s/chart-read`。

建议按这个顺序点一遍，对照会最清楚：

1. 框选：拖一段，松手冻结，均值峰值出来，轴没缩
2. 十字线 / 读数卡：跟着最近点，离开层就卸，图不跳
3. 图例：藏两条可以，第三条留着
4. 缩放：30 / 7 / 3 或滚轮，窗口变了
5. 下钻：渠道 → 分类 → 页面，面包屑回来——还是同一张柱图

舞台查询：`?stage=1&kind=brush|crosshair|highlight|tooltip|legend|zoom|drill`，
状态如 `brush=idle|frozen`，`legend=all|filtered`，`drill=l1|l2`，`zoom=30|7|3`。
默认 `brush` / `frozen`。
