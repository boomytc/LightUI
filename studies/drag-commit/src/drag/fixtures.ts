import { loc, type Localized } from "../lib/site-locale";

export type Task = { id: string; title: Localized; meta: Localized };
export type Chip = { id: string; title: Localized };

export const TASKS: Task[] = [
  { id: "a", title: loc("产品简报", "Product brief"), meta: loc("今日", "Today") },
  { id: "b", title: loc("设计评审", "Design review"), meta: loc("14:00", "14:00") },
  { id: "c", title: loc("发布清单", "Ship list"), meta: loc("本周", "This week") },
  { id: "d", title: loc("用户来信", "User mail"), meta: loc("3 封", "3 notes") },
  { id: "e", title: loc("停车位", "Parking lot"), meta: loc("以后", "Later") },
];

export const CHIPS: Chip[] = [
  { id: "alpha", title: loc("简报", "Brief") },
  { id: "beta", title: loc("评审", "Review") },
  { id: "gamma", title: loc("发布", "Ship") },
  { id: "delta", title: loc("停车", "Park") },
];

export const QUEUE_SEED: Task[] = TASKS.slice(0, 3);
export const TODAY_SEED: Task[] = TASKS.slice(3, 5);

export const DESK_SEED: Task[] = TASKS.slice(0, 3);
export const ARCHIVE_SEED: Task[] = [
  { id: "arc-1", title: loc("去年规划", "Last-year plan"), meta: loc("只读", "Read-only") },
  { id: "arc-2", title: loc("已关闭", "Closed"), meta: loc("只读", "Read-only") },
];
