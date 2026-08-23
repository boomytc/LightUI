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
  window: Localized;
};

export const KINDS: KindMeta[] = [
  {
    id: "skeleton",
    index: "01",
    name: "Skeleton",
    zh: loc("骨架屏", "Skeleton"),
    oneLiner: loc("占位块贴着最终布局，扫光后淡入真卡", "Blocks match the final layout; shimmer, then a fade to the real cards"),
    scenes: [
      loc("卡片列表加载", "A card list loading"),
      loc("结构已知、内容未到", "Structure known, content still arriving"),
      loc("到达后不要重排", "No jump on arrival"),
    ],
    rules: [
      loc("占位块宽高贴近最终布局", "Placeholder size matches the final layout"),
      loc("扫光用背景位置循环，不要闪透明度", "Shimmer is a background-position loop, not an opacity flash"),
      loc("到达后短交叉淡入；不要转圈代替骨架", "A short crossfade on arrival; do not replace it with a spinner"),
    ],
    spec: loc(
      "做骨架屏。三张假卡的宽高贴近最终卡片，扫光用背景位置循环；内容到达后短交叉淡入成真卡。不要转圈代替骨架。减少动效时停扫光，留下灰块。",
      "A skeleton. Three fake cards match the final cards. Shimmer with a background-position loop. On arrival, a short crossfade to the real cards. Do not replace it with a spinner. Reduced motion: stop the shimmer, leave gray blocks.",
    ),
    note: loc(
      "骨架占的是布局位子。转圈是不确定进度，不是这一则。",
      "A skeleton holds layout. A spinner is indeterminate progress — not this leaf.",
    ),
    tells: loc("假卡还在，真卡淡入，页面不跳", "Fake cards hold; real cards fade in; the page does not jump"),
    window: loc("简报 · 加载", "Briefs · loading"),
  },
  {
    id: "empty",
    index: "02",
    name: "Empty",
    zh: loc("空状态", "Empty"),
    oneLiner: loc("图标、一句人话、一句引导、一个主按钮", "An icon, a human line, guidance, one primary"),
    scenes: [
      loc("还没有任何简报", "No briefs yet"),
      loc("列表是空的", "The list is empty"),
      loc("需要下一步", "They need a next step"),
    ],
    rules: [
      loc("图标 + 人话标题 + 一句引导 + 一个主按钮", "Icon, human title, one guidance line, one primary"),
      loc("禁止「暂无数据」", "Do not say “no data”"),
      loc("不要白板，也不要做成一条提示", "Not a blank board, and not a notice"),
    ],
    spec: loc(
      "做空状态。列表 0 条时给图标、一句人话标题、一句引导和一个「新建简报」主按钮。不要写「暂无数据」，不要留白板，不要做成 toast。",
      "An empty state. At 0 items: an icon, a human title, one guidance line, and a New brief primary. Do not say “no data”. Do not leave a blank board. Do not make it a toast.",
    ),
    note: loc(
      "空状态占着这块区域。一条提示报的是已经发生的消息。",
      "An empty state occupies this region. A notice reports something that already happened.",
    ),
    tells: loc("空着也说人话，并给出下一步", "Empty still speaks in human, and offers a next step"),
    window: loc("简报 · 空", "Briefs · empty"),
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc("别说「做个 loading」，说骨架屏或空状态", "Not “a loading state” — a skeleton, or an empty state"),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc("内容还在路上，还是已经到了、这一份是空的", "Content still arriving, or arrived and this set is empty"),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc("占位贴布局、背景扫光、短淡入；或人话标题加一个主按钮", "Blocks match layout, background shimmer, short fade; or a human title plus one primary"),
  },
];
