import { loc, type Localized } from "./site-locale";

export const PANEL_CODE = `const getTasks = async () => {
  const res = await fetch("/api/tasks");
  return res.json();
};

const byStatus = (tasks, status) =>
  tasks.filter((t) => t.status === status);

export async function listOpen() {
  const tasks = await getTasks();
  return byStatus(tasks, "open");
}

export async function listDone() {
  const tasks = await getTasks();
  return byStatus(tasks, "done");
}`;

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

export const PLUGIN_DOC = {
  kicker: loc("发布说明 · RELEASE NOTES", "RELEASE NOTES"),
  title: loc("团队发布节奏", "How the team ships"),
  meta: loc("8 月 19 日更新 · 阅读 3 分钟", "Orbit · 19 Aug · 3 min"),
  hit: loc(
    "团队每周五发版，方便评审和回滚。",
    "Our team ships every Friday to keep the rhythm steady.",
  ),
  afterHit: loc("小步发布，评审和回滚都更轻松。", "Small releases make it easier to review and roll back."),
  paras: [
    loc(
      "预热提前三天放出亮点。上线当天发主视频，周日晚上做公开复盘。清单从十二项收到六项，P0 当天闭环。",
      "Tease the hook three days early. Ship the main film on the day. Recap Sunday night. The checklist went from twelve items to six; P0 closes the same day.",
    ),
    loc(
      "周更没有改排版，也没有加侧栏。老产品只是在选区上多了一条短工具：译、改写、解释。点下去之前要把 Range 存下来。",
      "Weekly ship did not change the layout, and it did not add a rail. The old product only grew a short toolbar on the selection: translate, rewrite, explain. Clone the Range before the click.",
    ),
  ],
  hint: loc(
    "划选上面任意句子 — 工具条会出现，页面本身不会变。",
    "Select a sentence — the toolbar appears. The page itself does not change.",
  ),
};

export const FLOAT_DOC = {
  title: loc("Q3 产品复盘纪要", "Q3 product recap"),
  meta: loc("8 月 18 日 14:00 · 会议室 B · 林", "18 Aug · Room B · Lin"),
  sections: [
    {
      heading: loc("周更节奏", "Weekly ship"),
      body: loc(
        "周更整体稳定，两次提前发布没有拖垮评审。复盘会改成每周五下午，全员参加。正在读的人不必离开这一页。",
        "Weekly ship held. Two early releases did not break review. Recap moves to Friday afternoon, everyone in the room. You can keep reading this page.",
      ),
    },
    {
      heading: loc("清单与分级", "Checklist and grades"),
      body: loc(
        "发布清单从 12 项精简到 6 项。用户反馈分级，P0 当天闭环。这页还是纪要，角落一个可拖的球，骨架没有换成聊天。",
        "Checklist 12 → 6. Feedback is graded; P0 closes the same day. This page is still the recap. A draggable ball sits in the corner; the skeleton did not become a chat.",
      ),
    },
    {
      heading: loc("下一步", "Next"),
      body: loc(
        "预热提前三天放出亮点。上线当天发主视频，周日晚上做公开复盘。问一句用浮层；要对着选区改再用面板。",
        "Tease three days early. Ship the main film on the day. Recap Sunday night. Ask one thing in the float. Use a panel when the selection is the context.",
      ),
    },
  ],
};

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
  { id: "7", title: loc("雨后街道", "Wet street"), date: loc("7月28日", "28 Jul"), tone: "night", tag: loc("风景", "Place") },
  { id: "8", title: loc("工作室一角", "Studio corner"), date: loc("7月22日", "22 Jul"), tone: "brunch", tag: loc("人像", "People") },
  { id: "9", title: loc("山顶云海", "Cloud sea"), date: loc("7月19日", "19 Jul"), tone: "mountain", tag: loc("风景", "Place") },
];
