import { loc, type Localized } from "./site-locale";
import type { ValueUnit } from "./format";

export type DimFlag = "drop" | "rise";

export type DimRow = {
  id: string;
  name: Localized;
  primary: number;
  secondary: number;
  yoy: number;
  mom: number;
  share: number;
  flag?: DimFlag;
  children?: DimRow[];
};

export type KpiRow = {
  id: string;
  label: Localized;
  unit: ValueUnit;
  hint: Localized;
  value: number;
  yoy: number;
  mom: number;
  spark: number[];
};

export type BoardFixture = {
  name: Localized;
  role: Localized;
  question: Localized;
  dimension: Localized;
  primaryLabel: Localized;
  kpis: KpiRow[];
  dimensions: DimRow[];
  insight: { title: Localized; body: Localized; culpritId: string };
};

/** One ops week. Sparks are seven points, not a generated month. */
export const BOARD: BoardFixture = {
  name: loc("产品运营", "Ops"),
  role: loc("运营负责人", "Ops lead"),
  question: loc("用户活跃和渠道表现", "activity and channels"),
  dimension: loc("渠道", "Channel"),
  primaryLabel: loc("用户数", "Users"),
  kpis: [
    {
      id: "dau",
      label: loc("DAU", "DAU"),
      unit: "number",
      hint: loc("当日活跃用户", "Daily active users"),
      value: 28460,
      yoy: 8.7,
      mom: 4.2,
      spark: [24800, 25120, 24980, 26200, 27100, 27840, 28460],
    },
    {
      id: "ctr",
      label: loc("CTR", "CTR"),
      unit: "percent",
      hint: loc("点击率", "Click-through rate"),
      value: 5.2,
      yoy: 0.6,
      mom: -0.4,
      spark: [5.7, 5.62, 5.5, 5.44, 5.35, 5.28, 5.2],
    },
    {
      id: "new",
      label: loc("新增", "New"),
      unit: "number",
      hint: loc("当日新安装并活跃", "New and active today"),
      value: 4218,
      yoy: 12.4,
      mom: -9.5,
      spark: [4680, 4590, 4480, 4410, 4320, 4260, 4218],
    },
  ],
  dimensions: [
    {
      id: "organic",
      name: loc("自然流量", "Organic"),
      primary: 12820,
      secondary: 6.1,
      yoy: 14.2,
      mom: 8.1,
      share: 45.0,
      flag: "rise",
    },
    {
      id: "feed",
      name: loc("信息流广告", "Feed ads"),
      primary: 9460,
      secondary: 4.8,
      yoy: -8.6,
      mom: -12.4,
      share: 33.2,
      flag: "drop",
      children: [
        {
          id: "feed-splash",
          name: loc("开屏首刷", "Splash"),
          primary: 4210,
          secondary: 5.4,
          yoy: -2.1,
          mom: -4.2,
          share: 14.8,
        },
        {
          id: "feed-mid",
          name: loc("信息流中插", "In-feed"),
          primary: 3180,
          secondary: 4.1,
          yoy: -16.8,
          mom: -18.6,
          share: 11.2,
          flag: "drop",
        },
      ],
    },
    {
      id: "social",
      name: loc("社交分享", "Social"),
      primary: 6180,
      secondary: 3.9,
      yoy: 3.1,
      mom: 1.2,
      share: 21.7,
    },
  ],
  insight: {
    title: loc("下降主要来自信息流广告", "The drop is in feed ads"),
    body: loc(
      "DAU 还在涨，CTR 与信息流同步走弱。真正拖累的是「信息流中插」。",
      "DAU is still up; CTR fell with feed. The drag is in-feed ads.",
    ),
    culpritId: "feed",
  },
};

export const DEFAULT_KPI = BOARD.kpis[0]!.id;
export const DEFAULT_DIM = BOARD.insight.culpritId;

export function findKpi(id: string | null): KpiRow {
  return BOARD.kpis.find((k) => k.id === id) ?? BOARD.kpis[0]!;
}

export function findDim(id: string | null): DimRow | undefined {
  if (!id) return undefined;
  for (const row of BOARD.dimensions) {
    if (row.id === id) return row;
    const child = row.children?.find((c) => c.id === id);
    if (child) return child;
  }
  return undefined;
}
