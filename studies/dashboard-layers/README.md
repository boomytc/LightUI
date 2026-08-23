# dashboard-layers

看板该从结果往下钻。一盘端上 KPI、图、表，扫得到皮，钻不到因。

理念说明见 [idea.md](idea.md)。

## 运行

独立 playground：

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5194/`。

在 Lab 里打开：`make dev` → `http://127.0.0.1:5173/s/dashboard-layers`。

舞台：`/s/dashboard-layers/stage?kind=layered&state=dim`（默认就能看见一次下钻）。`state=kpi` 只留结果；`state=all` 看到短明细。一盘端：`kind=platter&state=all`。

建议按这个顺序点一遍，对照会最清楚：

1. 层递：先只见 KPI；点 DAU 展开渠道表；再点「信息流广告」看短明细
2. 一盘端：KPI、小趋势、表同时在场，点了也不藏、也不钻
