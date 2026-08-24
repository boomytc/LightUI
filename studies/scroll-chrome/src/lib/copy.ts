import type { Locale } from "./site-locale";

const LONG_ZH: [string, string][] = [
  ["开头", "先问这根条报什么。还停在顶上，是邀请往下；已经在滚，是现在在哪。"],
  ["溢出", "没有溢出就不要画铬。短文稿卸掉轨道，系统条也不会出现。"],
  ["系统条", "溢出归操作系统时，拇指连续可拖。藏掉它再画不能聚焦的装饰，键盘会丢。"],
  ["邀请", "箭头只在顶上。点一下滚一屏，离开顶上就卸掉。它不报位置。"],
  ["轨道", "点列绑在这一格视口上。量化的是滚动比例，点一下跳到那个比例。"],
  ["不是章节", "点看起来像目录，提交的却不是标题。章节高亮是导航的锚点，不是这根条。"],
  ["不是进度", "文档滚过不是工作 0–100。上传才问能不能算。"],
  ["视口", "侧栏里的长文稿滚的是这一格，不是整窗。轨道跟格走。"],
  ["降动效", "减少动效时不要晃箭头，伸长一次到位，跳转不要平滑。"],
  ["缝合", "把邀请和轨道缝成一次变形，两种任务抢同一根条。先定报什么，再谈皮肤。"],
  ["结尾", "滚到这里，轨道的最后一点应对准 1。邀请早已不在。"],
];

const LONG_EN: [string, string][] = [
  ["Opening", "Name what the bar reports. Still at the top, it invites the next screen. Already moving, it reports position."],
  ["Overflow", "No overflow, no chrome. A short pane unloads the track; the OS thumb does not appear either."],
  ["Native", "When overflow belongs to the OS, the thumb is continuous. Hide it and paint a decoration that cannot take focus, and the keyboard is gone."],
  ["Cue", "The arrow lives only at the top. A click walks one screen; leaving the top unloads it. It does not report position."],
  ["Track", "The dots bind to this viewport. They quantize a scroll fraction; a click seeks that fraction."],
  ["Not sections", "The dots look like a table of contents. What they commit is not a heading. Section highlight is nav scrollspy."],
  ["Not progress", "How far the document has been read is not work going 0–100. Uploads ask whether progress can be measured."],
  ["Viewport", "A long pane in a column scrolls this cell, not the window. The track follows the cell."],
  ["Reduced motion", "Do not bob the arrow. Extensions land in one step. A seek is not smoothed."],
  ["Stitched", "Morphing a cue into a track makes two jobs share one bar. Name what it reports before the skin."],
  ["End", "Down here, the last dot should read 1. The cue is long gone."],
];

const SHORT_ZH: [string, string][] = [
  ["短文", "这一格装得下。没有溢出，轨道必须 hidden，系统条也不出现。"],
];

const SHORT_EN: [string, string][] = [
  ["Short", "This cell fits. No overflow: the track stays hidden, and the OS thumb does not appear."],
];

export function sections(locale: Locale, long: boolean): [string, string][] {
  if (long) return locale === "en" ? LONG_EN : LONG_ZH;
  return locale === "en" ? SHORT_EN : SHORT_ZH;
}
