import { loc, type Localized } from "./site-locale";

export const PANEL_CODE = `const getTasks = async () => {
  const res = await fetch("/api/tasks");
  return res.json();
};`;

export const PANEL_PATCH = {
  advice: loc(
    "给 fetch 加上超时，避免请求一直挂着。",
    "Add a timeout so fetch cannot hang forever.",
  ),
  replacement: `const getTasks = async () => {
  const res = await fetch("/api/tasks", { signal: AbortSignal.timeout(8000) });
  return res.json();
};`,
};

export const CHAT_SEED: { role: "user" | "assistant"; text: Localized }[] = [
  {
    role: "user",
    text: loc("帮我梳理下周发布会的节奏", "Help me sketch next week’s launch rhythm"),
  },
  {
    role: "assistant",
    text: loc(
      "预热提前三天。周五发主片，周日晚上做公开复盘。",
      "Tease three days early. Ship the main film Friday. Recap Sunday night.",
    ),
  },
  {
    role: "user",
    text: loc("清单还能再收吗？", "Can the checklist go shorter?"),
  },
];

export const PLUGIN_ACTIONS = [
  { id: "tr", zh: "译", en: "Tr" },
  { id: "rw", zh: "改写", en: "Rewrite" },
  { id: "ex", zh: "解释", en: "Explain" },
] as const;

export type PluginAction = (typeof PLUGIN_ACTIONS)[number]["id"];

export const PLUGIN_FAKE: Record<PluginAction, Localized> = {
  tr: loc("团队每周五发版，方便评审和回滚。", "The team ships every Friday so reviews and rollbacks stay easy."),
  rw: loc("小步发布，节奏更稳。", "Ship small. The rhythm holds."),
  ex: loc("意思是：用小版本降低回滚成本。", "Meaning: small releases make rollback cheap."),
};

export const CANVAS_SEED = [
  {
    id: "a",
    title: loc("用户反馈分级", "Feedback grades"),
    body: loc("P0 当天闭环", "P0 same day"),
    x: 16,
    y: 28,
    tone: "chip" as const,
  },
  {
    id: "b",
    title: loc("周更节奏", "Weekly ship"),
    body: loc("每周五发布", "Ship Fridays"),
    x: 168,
    y: 88,
    tone: "note" as const,
  },
  {
    id: "c",
    title: loc("清单精简", "Shorter list"),
    body: loc("12 项 → 6 项", "12 → 6"),
    x: 36,
    y: 196,
    tone: "note-3" as const,
  },
];

export const CANVAS_GROW = [
  { title: loc("预热三天", "Tease 3 days"), body: loc("提前放出亮点", "Show the hook early") },
  { title: loc("周日复盘", "Sunday recap"), body: loc("公开、可回看", "Public, replayable") },
];

export const PHOTOS = [
  { id: "1", title: loc("海边合影", "Sea group"), date: loc("8月14日", "14 Aug"), tone: "sea", tag: loc("人像", "People") },
  { id: "2", title: loc("周末早午餐", "Weekend brunch"), date: loc("8月10日", "10 Aug"), tone: "brunch", tag: loc("食物", "Food") },
  { id: "3", title: loc("湖面晨雾", "Morning lake"), date: loc("8月5日", "5 Aug"), tone: "lake", tag: loc("风景", "Place") },
  { id: "4", title: loc("山间日落", "Hill sunset"), date: loc("8月12日", "12 Aug"), tone: "mountain", tag: loc("风景", "Place") },
  { id: "5", title: loc("朋友聚会", "Friends"), date: loc("8月8日", "8 Aug"), tone: "party", tag: loc("人像", "People") },
  { id: "6", title: loc("深夜食堂", "Night kitchen"), date: loc("8月2日", "2 Aug"), tone: "night", tag: loc("食物", "Food") },
];
