import { loc, type Localized } from "./site-locale";

export type NamedValue = { name: Localized; value: number };

export const CHART_COLORS = [
  "var(--color-accent)",
  "color-mix(in srgb, var(--color-accent) 72%, white)",
  "color-mix(in srgb, var(--color-accent) 48%, var(--color-fg))",
  "color-mix(in srgb, var(--color-accent) 28%, var(--color-fg-muted))",
  "color-mix(in srgb, var(--color-fg) 42%, var(--color-accent))",
  "color-mix(in srgb, var(--color-accent) 18%, var(--color-fg-subtle))",
] as const;

export const LINE_DATA: NamedValue[] = [
  { name: loc("1月", "Jan"), value: 86 },
  { name: loc("2月", "Feb"), value: 92 },
  { name: loc("3月", "Mar"), value: 88 },
  { name: loc("4月", "Apr"), value: 105 },
  { name: loc("5月", "May"), value: 118 },
  { name: loc("6月", "Jun"), value: 124 },
  { name: loc("7月", "Jul"), value: 119 },
  { name: loc("8月", "Aug"), value: 138 },
  { name: loc("9月", "Sep"), value: 152 },
  { name: loc("10月", "Oct"), value: 148 },
  { name: loc("11月", "Nov"), value: 165 },
  { name: loc("12月", "Dec"), value: 178 },
];

export const AREA_DATA: NamedValue[] = [
  { name: loc("1月", "Jan"), value: 2.1 },
  { name: loc("2月", "Feb"), value: 3.6 },
  { name: loc("3月", "Mar"), value: 4.8 },
  { name: loc("4月", "Apr"), value: 6.2 },
  { name: loc("5月", "May"), value: 8.1 },
  { name: loc("6月", "Jun"), value: 9.4 },
  { name: loc("7月", "Jul"), value: 11.2 },
  { name: loc("8月", "Aug"), value: 13.8 },
];

export const COLUMN_DATA: NamedValue[] = [
  { name: loc("咖啡", "Coffee"), value: 62 },
  { name: loc("茶饮", "Tea"), value: 84 },
  { name: loc("轻食", "Food"), value: 48 },
  { name: loc("周边", "Merch"), value: 96 },
  { name: loc("会员", "Member"), value: 70 },
  { name: loc("礼盒", "Gift"), value: 80 },
];

export const BAR_DATA: NamedValue[] = [
  { name: loc("杭州未来科技城", "Hangzhou Future"), value: 92 },
  { name: loc("成都高新区天府", "Chengdu Tianfu"), value: 78 },
  { name: loc("上海静安寺商圈", "Shanghai Jing'an"), value: 64 },
  { name: loc("武汉光谷步行街", "Wuhan Optics V."), value: 51 },
  { name: loc("长沙五一商圈", "Changsha Wuyi"), value: 38 },
];

export const PIE_DATA: NamedValue[] = [
  { name: loc("产品", "Product"), value: 38 },
  { name: loc("市场", "Market"), value: 24 },
  { name: loc("研发", "R&D"), value: 18 },
  { name: loc("人力", "People"), value: 12 },
  { name: loc("其他", "Other"), value: 8 },
];

export const SCATTER_DATA = [
  { x: 12, y: 28 },
  { x: 18, y: 31 },
  { x: 22, y: 44 },
  { x: 27, y: 41 },
  { x: 33, y: 58 },
  { x: 38, y: 61 },
  { x: 45, y: 70 },
  { x: 52, y: 66 },
  { x: 58, y: 81 },
  { x: 64, y: 90 },
] as const;

export const FUNNEL_DATA: NamedValue[] = [
  { name: loc("曝光", "Shown"), value: 10000 },
  { name: loc("点击", "Click"), value: 4200 },
  { name: loc("注册", "Sign-up"), value: 1600 },
  { name: loc("付费", "Pay"), value: 480 },
  { name: loc("复购", "Repeat"), value: 120 },
];

export const STACK_SERIES = [
  { key: "core" as const, name: loc("核心", "Core"), color: CHART_COLORS[0] },
  { key: "plus" as const, name: loc("增值", "Plus"), color: CHART_COLORS[1] },
  { key: "gift" as const, name: loc("礼包", "Gift"), color: CHART_COLORS[2] },
];

export const STACKED_DATA = [
  { name: loc("Q1", "Q1"), core: 42, plus: 28, gift: 18 },
  { name: loc("Q2", "Q2"), core: 40, plus: 36, gift: 16 },
  { name: loc("Q3", "Q3"), core: 48, plus: 32, gift: 22 },
  { name: loc("Q4", "Q4"), core: 55, plus: 30, gift: 20 },
];

export const HEAT_DAYS: Localized[] = [
  loc("一", "Mo"),
  loc("二", "Tu"),
  loc("三", "We"),
  loc("四", "Th"),
  loc("五", "Fr"),
  loc("六", "Sa"),
  loc("日", "Su"),
];

export const HEAT_SLOTS: Localized[] = [
  loc("凌晨", "Dawn"),
  loc("早晨", "Morn"),
  loc("上午", "AM"),
  loc("下午", "PM"),
  loc("傍晚", "Eve"),
  loc("深夜", "Late"),
];

/** 7 days × 6 slots. Weekday evenings high; weekend mornings high. */
export const HEAT_VALUES: number[] = [
  18, 32, 48, 55, 86, 72, 22, 35, 52, 61, 90, 80, 20, 30, 50, 58, 88, 76, 24,
  38, 54, 64, 92, 84, 28, 40, 57, 66, 96, 88, 36, 58, 78, 44, 40, 46, 30, 62,
  84, 48, 38, 42,
];

export const RADAR_DATA: NamedValue[] = [
  { name: loc("性能", "Speed"), value: 82 },
  { name: loc("设计", "Design"), value: 90 },
  { name: loc("价格", "Price"), value: 58 },
  { name: loc("口碑", "Word"), value: 74 },
  { name: loc("服务", "Care"), value: 46 },
  { name: loc("易用", "Ease"), value: 80 },
];
