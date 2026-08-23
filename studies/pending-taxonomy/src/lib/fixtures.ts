import { loc, type Localized } from "./site-locale";

export type Brief = {
  id: string;
  mark: string;
  title: Localized;
  meta: Localized;
  tag: Localized;
};

export const BRIEFS: Brief[] = [
  {
    id: "north",
    mark: "北",
    title: loc("北田速写", "North field notes"),
    meta: loc("12 页 · 昨天", "12 pages · yesterday"),
    tag: loc("草稿", "Draft"),
  },
  {
    id: "harbor",
    mark: "港",
    title: loc("港湾字体试排", "Harbor type trial"),
    meta: loc("8 页 · 周二", "8 pages · Tue"),
    tag: loc("评审", "Review"),
  },
  {
    id: "orbit",
    mark: "O",
    title: loc("周末速写本", "Weekend pack"),
    meta: loc("3.2 MB · 周五", "3.2 MB · Fri"),
    tag: loc("已发", "Sent"),
  },
];

export const EMPTY_COPY = {
  title: loc("还没有简报", "No briefs yet"),
  guidance: loc(
    "写一份给团队看的第一稿。从空白开始，不要留一块白板。",
    "Write the first draft the team can read. Start from nothing — not a blank board.",
  ),
  action: loc("新建简报", "New brief"),
};
