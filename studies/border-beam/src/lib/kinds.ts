import { loc, type Localized } from "./site-locale";
import type { KindId } from "./machines";

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
    id: "beam",
    index: "01",
    name: "Border beam",
    zh: loc("边框光束", "Border beam"),
    oneLiner: loc("高光沿圆角边框绕行", "The highlight travels the rounded stroke"),
    scenes: [
      loc("会员卡", "Membership card"),
      loc("重点功能卡", "Featured card"),
    ],
    rules: [
      loc("高光走边框，不要铺满卡片", "Travel the border; do not flood the card"),
      loc("@property 角度 + conic-gradient 旋转", "@property angle + spinning conic-gradient"),
      loc("内层实心底，外层透明边框叠光束", "Solid inner fill; transparent border stacks the beam"),
      loc("品牌强调色，不要彩虹", "Brand accent, not a rainbow"),
      loc("降低运动时改成静态描边", "Reduced motion becomes a static stroke"),
    ],
    spec: loc(
      "会员卡用边框流光：高光沿圆角边框持续绕行，用来突出 PRO 会员卡，不要整张卡发光，也不要用彩虹色。",
      "A membership card with a border beam: the highlight travels the rounded stroke to lift the PRO card. Do not flood the face, and do not use a rainbow.",
    ),
    tells: loc("弧在边上走，字还是实心底", "The arc stays on the edge; type sits on a solid fill"),
  },
  {
    id: "fill",
    index: "02",
    name: "Flood fill",
    zh: loc("铺满（错）", "Flood (wrong)"),
    oneLiner: loc("整张卡发光，表面被高光盖住", "The whole card glows; the face is covered"),
    scenes: [
      loc("把「发光」做成铺满", "Treating glow as a flood"),
    ],
    rules: [
      loc("表面和外发光一起亮", "Face and outer glow light up together"),
      loc("内容被高光盖住", "Copy is covered by the sheen"),
      loc("这是 naive 反例", "This is the naive counterexample"),
    ],
    spec: loc(
      "不要这样做：整张会员卡铺满高光、外发光跟着闪。边框不再是边，强调色变成一层雾。",
      "Do not do this: flood the membership card and pulse an outer glow. The edge stops being an edge, and the accent turns into fog.",
    ),
    note: loc("这是 naive 反例。高光该走边框。", "Naive counterexample. The highlight belongs on the border."),
    tells: loc("整张卡在亮，分不出边", "The whole card is lit; there is no edge left"),
  },
];
