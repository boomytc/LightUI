# chart-taxonomy

「做个图表」只说了有数。先定要看变化、大小、占比、关系、流程还是能力，再选痕迹。

理念说明见 [idea.md](idea.md)。

## 运行

独立 playground：

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5187/`。

在 Lab 里打开：`make dev` → `http://127.0.0.1:5173/s/chart-taxonomy`。

舞台：`/s/chart-taxonomy/stage?kind=change&state=primary`（`state=alt` 为面积 / 横条 / 堆叠 / 热力）。

建议按这个顺序点一遍，对照会最清楚：

1. 看变化：折线跟着月份走；切到「还要体积」变成面积
2. 比大小：短名竖柱；切到「长名横条」，名字不用转角
3. 看占比：五类环形从 12 点起；内部再拆用堆叠，不是一排小饼
4. 看关系：散点不要硬连；两个维度用热力
5. 看流程：曝光 → 点击 → 付费，并列类别不是漏斗
6. 看能力：雷达看全面还是偏科，量纲必须可比较
