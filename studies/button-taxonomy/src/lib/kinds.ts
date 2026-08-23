import { loc, type Localized } from "./site-locale";
import { type KindId, type Weight } from "./machines";

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
    id: "solid",
    index: "01",
    name: "Solid",
    zh: loc("面状", "Solid"),
    oneLiner: loc("实心填充，这一区唯一的主操作", "Filled — the one primary in this region"),
    scenes: [
      loc("立即下载", "Download now"),
      loc("提交", "Submit"),
      loc("注册", "Sign up"),
    ],
    rules: [
      loc("实心填充一整块颜色", "Solid fill, one block of color"),
      loc("一区只能有一个面状", "Only one solid per region"),
      loc("圆角可变，但不换重量、不加第二个实心", "Radius may change; weight and fill count must not"),
    ],
    spec: loc(
      "做这一区的主按钮。面状、实心填充，「立即下载」。一区只能有一个面状；圆角可以换，不要再放第二个实心。",
      "The primary in this region. Solid, filled, “Download now”. Only one solid; radius may change, a second fill may not.",
    ),
    note: loc(
      "同一重量里圆角可变，但一区只能有一个面状主按钮。",
      "Radius can change inside the same weight. A region still gets only one filled primary.",
    ),
    tells: loc("实心，全页最重", "Filled — the heaviest click"),
  },
  {
    id: "outline",
    index: "02",
    name: "Outline",
    zh: loc("线状", "Outline"),
    oneLiner: loc("一圈描边，没有底色，不抢戏", "A stroke, no fill, does not compete"),
    scenes: [
      loc("了解更多", "Learn more"),
      loc("取消", "Cancel"),
      loc("查看详情", "View details"),
    ],
    rules: [
      loc("只有一圈描边，没有底色", "Stroke only, no fill"),
      loc("次操作，不跟面状抢戏", "Secondary — does not compete with the solid"),
      loc("弹窗里的取消也用它，不是第二主按钮", "Cancel in a dialog uses this; it is not a second primary"),
    ],
    spec: loc(
      "做这一区的次按钮。线状、一圈描边没有底色，「了解更多」。不跟面状主按钮抢戏。",
      "The secondary in this region. Outline, stroke only, “Learn more”. It does not compete with the filled primary.",
    ),
    note: loc("线状不是第二主按钮。", "Outline is not a second primary."),
    tells: loc("一圈描边，不抢戏", "A stroke that stays second"),
  },
  {
    id: "text",
    index: "03",
    name: "Text",
    zh: loc("文字", "Text"),
    oneLiner: loc("没边框没底色，弱操作轻提醒", "No chrome — a quiet out"),
    scenes: [
      loc("稍后再说", "Not now"),
      loc("忘记密码", "Forgot password"),
      loc("跳过", "Skip"),
    ],
    rules: [
      loc("没边框没底色，就一行字", "No border, no fill — a line of text"),
      loc("弱操作，扫过去不该抢主按钮", "Weak — a scan should still find the primary"),
      loc("仍是这一页的动作，不是去别的页的链接", "Still an action on this page, not a nav link"),
    ],
    spec: loc(
      "做这一区的弱操作。文字按钮，没边框没底色，「稍后再说」。不是去别的页的链接。",
      "The weak action in this region. Text, no chrome, “Not now”. It is not a link to another page.",
    ),
    note: loc("文字按钮不是链接导航。", "A text button is not link navigation."),
    tells: loc("一行字，没有铬", "A line of text, no chrome"),
  },
];

export const WEIGHT_LABEL: Record<Weight, Localized> = {
  primary: loc("主", "Primary"),
  secondary: loc("次", "Secondary"),
  tertiary: loc("弱", "Tertiary"),
};

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc("别说「按钮」，说面状、线状或文字", "Not “a button” — solid, outline, or text"),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc("这一区的主操作、次操作还是弱操作", "Primary, secondary, or weak in this region"),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc("一区一个面状；线状不抢戏；文字没有铬", "One solid; outline does not compete; text has no chrome"),
  },
];
