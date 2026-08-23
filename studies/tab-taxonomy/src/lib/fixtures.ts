import { loc, type Localized } from "./site-locale";

export type TabItem = { id: string; label: Localized; hint?: Localized };

export const LINEAR_TABS: TabItem[] = [
  { id: "overview", label: loc("概览", "Overview") },
  { id: "tasks", label: loc("任务 12", "Tasks 12") },
  { id: "files", label: loc("文件 24", "Files 24") },
  { id: "activity", label: loc("动态", "Activity") },
];

export const LINEAR_FILES = [
  { name: "官网视觉规范.pdf", type: "PDF", owner: "Sue", ver: "v2.4", when: loc("今天 10:24", "Today 10:24") },
  { name: "首页文案终稿.docx", type: "DOC", owner: "Mia", ver: "v1.8", when: loc("今天 09:48", "Today 09:48") },
  { name: "首页视觉稿.fig", type: "FIG", owner: "Sue", ver: "v12", when: loc("昨天 18:40", "Yesterday 18:40") },
  { name: "交互动效说明.pdf", type: "PDF", owner: "Leo", ver: "v3.1", when: loc("8月12日", "12 Aug") },
];

export const LINEAR_TASKS = [
  { title: loc("开发联调", "Dev integration"), when: loc("8月22日", "22 Aug"), pct: 52 },
  { title: loc("灰度发布", "Staged rollout"), when: loc("8月28日", "28 Aug"), pct: 18 },
  { title: loc("文案终审", "Copy review"), when: loc("今天", "Today"), pct: 80 },
];

export const LINEAR_ACTIVITY = [
  { who: "Mia", what: loc("上传产品文案终稿", "uploaded the final copy"), when: loc("09:48", "09:48") },
  { who: "Leo", what: loc("更新导航交互状态", "updated nav interaction states"), when: loc("昨天", "Yesterday") },
  { who: "Ken", what: loc("评论埋点规范", "commented on the tracking spec"), when: loc("8月12日", "12 Aug") },
];

export const CARD_TABS: TabItem[] = [
  { id: "members", label: loc("成员 18", "Members 18") },
  { id: "roles", label: loc("角色权限 6", "Roles 6") },
  { id: "invites", label: loc("邀请记录 3", "Invites 3") },
];

export const CARD_MEMBERS = [
  { name: loc("Sue 苏", "Sue"), role: loc("产品设计", "Product design"), access: loc("管理者", "Admin"), seen: loc("刚刚在线", "Just now") },
  { name: loc("Mia 林", "Mia"), role: loc("内容运营", "Content"), access: loc("编辑者", "Editor"), seen: loc("12 分钟前", "12 min ago") },
  { name: loc("Leo 陈", "Leo"), role: loc("前端开发", "Frontend"), access: loc("编辑者", "Editor"), seen: loc("1 小时前", "1 hour ago") },
  { name: loc("Yuki 周", "Yuki"), role: loc("品牌市场", "Brand"), access: loc("访客", "Viewer"), seen: loc("昨天", "Yesterday") },
];

export const CARD_ROLES = [
  { role: loc("管理者", "Admin"), n: loc("4 人", "4 people"), scope: loc("全部功能", "All features") },
  { role: loc("编辑者", "Editor"), n: loc("9 人", "9 people"), scope: loc("项目与内容", "Projects and content") },
  { role: loc("财务", "Finance"), n: loc("2 人", "2 people"), scope: loc("账单与发票", "Billing") },
  { role: loc("访客", "Viewer"), n: loc("5 人", "5 people"), scope: loc("仅查看", "View only") },
];

export const CARD_INVITES = [
  { email: "mia@north.studio", dept: loc("品牌市场", "Brand"), expiry: loc("7 天后过期", "Expires in 7 days") },
  { email: "chen@partner.co", dept: loc("外部协作", "Partner"), expiry: loc("明天过期", "Expires tomorrow") },
  { email: "finance@north.studio", dept: loc("财务", "Finance"), expiry: loc("已发送 2 次", "Sent twice") },
];

export const CHEVRON_TABS: TabItem[] = [
  { id: "cart", label: loc("01 购物车", "01 Cart") },
  { id: "ship", label: loc("02 配送信息", "02 Shipping") },
  { id: "pay", label: loc("03 支付方式", "03 Payment") },
  { id: "done", label: loc("04 完成", "04 Done") },
];

export const CART_ITEMS = [
  { name: loc("设计系统实战课", "Design-system course"), meta: loc("视频课程 · 永久 · ¥499 × 1", "Video · forever · ¥499 × 1"), price: 499 },
  { name: loc("团队协作模板", "Team kit"), meta: loc("Notion / Figma 模板包 · ¥280 × 1", "Notion / Figma kit · ¥280 × 1"), price: 280 },
  { name: loc("优惠码 SUMMER26", "Code SUMMER26"), meta: loc("夏季学习优惠 · 已减 ¥80", "Summer discount · −¥80"), price: -80 },
];

export const SEGMENTED_TABS: TabItem[] = [
  { id: "today", label: loc("今日", "Today") },
  { id: "month", label: loc("本月", "Month") },
  { id: "year", label: loc("全年", "Year") },
];

export type SalesSlice = {
  revenue: string;
  revenueDelta: string;
  orders: string;
  ordersDelta: string;
  pending: string;
  pendingDelta: string;
  conv: string;
  convDelta: string;
  bars: number[];
  channels: { name: Localized; n: string }[];
};

export const SALES: Record<string, SalesSlice> = {
  today: {
    revenue: "¥8,420",
    revenueDelta: "+8.4%",
    orders: "86",
    ordersDelta: "+6.2%",
    pending: "24",
    pendingDelta: "−3",
    conv: "4.8%",
    convDelta: "+0.6%",
    bars: [28, 36, 32, 48, 40, 55, 72, 44, 50, 58],
    channels: [
      { name: loc("官网商城", "Site"), n: "4,776" },
      { name: loc("微信小程序", "WeChat"), n: "2,391" },
      { name: loc("线下门店", "Stores"), n: "873" },
    ],
  },
  month: {
    revenue: "¥186,400",
    revenueDelta: "+12.1%",
    orders: "1,942",
    ordersDelta: "+9.4%",
    pending: "61",
    pendingDelta: "−11",
    conv: "5.1%",
    convDelta: "+0.3%",
    bars: [40, 44, 38, 52, 60, 58, 70, 66, 72, 80],
    channels: [
      { name: loc("官网商城", "Site"), n: "98,210" },
      { name: loc("微信小程序", "WeChat"), n: "54,330" },
      { name: loc("线下门店", "Stores"), n: "33,860" },
    ],
  },
  year: {
    revenue: "¥2.14M",
    revenueDelta: "+18.6%",
    orders: "22,408",
    ordersDelta: "+14.0%",
    pending: "118",
    pendingDelta: "+6",
    conv: "4.9%",
    convDelta: "+0.2%",
    bars: [30, 34, 42, 48, 55, 62, 70, 74, 80, 88],
    channels: [
      { name: loc("官网商城", "Site"), n: "1.12M" },
      { name: loc("微信小程序", "WeChat"), n: "640K" },
      { name: loc("线下门店", "Stores"), n: "380K" },
    ],
  },
};

export const FOLDER_TABS: TabItem[] = [
  { id: "req", label: loc("需求 6", "Req 6") },
  { id: "design", label: loc("设计 12", "Design 12") },
  { id: "dev", label: loc("开发 9", "Dev 9") },
];

export const FOLDER_FILES: Record<string, { name: string; type: string; size: string; owner: string; when: Localized }[]> = {
  req: [
    { name: "项目需求文档.docx", type: "DOC", size: "1.2 MB", owner: "Mia", when: loc("今天 09:15", "Today 09:15") },
    { name: "用户调研汇总.pdf", type: "PDF", size: "4.8 MB", owner: "Sue", when: loc("8月11日", "11 Aug") },
    { name: "内容清单.xlsx", type: "XLS", size: "920 KB", owner: "Leo", when: loc("8月10日", "10 Aug") },
    { name: "上线验收标准.pdf", type: "PDF", size: "2.3 MB", owner: "Yuki", when: loc("8月9日", "9 Aug") },
  ],
  design: [
    { name: "首页视觉稿.fig", type: "FIG", size: "18 MB", owner: "Sue", when: loc("昨天 18:40", "Yesterday 18:40") },
    { name: "组件库.fig", type: "FIG", size: "22 MB", owner: "Sue", when: loc("8月12日", "12 Aug") },
    { name: "动效说明.pdf", type: "PDF", size: "3.1 MB", owner: "Leo", when: loc("8月12日", "12 Aug") },
  ],
  dev: [
    { name: "接口约定.md", type: "MD", size: "48 KB", owner: "Leo", when: loc("今天 11:02", "Today 11:02") },
    { name: "埋点清单.csv", type: "CSV", size: "26 KB", owner: "Ken", when: loc("昨天", "Yesterday") },
    { name: "发布清单.md", type: "MD", size: "12 KB", owner: "Leo", when: loc("8月20日", "20 Aug") },
  ],
};

export type RoomId = "living" | "kitchen" | "study" | "bedroom";

export const ROOMS: {
  id: RoomId;
  title: Localized;
  kicker: Localized;
  caption: Localized;
  meta: Localized;
  tone: string;
}[] = [
  {
    id: "living",
    title: loc("客厅全景", "Living room"),
    kicker: loc("LIVING ROOM", "LIVING ROOM"),
    caption: loc("与光线一起生活", "Live with the light"),
    meta: loc("朝南落地窗 · 晚水泥地面", "South glass · polished concrete"),
    tone: "#c4a574",
  },
  {
    id: "kitchen",
    title: loc("开放厨房", "Open kitchen"),
    kicker: loc("OPEN KITCHEN", "OPEN KITCHEN"),
    caption: loc("操作台对着客餐", "The counter faces the table"),
    meta: loc("橡木台面 · 岛台双水槽", "Oak top · island sink"),
    tone: "#8f9a86",
  },
  {
    id: "study",
    title: loc("独立书房", "Home study"),
    kicker: loc("HOME STUDY", "HOME STUDY"),
    caption: loc("墙面全是书脊", "A wall of spines"),
    meta: loc("北向柔光 · 3.2 m 书桌", "North light · 3.2 m desk"),
    tone: "#6d7c8b",
  },
  {
    id: "bedroom",
    title: loc("主卧空间", "Master bedroom"),
    kicker: loc("MASTER BEDROOM", "MASTER BEDROOM"),
    caption: loc("窗帘把城市声压住", "Curtains hold the city down"),
    meta: loc("低床 · 亚麻 · 隐藏灯槽", "Low bed · linen · a hidden cove"),
    tone: "#9a7b74",
  },
];
