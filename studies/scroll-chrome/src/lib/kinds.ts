import { loc, type Localized } from "./site-locale";
import type { KindId } from "./machines";

export type { KindId };

export type KindMeta = {
  id: KindId;
  index: string;
  name: string;
  zh: Localized;
  oneLiner: Localized;
  scenes: Localized[];
  rules: Localized[];
  spec: Localized;
  note?: Localized;
  tells: Localized;
};

export const KINDS: KindMeta[] = [
  {
    id: "native",
    index: "01",
    name: "Native",
    zh: loc("系统条", "Native"),
    oneLiner: loc("溢出归操作系统。拇指连续，不要藏。", "Overflow belongs to the OS. A continuous thumb. Do not hide it."),
    scenes: [loc("普通长页", "An ordinary long page"), loc("没有自定义铬", "No custom chrome")],
    rules: [
      loc("hidesNative 为假", "hidesNative is false"),
      loc("不要 aria-hidden 掉唯一的条", "Do not aria-hide the only bar"),
    ],
    spec: loc(
      "做系统滚动条。溢出时画出操作系统的拇指，位置连续可拖。不要藏掉它再画一根不能聚焦的装饰。",
      "A native scrollbar. When there is overflow, the OS thumb is the control — continuous, draggable. Do not hide it and paint a decoration that cannot take focus.",
    ),
    tells: loc("拇指还在，连续拖", "The thumb stays; drag is continuous"),
  },
  {
    id: "cue",
    index: "02",
    name: "Cue",
    zh: loc("邀请", "Cue"),
    oneLiner: loc("只在顶上说下面还有。点一下滚一屏。", "Only at the top, say there is more. One click, one screen."),
    scenes: [loc("长文开头", "Top of a long read"), loc("还没开始滚", "Has not started scrolling")],
    rules: [
      loc("只在 overflow 且 atStart 出现", "Only when overflow and atStart"),
      loc("seek = current + viewport", "seek = current + viewport"),
      loc("一离开顶上就卸掉", "Unload once the top is left"),
    ],
    spec: loc(
      "做开场邀请。只在还能往下、并且还停在顶上时出现。点一下滚一屏，不要画成轨道，也不要报现在在哪。",
      "A start cue. Show it only when there is more below and the pane is still at the top. A click jumps one viewport. It is not a track, and it does not report position.",
    ),
    note: loc(
      "邀请不是轨道。滚起来之后还留着箭头，就是两种任务抢同一根条。",
      "A cue is not a track. Leaving the arrow up after scrolling steals the job of a position rail.",
    ),
    tells: loc("顶上才见，点一下走一屏", "Only at the top; a click walks one screen"),
  },
  {
    id: "track",
    index: "03",
    name: "Track",
    zh: loc("轨道", "Track"),
    oneLiner: loc("有溢出才出现。点是滚动比例，不是章节。", "Show only on overflow. Dots are a scroll fraction, not sections."),
    scenes: [loc("侧栏里的长文稿", "A long pane in a column"), loc("已经在滚", "Already scrolling")],
    rules: [
      loc("没有溢出就 hidden", "Hidden when there is no overflow"),
      loc("focus = round(fraction × (n − 1))", "focus = round(fraction × (n − 1))"),
      loc("点中跳到 i/(n−1)，不是标题", "A click seeks i/(n−1), not a heading"),
    ],
    spec: loc(
      "做位置轨道。绑在这一格视口上，不要绑整窗。没有溢出就卸掉。点列量化的是滚动比例，点一下跳到那个比例。不要做成章节目录，也不要当成工作进度。",
      "A position track. Bind it to this viewport, not the window. Unload it when nothing overflows. The dots quantize a scroll fraction; a click seeks that fraction. Not a table of contents. Not work progress.",
    ),
    note: loc(
      "点列看起来像锚点，提交的却是比例。章节高亮是另一问。",
      "The dots look like anchors. What they commit is a fraction. Section highlight is a different question.",
    ),
    tells: loc("有溢出才见，点按比例跳", "Only with overflow; a click seeks a fraction"),
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc("别说「做个酷滚动条」，说系统条、邀请或轨道", "Not “a cool scrollbar” — native, cue, or track"),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc("还在顶上，还是已经在滚；有没有溢出", "Still at the top, or already moving; is there overflow"),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc(
      "藏不藏系统条；邀请只在顶上；轨道点的是比例",
      "Whether the OS thumb stays; cue only at the top; track seeks a fraction",
    ),
  },
];
