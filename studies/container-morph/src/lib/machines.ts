export type KindId =
  | "circle-pill"
  | "pill-card"
  | "compact"
  | "radius"
  | "size"
  | "reflow"
  | "reverse";

export const KIND_IDS: readonly KindId[] = [
  "circle-pill",
  "pill-card",
  "compact",
  "radius",
  "size",
  "reflow",
  "reverse",
];

export type MorphAxis = "width" | "height" | "radius" | "size" | "layout" | "reverse";

export type MorphAnchor = "center" | "top" | "top-left" | "none";

export type ReverseBeat = "content" | "height" | "width";

export type ReverseStage = 0 | 1 | 2;

export type ReverseName = "card" | "pill" | "dot";

export type FixtureState = "collapsed" | "expanded" | ReverseName;

export type MorphBox = { width: number; height: number; radius: number };

/** CSS transition for a single morph. Reduced motion uses 0. */
export const MORPH_MS = 400;

const AXIS: Record<KindId, MorphAxis> = {
  "circle-pill": "width",
  "pill-card": "height",
  compact: "size",
  radius: "radius",
  size: "size",
  reflow: "layout",
  reverse: "reverse",
};

const ANCHOR: Record<KindId, MorphAnchor> = {
  "circle-pill": "center",
  "pill-card": "top",
  compact: "top-left",
  radius: "none",
  size: "top-left",
  reflow: "none",
  reverse: "center",
};

const BOX: Record<KindId, { collapsed: MorphBox; expanded: MorphBox }> = {
  "circle-pill": {
    collapsed: { width: 48, height: 48, radius: 999 },
    expanded: { width: 288, height: 48, radius: 999 },
  },
  "pill-card": {
    collapsed: { width: 288, height: 56, radius: 999 },
    expanded: { width: 340, height: 248, radius: 24 },
  },
  compact: {
    collapsed: { width: 340, height: 72, radius: 28 },
    expanded: { width: 380, height: 268, radius: 24 },
  },
  radius: {
    collapsed: { width: 360, height: 120, radius: 999 },
    expanded: { width: 360, height: 120, radius: 24 },
  },
  size: {
    collapsed: { width: 196, height: 148, radius: 20 },
    expanded: { width: 420, height: 268, radius: 20 },
  },
  reflow: {
    collapsed: { width: 240, height: 280, radius: 20 },
    expanded: { width: 460, height: 220, radius: 20 },
  },
  reverse: {
    collapsed: { width: 48, height: 48, radius: 999 },
    expanded: { width: 340, height: 248, radius: 24 },
  },
};

const REVERSE_BOX: readonly [MorphBox, MorphBox, MorphBox] = [
  { width: 340, height: 248, radius: 24 },
  { width: 288, height: 56, radius: 999 },
  { width: 48, height: 48, radius: 999 },
];

const REVERSE_BEAT: readonly ReverseBeat[] = ["content", "height", "width"];

const REVERSE_NAME: readonly ReverseName[] = ["card", "pill", "dot"];

export function isKindId(value: string): value is KindId {
  return (KIND_IDS as readonly string[]).includes(value);
}

export function morphAxis(kind: KindId): MorphAxis {
  return AXIS[kind];
}

export function morphAnchor(kind: KindId): MorphAnchor {
  return ANCHOR[kind];
}

/** Radius is hierarchy: width and height stay put. */
export function locksSize(kind: KindId): boolean {
  return kind === "radius";
}

/**
 * All seven keep the same entry. Compact / reflow / circle-pill / pill-card /
 * size never unmount icon or title. Reverse keeps the check in the final dot.
 */
export function keepsIdentity(kind: KindId): boolean {
  void kind;
  return true;
}

export function reverseOrder(kind: KindId): boolean {
  return kind === "reverse";
}

/** 0 content out, 1 height to pill, 2 width to dot. */
export function reverseBeat(step: ReverseStage): ReverseBeat {
  return REVERSE_BEAT[step];
}

export function reverseName(stage: ReverseStage): ReverseName {
  return REVERSE_NAME[stage];
}

export function reverseStage(name: ReverseName): ReverseStage {
  if (name === "pill") return 1;
  if (name === "dot") return 2;
  return 0;
}

/**
 * Content must not appear before the container has grown.
 * Radius is sync. Reverse sends content out first on collapse.
 */
export function contentAfterContainer(kind: KindId): boolean {
  return kind === "pill-card" || kind === "compact" || kind === "size";
}

/** Extra controls open on a 0fr→1fr track. Only compact. */
export function opensExtra(kind: KindId): boolean {
  return kind === "compact";
}

/** Same DOM nodes, stack → two columns. Only reflow. */
export function sameNodes(kind: KindId): boolean {
  return kind === "reflow";
}

export function morphMs(reduceMotion: boolean): number {
  return reduceMotion ? 0 : MORPH_MS;
}

export function morphBox(kind: KindId, expanded: boolean): MorphBox {
  const pair = BOX[kind];
  return expanded ? pair.expanded : pair.collapsed;
}

/** 0 card, 1 pill, 2 dot. */
export function reverseBox(stage: ReverseStage): MorphBox {
  return REVERSE_BOX[stage];
}

export function stageState(kind: KindId, raw: string): FixtureState {
  if (kind === "reverse") {
    if (raw === "pill" || raw === "dot" || raw === "card") return raw;
    if (raw === "collapsed") return "dot";
    return "card";
  }
  if (raw === "collapsed" || raw === "expanded") return raw;
  return "expanded";
}

export function fixtureBox(kind: KindId, state: FixtureState): MorphBox {
  if (kind === "reverse") {
    if (state === "pill") return reverseBox(1);
    if (state === "dot" || state === "collapsed") return reverseBox(2);
    return reverseBox(0);
  }
  return morphBox(kind, state === "expanded");
}

/** Body copy / extra fields. The identity glyph stays regardless. */
export function contentVisible(kind: KindId, state: FixtureState): boolean {
  if (kind === "reverse") return state === "card" || state === "expanded";
  if (!contentAfterContainer(kind) && kind !== "circle-pill") return true;
  return state === "expanded";
}
