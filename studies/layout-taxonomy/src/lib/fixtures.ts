import { loc, type Localized } from "./site-locale";

export const MASONRY_TILES: { id: string; h: number; cat: Localized; author: string }[] = [
  { id: "t1", h: 112, cat: loc("摄影", "Photo"), author: "Ayu" },
  { id: "t2", h: 196, cat: loc("海报", "Poster"), author: "Mori" },
  { id: "t3", h: 148, cat: loc("字体", "Type"), author: "Sue" },
  { id: "t4", h: 228, cat: loc("包装", "Pack"), author: "Leo" },
  { id: "t5", h: 128, cat: loc("插画", "Draw"), author: "Yuki" },
];

export const SPLIT_FILES = [
  { id: "src", name: "src/", file: false },
  { id: "app", name: "App.tsx", file: true },
  { id: "theme", name: "theme.ts", file: true },
  { id: "lib", name: "lib/", file: false },
];

export const SPLIT_CODE = `const theme = {
  paper: "#f4f5f7",
  ink: "#17181c",
};

export { theme };`;

export const DASH_KPI = [
  { label: loc("销售额", "Sales"), value: "¥128,400", delta: "+12%" },
  { label: loc("订单", "Orders"), value: "1,284", delta: "+8%" },
  { label: loc("访客", "Visitors"), value: "8,930", delta: "−3%" },
];

export const DASH_BARS = [28, 36, 32, 48, 40, 55, 44];

export const DASH_ROWS: { name: Localized; n: string }[] = [
  { name: loc("服饰", "Apparel"), n: "42" },
  { name: loc("家居", "Home"), n: "28" },
  { name: loc("数码", "Tech"), n: "36" },
];

export const LANDING_FEATURES: { title: Localized; body: Localized; action: Localized }[] = [
  {
    title: loc("任务看板", "Board"),
    body: loc("拖一张卡片就更新进度。", "Drag a card, the status updates."),
    action: loc("打开看板", "Open board"),
  },
  {
    title: loc("多人协作", "Together"),
    body: loc(
      "同一份文档里评论、指派、对齐截止日，不用再把进度贴到群里。",
      "Comment, assign, and date in one doc — no more pasting status into chat.",
    ),
    action: loc("邀请成员", "Invite"),
  },
  {
    title: loc("数据报表", "Reports"),
    body: loc("工作量自动成表。", "Workload becomes a table."),
    action: loc("看报表", "See report"),
  },
];

export const MODULAR_CARDS: {
  id: string;
  title: Localized;
  body: Localized;
  action: Localized;
}[] = [
  {
    id: "profile",
    title: loc("个人资料", "Profile"),
    body: loc("阿屿 · AI 效率工具。", "Ayu · tools for making."),
    action: loc("编辑", "Edit"),
  },
  {
    id: "links",
    title: loc("链接墙", "Links"),
    body: loc(
      "常用工具、联系方式、订阅通讯。一块只放入口，不写长文。",
      "Tools, contact, a newsletter. Entries only — no essay.",
    ),
    action: loc("管理", "Manage"),
  },
  {
    id: "feed",
    title: loc("最近动态", "Feed"),
    body: loc("发布了「布局图鉴」。", "Published “Layout atlas”."),
    action: loc("全部", "All"),
  },
  {
    id: "note",
    title: loc("此刻在读", "Reading"),
    body: loc("把行宽收在 42rem。", "Keep the measure at 42rem."),
    action: loc("打开", "Open"),
  },
];
