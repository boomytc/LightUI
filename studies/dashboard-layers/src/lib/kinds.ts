import { loc, type Localized } from "./site-locale";
import type { KindId } from "./machines";

export type { KindId };

export type KindMeta = {
  id: KindId;
  index: string;
  name: string;
  zh: Localized;
  oneLiner: Localized;
  scenes: Localized[];
  rules: Localized[];
  spec: Localized;
  note?: Localized;
  tells: Localized;
  window: Localized;
};

export const KINDS: KindMeta[] = [
  {
    id: "layered",
    index: "01",
    name: "Layered",
    zh: loc("层递", "Layered"),
    oneLiner: loc("点一个结果，才展开下一层", "Click a result, then the next layer"),
    scenes: [
      loc("经营排查", "An ops hunt"),
      loc("渠道归因", "Channel attribution"),
      loc("找到主因", "Find the cause"),
    ],
    rules: [
      loc("打开时只给 KPI", "On open, KPIs only"),
      loc("点一张卡才展开维度表", "A click opens the dimension table"),
      loc("点一行再给短明细", "A row click opens a short detail"),
    ],
    spec: loc(
      "做层递看板。先只给 KPI 结果；点一张卡才展开渠道表，点一行再给短明细。不要一上来铺满图和表。",
      "A layered board. Start with KPI results. A click opens the channel table; a row opens a short detail. Do not lay chart and table out on open.",
    ),
    note: loc(
      "下钻换的是粒度，不是图种。三层叠着往下滚，还是一盘端上来。",
      "A drill changes grain, not the mark. Stacked sections you scroll through are still a platter.",
    ),
    tells: loc("先看结果，点了才见到表", "Results first; the table waits for a click"),
    window: loc("层递 · 运营", "Layers · ops"),
  },
  {
    id: "platter",
    index: "02",
    name: "Platter",
    zh: loc("一盘端", "Platter"),
    oneLiner: loc("KPI、小趋势、表同时在场，扫一眼，不钻", "KPI, mini chart, table — scan, do not drill"),
    scenes: [
      loc("日报扫一眼", "A daily scan"),
      loc("监控台", "A monitor"),
      loc("不追原因", "No hunt"),
    ],
    rules: [
      loc("三块同时在场", "All three blocks in view"),
      loc("点了也不藏下一层", "A click does not hide or reveal"),
      loc("用来扫，不是用来钻", "For scanning, not drilling"),
    ],
    spec: loc(
      "做一盘端看板。KPI、小趋势、渠道表同时在场，用来扫一眼。不要下钻，不要藏表。",
      "A platter board. KPI, mini chart, and channel table are all in view, for a scan. Do not drill. Do not hide the table.",
    ),
    note: loc(
      "这是仪表盘皮：KPI + 图 + 表。层递问的是点了才展开，不是这张皮。",
      "This is the dashboard skin: KPI + chart + table. Layers ask whether the next grain waits for a click.",
    ),
    tells: loc("一眼三块，没有下一层", "Three blocks at a glance; no next layer"),
    window: loc("一盘端 · 运营", "Platter · ops"),
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc("别说「做个看板」，说层递或一盘端", "Not “a dashboard” — layered, or a platter"),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc("从结果往下钻，还是扫一眼", "Drill from the result, or scan at a glance"),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc("点一个结果才展开下一层；一盘端不钻", "A click reveals the next layer; a platter does not drill"),
  },
];
