import { loc, type Localized } from "./site-locale";

export type Draft = { id: string; title: Localized; time: Localized };

export type InboxItem = {
  id: string;
  title: Localized;
  time: Localized;
  unread: boolean;
};

export const MARQUEE_ITEMS: Localized[] = [
  loc("AI 报告功能已更新，支持一键导出", "AI reports now export in one click"),
  loc("今晚 20:00 开启直播分享，点击预约", "Live session tonight at 20:00 — tap to book"),
  loc("今日新增 128 位用户", "128 people joined today"),
];

export const INITIAL_DRAFTS: Draft[] = [
  { id: "d1", title: loc("产品需求 v3", "Product spec v3"), time: loc("8月18日 15:32", "18 Aug 15:32") },
  { id: "d2", title: loc("活动文案 v2", "Campaign copy v2"), time: loc("8月17日 10:08", "17 Aug 10:08") },
  { id: "d3", title: loc("周报数据", "Weekly numbers"), time: loc("8月16日 18:45", "16 Aug 18:45") },
];

export const INITIAL_INBOX: InboxItem[] = [
  {
    id: "n1",
    title: loc("Sue 评论了你的周报", "Sue commented on your weekly"),
    time: loc("5 分钟前", "5 min ago"),
    unread: true,
  },
  {
    id: "n2",
    title: loc("设计组上传了新版规范", "Design uploaded a new spec"),
    time: loc("1 小时前", "1 hour ago"),
    unread: true,
  },
  {
    id: "n3",
    title: loc("导出完成，共 128 条数据", "Export finished — 128 rows"),
    time: loc("刚刚 · 数据工作台", "Just now · data"),
    unread: true,
  },
  {
    id: "n4",
    title: loc("AI 报告已更新", "AI report updated"),
    time: loc("昨天", "Yesterday"),
    unread: false,
  },
];

export const TEAM = [
  { id: "u1", name: loc("Sue", "Sue"), role: loc("管理员", "Admin"), mark: "S" },
  { id: "u2", name: loc("Mia", "Mia"), role: loc("编辑", "Editor"), mark: "M" },
  { id: "u3", name: loc("Leo", "Leo"), role: loc("访客", "Guest"), mark: "L" },
];
