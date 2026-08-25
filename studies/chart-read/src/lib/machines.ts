export type KindId =
  | "brush"
  | "crosshair"
  | "highlight"
  | "tooltip"
  | "legend"
  | "zoom"
  | "drill";

export const KIND_IDS: readonly KindId[] = [
  "brush",
  "crosshair",
  "highlight",
  "tooltip",
  "legend",
  "zoom",
  "drill",
];

export function isKindId(v: string): v is KindId {
  return (KIND_IDS as readonly string[]).includes(v);
}

export type GestureClass = "read" | "filter" | "range" | "window" | "path";

const GESTURE_CLASS: Record<KindId, GestureClass> = {
  brush: "range",
  crosshair: "read",
  highlight: "read",
  tooltip: "read",
  legend: "filter",
  zoom: "window",
  drill: "path",
};

export function gestureClass(kind: KindId): GestureClass {
  return GESTURE_CLASS[kind];
}

/** Map px from [x0, x1] onto 0..count-1 by rounding, then clamp. */
export function nearestIndex(count: number, px: number, x0: number, x1: number): number {
  if (count <= 0 || x1 === x0) return 0;
  const t = (px - x0) / (x1 - x0);
  const i = Math.round(t * (count - 1));
  if (i <= 0) return 0;
  if (i >= count - 1) return count - 1;
  return i;
}

/** Inverse of nearestIndex: index → px on [x0, x1]. */
export function xAt(index: number, count: number, x0: number, x1: number): number {
  if (count <= 1 || x1 === x0) return x0;
  const i = Math.max(0, Math.min(count - 1, index));
  return x0 + (i * (x1 - x0)) / (count - 1);
}

export function brushRange(
  originIndex: number,
  currentIndex: number,
): { start: number; end: number } {
  return originIndex <= currentIndex
    ? { start: originIndex, end: currentIndex }
    : { start: currentIndex, end: originIndex };
}

export type BrushState = {
  origin: number | null;
  start: number;
  end: number;
  frozen: boolean;
};

export function brushPointerDown(index: number): BrushState {
  return { origin: index, start: index, end: index, frozen: false };
}

export function brushPointerMove(state: BrushState, index: number): BrushState {
  if (state.origin === null) return state;
  const { start, end } = brushRange(state.origin, index);
  return { origin: state.origin, start, end, frozen: false };
}

export function brushPointerUp(state: BrushState): BrushState {
  return { origin: null, start: state.start, end: state.end, frozen: true };
}

export function rangeStats(
  values: readonly number[],
  start: number,
  end: number,
): { count: number; avg: number; peak: number } {
  if (values.length === 0 || start > end) return { count: 0, avg: 0, peak: 0 };
  const lo = Math.max(0, start);
  const hi = Math.min(values.length - 1, end);
  if (lo > hi) return { count: 0, avg: 0, peak: 0 };
  let sum = 0;
  let peak = values[lo]!;
  for (let i = lo; i <= hi; i++) {
    const v = values[i]!;
    sum += v;
    if (v > peak) peak = v;
  }
  const count = hi - lo + 1;
  return { count, avg: sum / count, peak };
}

export function legendToggle(
  hidden: ReadonlySet<string>,
  id: string,
  allIds: readonly string[],
): Set<string> {
  const next = new Set(hidden);
  if (next.has(id)) {
    next.delete(id);
    return next;
  }
  const stillVisible = allIds.some((sid) => sid !== id && !next.has(sid));
  if (!stillVisible) return new Set(hidden);
  next.add(id);
  return next;
}

/**
 * Scale [start, end] around cursorIndex by factor (>1 out, <1 in).
 * Clamp start ≥ 0, end ≤ maxEnd; span at least minSpan.
 */
export function zoomWindow(
  start: number,
  end: number,
  factor: number,
  cursorIndex: number,
  minSpan: number,
  maxEnd: number,
): { start: number; end: number } {
  const span = end - start;
  const floor = Math.max(0, minSpan);
  let nextSpan = span * factor;
  if (!Number.isFinite(nextSpan) || nextSpan < floor) nextSpan = floor;
  if (nextSpan > maxEnd) nextSpan = maxEnd;

  const t = span === 0 ? 0.5 : (cursorIndex - start) / span;
  let nextStart = cursorIndex - t * nextSpan;
  let nextEnd = nextStart + nextSpan;

  if (nextStart < 0) {
    nextEnd -= nextStart;
    nextStart = 0;
  }
  if (nextEnd > maxEnd) {
    nextStart -= nextEnd - maxEnd;
    nextEnd = maxEnd;
  }
  if (nextStart < 0) nextStart = 0;
  if (nextEnd > maxEnd) nextEnd = maxEnd;

  let s = Math.round(nextStart);
  let e = Math.round(nextEnd);
  if (e - s < floor) {
    e = Math.min(maxEnd, s + floor);
    s = Math.max(0, e - floor);
  }
  if (s < 0) s = 0;
  if (e > maxEnd) e = maxEnd;
  return { start: s, end: e };
}

export type DrillNode = { id: string; name: string; children?: DrillNode[] };

function nodeAt(roots: readonly DrillNode[], path: readonly string[]): DrillNode | undefined {
  let nodes: readonly DrillNode[] | undefined = roots;
  let node: DrillNode | undefined;
  for (const id of path) {
    if (!nodes) return undefined;
    node = nodes.find((n) => n.id === id);
    if (!node) return undefined;
    nodes = node.children;
  }
  return node;
}

export function drillPush(
  path: readonly string[],
  id: string,
  roots: readonly DrillNode[],
): string[] {
  const next = [...path, id];
  const node = nodeAt(roots, next);
  if (!node) return [...path];
  const kids = node.children;
  if (!kids || kids.length === 0) return [...path];
  return next;
}

export function drillPop(path: readonly string[], toLength: number): string[] {
  const n = Math.max(0, Math.min(toLength, path.length));
  return path.slice(0, n);
}

export const STAGE_STATES: Record<KindId, readonly string[]> = {
  brush: ["idle", "frozen"],
  crosshair: ["hide", "snap"],
  highlight: ["anomaly", "peak"],
  tooltip: ["hide", "show"],
  legend: ["all", "filtered"],
  zoom: ["30", "7", "3"],
  drill: ["l1", "l2"],
};

const DEFAULT_STAGE: Record<KindId, string> = {
  brush: "frozen",
  crosshair: "snap",
  highlight: "peak",
  tooltip: "show",
  legend: "filtered",
  zoom: "7",
  drill: "l2",
};

export function defaultStageState(kind: KindId): string {
  return DEFAULT_STAGE[kind];
}

export function stageState(kind: KindId, raw: string): string {
  if ((STAGE_STATES[kind] as readonly string[]).includes(raw)) return raw;
  return DEFAULT_STAGE[kind];
}

export function playgroundState(kind: KindId): string {
  switch (kind) {
    case "brush":
      return "idle";
    case "crosshair":
      return "hide";
    case "highlight":
      return "peak";
    case "tooltip":
      return "hide";
    case "legend":
      return "all";
    case "zoom":
      return "30";
    case "drill":
      return "l1";
  }
}
