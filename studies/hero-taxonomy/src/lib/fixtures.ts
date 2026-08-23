import { loc, type Localized } from "./site-locale";

export const TRUST_LOGOS = ["LUMEN", "NORTH", "PULSE", "VERTEX"];

export const PORTFOLIO_SLIDES: { kicker: Localized; title: Localized; body: Localized }[] = [
  {
    kicker: loc("SELECTED WORK / 2026", "SELECTED WORK / 2026"),
    title: loc("为复杂世界\n设计清晰体验", "Clear work\nfor a messy world"),
    body: loc(
      "十二年设计实践。先让人看见风格和代表作，履历放后面。",
      "Twelve years of practice. Style and a piece of work first; the CV later.",
    ),
  },
  {
    kicker: loc("ISSUE 08 · PRODUCT", "ISSUE 08 · PRODUCT"),
    title: loc("把模糊需求\n做成可上线的结构", "Fuzzy briefs\ninto shippable structure"),
    body: loc(
      "从调研到视觉系统。代表作不靠堆履历，而靠一眼能感到的风格。",
      "From research to a visual system. The work carries the style; a CV dump does not.",
    ),
  },
];

export const COURSE_SLICES: { title: Localized; meta: Localized; tone: string }[] = [
  { title: loc("钱包改版", "Wallet"), meta: loc("学员 · Ken", "Ken"), tone: "bg-[#f0c4ae]" },
  { title: loc("社区首页", "Club home"), meta: loc("学员 · Ayu", "Ayu"), tone: "bg-[#ead2b8]" },
  { title: loc("工具工作台", "Tool bench"), meta: loc("学员 · Mia", "Mia"), tone: "bg-[#d4c8b8]" },
];

export const COMMUNITY_TOPICS: { who: string; initial: string; topic: Localized; tag: Localized }[] = [
  {
    who: "Ayu",
    initial: "A",
    topic: loc("把侧栏做成可停靠的轨道", "A dockable rail for the sidebar"),
    tag: loc("进行中", "Live"),
  },
  {
    who: "Ken",
    initial: "K",
    topic: loc("首屏到底该回答哪一句", "Which line the first fold must answer"),
    tag: loc("热议", "Hot"),
  },
  {
    who: "Mia",
    initial: "M",
    topic: loc("课程页不要先甩大纲", "A course page should not lead with a syllabus"),
    tag: loc("今晚", "Tonight"),
  },
];
