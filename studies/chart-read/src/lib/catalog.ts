import { loc, pick, type Locale, type Localized } from "./site-locale";
import type { DrillNode } from "./machines";

export const DAY_COUNT = 30;
export const MAX_END = DAY_COUNT - 1;

/** 8 月访问。第 8 天异常低点，第 22 天峰值。 */
export const VISITS: readonly number[] = [
  62, 68, 71, 66, 74, 79, 73, 28, 70, 76, 82, 85, 80, 88, 91, 86, 93, 97, 92, 101, 108, 142,
  118, 110, 104, 99, 107, 112, 109, 115,
];

export const PAID: readonly number[] = [
  38, 41, 40, 44, 48, 46, 51, 22, 49, 53, 55, 52, 58, 61, 57, 63, 66, 64, 70, 74, 79, 96, 82,
  77, 73, 71, 76, 80, 78, 84,
];

export const MAIL: readonly number[] = [
  18, 21, 19, 22, 20, 24, 23, 9, 21, 25, 24, 27, 26, 29, 28, 31, 30, 33, 32, 35, 34, 48, 39,
  36, 34, 33, 35, 37, 36, 38,
];

export const ANOMALY_INDEX = 7;
export const PEAK_INDEX = 21;

export type SeriesId = "organic" | "paid" | "mail";

export const SERIES_IDS: readonly SeriesId[] = ["organic", "paid", "mail"];

export const SERIES: readonly {
  id: SeriesId;
  name: Localized;
  color: string;
  values: readonly number[];
}[] = [
  {
    id: "organic",
    name: loc("自然", "Organic"),
    color: "var(--color-accent)",
    values: VISITS,
  },
  {
    id: "paid",
    name: loc("投放", "Paid"),
    color: "var(--color-intent)",
    values: PAID,
  },
  {
    id: "mail",
    name: loc("邮件", "Mail"),
    color: "color-mix(in srgb, var(--color-fg-muted) 35%, var(--color-accent))",
    values: MAIL,
  },
];

export function dayLabel(index: number, locale: Locale): string {
  const d = index + 1;
  return locale === "en" ? `Aug ${d}` : `8/${d}`;
}

export type CatalogDrill = {
  id: string;
  name: Localized;
  value: number;
  children?: CatalogDrill[];
};

export const DRILL: readonly CatalogDrill[] = [
  {
    id: "search",
    name: loc("搜索", "Search"),
    value: 1280,
    children: [
      {
        id: "brand",
        name: loc("品牌词", "Brand"),
        value: 720,
        children: [
          { id: "home", name: loc("首页", "Home"), value: 410 },
          { id: "event", name: loc("活动页", "Event"), value: 310 },
        ],
      },
      {
        id: "generic",
        name: loc("品类词", "Generic"),
        value: 560,
        children: [
          { id: "list", name: loc("列表", "List"), value: 330 },
          { id: "sku", name: loc("详情", "Detail"), value: 230 },
        ],
      },
    ],
  },
  {
    id: "feed",
    name: loc("信息流", "Feed"),
    value: 860,
    children: [
      {
        id: "splash",
        name: loc("开屏", "Splash"),
        value: 480,
        children: [
          { id: "land", name: loc("落地页", "Land"), value: 290 },
          { id: "app", name: loc("应用页", "App"), value: 190 },
        ],
      },
      {
        id: "card",
        name: loc("信息流卡", "Card"),
        value: 380,
        children: [
          { id: "item", name: loc("商品", "SKU"), value: 220 },
          { id: "topic", name: loc("专题", "Topic"), value: 160 },
        ],
      },
    ],
  },
  {
    id: "direct",
    name: loc("直接访问", "Direct"),
    value: 420,
    children: [
      {
        id: "bookmark",
        name: loc("书签", "Bookmark"),
        value: 250,
        children: [
          { id: "d-home", name: loc("首页", "Home"), value: 160 },
          { id: "d-login", name: loc("登录", "Login"), value: 90 },
        ],
      },
      {
        id: "typed",
        name: loc("手输", "Typed"),
        value: 170,
        children: [
          { id: "d-help", name: loc("帮助", "Help"), value: 100 },
          { id: "d-price", name: loc("定价", "Pricing"), value: 70 },
        ],
      },
    ],
  },
];

export function toDrillTree(nodes: readonly CatalogDrill[], locale: Locale): DrillNode[] {
  return nodes.map((n) => ({
    id: n.id,
    name: pick(n.name, locale),
    children: n.children ? toDrillTree(n.children, locale) : undefined,
  }));
}

export function drillAtPath(
  nodes: readonly CatalogDrill[],
  path: readonly string[],
): readonly CatalogDrill[] {
  let level: readonly CatalogDrill[] = nodes;
  for (const id of path) {
    const next = level.find((n) => n.id === id);
    if (!next?.children) return [];
    level = next.children;
  }
  return level;
}

export function drillCrumbs(
  nodes: readonly CatalogDrill[],
  path: readonly string[],
  locale: Locale,
): { id: string; name: string }[] {
  const crumbs: { id: string; name: string }[] = [];
  let level: readonly CatalogDrill[] = nodes;
  for (const id of path) {
    const next = level.find((n) => n.id === id);
    if (!next) break;
    crumbs.push({ id, name: pick(next.name, locale) });
    level = next.children ?? [];
  }
  return crumbs;
}

export function extremeIndex(values: readonly number[], mode: "min" | "max"): number {
  if (values.length === 0) return 0;
  let best = 0;
  for (let i = 1; i < values.length; i++) {
    const v = values[i]!;
    if (mode === "max" ? v > values[best]! : v < values[best]!) best = i;
  }
  return best;
}
