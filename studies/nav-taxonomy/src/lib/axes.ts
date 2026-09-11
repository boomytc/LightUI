import type { KindId } from "./kinds";
import { loc, type Localized } from "./site-locale";

export type AxisId = "place" | "reveal" | "scroll";

export type PlaceSketch =
  | "top-card"
  | "top-bar"
  | "under"
  | "left"
  | "bottom"
  | "right-veil"
  | "full-veil";

export type RevealSketch = "always" | "column" | "mega" | "slide" | "page" | "none";

export type ScrollSketch = "pin" | "highlight" | "shrink" | "lock" | "none";

export const AXES: {
  id: AxisId;
  index: string;
  label: Localized;
  ask: Localized;
  kinds: KindId[];
}[] = [
  {
    id: "place",
    index: "01",
    label: loc("住哪", "Lives"),
    ask: loc("占哪条边，还是不占位", "Which edge — or no occupancy"),
    kinds: ["floating", "sidebar", "breadcrumb", "bottom"],
  },
  {
    id: "reveal",
    index: "02",
    label: loc("怎么开", "Opens"),
    ask: loc("一直在，还是滑入、铺开、换页", "Always on, or slide / spread / replace"),
    kinds: ["dropdown", "mega", "drawer", "overlay"],
  },
  {
    id: "scroll",
    index: "03",
    label: loc("滚的时候", "On scroll"),
    ask: loc("钉住、高亮，还是顶栏自己变", "Pin, highlight, or change the bar"),
    kinds: ["scrollspy", "shrink"],
  },
];

const PLACE: Record<KindId, Localized> = {
  floating: loc("离顶占位", "Inset, occupies"),
  sidebar: loc("左侧占位", "Left, occupies"),
  breadcrumb: loc("主下辅助", "Under the primary"),
  dropdown: loc("顶栏里", "In the top bar"),
  mega: loc("顶栏里", "In the top bar"),
  drawer: loc("不占位", "No occupancy"),
  overlay: loc("不占位", "No occupancy"),
  scrollspy: loc("侧轨占位", "Side rail, occupies"),
  shrink: loc("叠在大图上", "Over the hero"),
  bottom: loc("底部占位", "Bottom, occupies"),
};

const REVEAL: Record<KindId, Localized> = {
  floating: loc("一直开", "Always on"),
  sidebar: loc("一直开", "Always on"),
  breadcrumb: loc("路径，不是开法", "A path, not a reveal"),
  dropdown: loc("一列子页", "One column"),
  mega: loc("整宽多列", "Full-width columns"),
  drawer: loc("从右侧滑入", "Slides from the right"),
  overlay: loc("整页换成菜单", "Page becomes the menu"),
  scrollspy: loc("一直开", "Always on"),
  shrink: loc("一直开", "Always on"),
  bottom: loc("一直开", "Always on"),
};

const SCROLL: Record<KindId, Localized> = {
  floating: loc("钉住", "Pins"),
  sidebar: loc("不跟滚变", "No scroll job"),
  breadcrumb: loc("不跟滚变", "No scroll job"),
  dropdown: loc("不跟滚变", "No scroll job"),
  mega: loc("不跟滚变", "No scroll job"),
  drawer: loc("打开锁滚", "Locks scroll"),
  overlay: loc("打开锁滚", "Locks scroll"),
  scrollspy: loc("高亮跟着", "Highlight follows"),
  shrink: loc("自己变矮", "The bar shrinks"),
  bottom: loc("不跟滚变", "No scroll job"),
};

const PAIRS: Partial<Record<KindId, KindId>> = {
  floating: "shrink",
  shrink: "floating",
  dropdown: "mega",
  mega: "dropdown",
  drawer: "overlay",
  overlay: "drawer",
  bottom: "drawer",
};

export function axisOf(kind: KindId): AxisId {
  if (AXES[1]!.kinds.includes(kind)) return "reveal";
  if (AXES[2]!.kinds.includes(kind)) return "scroll";
  return "place";
}

export function axisKinds(axis: AxisId): KindId[] {
  return AXES.find((item) => item.id === axis)?.kinds ?? AXES[0]!.kinds;
}

export function placeLine(kind: KindId): Localized {
  return PLACE[kind];
}

export function revealLine(kind: KindId): Localized {
  return REVEAL[kind];
}

export function scrollLine(kind: KindId): Localized {
  return SCROLL[kind];
}

export function mixedPair(kind: KindId): KindId | undefined {
  return PAIRS[kind];
}

export function placeSketch(kind: KindId): PlaceSketch {
  switch (kind) {
    case "floating":
    case "shrink":
      return "top-card";
    case "dropdown":
    case "mega":
      return "top-bar";
    case "breadcrumb":
      return "under";
    case "sidebar":
    case "scrollspy":
      return "left";
    case "bottom":
      return "bottom";
    case "drawer":
      return "right-veil";
    case "overlay":
      return "full-veil";
  }
}

export function revealSketch(kind: KindId): RevealSketch {
  switch (kind) {
    case "dropdown":
      return "column";
    case "mega":
      return "mega";
    case "drawer":
      return "slide";
    case "overlay":
      return "page";
    case "breadcrumb":
      return "none";
    default:
      return "always";
  }
}

export function scrollSketch(kind: KindId): ScrollSketch {
  switch (kind) {
    case "floating":
      return "pin";
    case "scrollspy":
      return "highlight";
    case "shrink":
      return "shrink";
    case "drawer":
    case "overlay":
      return "lock";
    default:
      return "none";
  }
}
