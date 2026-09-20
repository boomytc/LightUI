export type KindId = "ruler" | "range" | "stepper" | "cascader" | "dates";

export const KIND_IDS: readonly KindId[] = [
  "ruler",
  "range",
  "stepper",
  "cascader",
  "dates",
];

export type PickShape = "one-tick" | "two-ends" | "few-steps" | "tree-path" | "date-span";

export type StageState = "snap" | "span" | "floor" | "path";

export type RangeThumb = "lo" | "hi";

export type Region = {
  name: string;
  children?: Region[];
};

export type Day = { y: number; m: number; d: number };

export type DateSpan = {
  from: Day | null;
  to: Day | null;
};

export function isKindId(value: string): value is KindId {
  return (KIND_IDS as readonly string[]).includes(value);
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function choosePicker(shape: PickShape): KindId {
  switch (shape) {
    case "one-tick":
      return "ruler";
    case "two-ends":
      return "range";
    case "few-steps":
      return "stepper";
    case "tree-path":
      return "cascader";
    case "date-span":
      return "dates";
  }
}

export function shapeOf(kind: KindId): PickShape {
  switch (kind) {
    case "ruler":
      return "one-tick";
    case "range":
      return "two-ends";
    case "stepper":
      return "few-steps";
    case "cascader":
      return "tree-path";
    case "dates":
      return "date-span";
  }
}

function decimals(step: number): number {
  const text = String(step);
  const i = text.indexOf(".");
  return i < 0 ? 0 : text.length - i - 1;
}

export function snapStep(raw: number, step: number): number {
  const inv = 1 / step;
  return Number((Math.round(raw * inv) / inv).toFixed(decimals(step)));
}

/** Pointer stays; the scale moves; release lands on the step. */
export function snapRuler(raw: number, step: number, min: number, max: number): number {
  return clamp(snapStep(raw, step), min, max);
}

export function valueFromDrag(
  startValue: number,
  dx: number,
  pxPerUnit: number,
  min: number,
  max: number,
): number {
  return clamp(startValue - dx / pxPerUnit, min, max);
}

/**
 * Dual thumbs. The active end cannot cross the other by less than `gap`.
 */
export function applyRangeThumb(
  thumb: RangeThumb,
  raw: number,
  lo: number,
  hi: number,
  min: number,
  max: number,
  gap: number,
  step: number,
): { lo: number; hi: number } {
  const snapped = snapStep(raw, step);
  if (thumb === "lo") return { lo: clamp(snapped, min, hi - gap), hi };
  return { lo, hi: clamp(snapped, lo + gap, max) };
}

export function nearestThumb(raw: number, lo: number, hi: number): RangeThumb {
  return Math.abs(raw - lo) <= Math.abs(raw - hi) ? "lo" : "hi";
}

export function valueFromTrack(
  clientX: number,
  left: number,
  width: number,
  min: number,
  max: number,
  step: number,
): number {
  if (width <= 0) return min;
  const t = clamp((clientX - left) / width, 0, 1);
  return snapStep(min + t * (max - min), step);
}

export function stepQty(
  qty: number,
  dir: -1 | 1,
  min: number,
  max: number,
  step = 1,
): number {
  return clamp(qty + dir * step, min, max);
}

export function atFloor(qty: number, min: number): boolean {
  return qty <= min;
}

export function atCeil(qty: number, max: number): boolean {
  return qty >= max;
}

export function childrenOf(tree: readonly Region[], path: readonly string[]): Region[] {
  let nodes: readonly Region[] = tree;
  for (const name of path) {
    const next = nodes.find((node) => node.name === name);
    nodes = next?.children ?? [];
  }
  return [...nodes];
}

/** Append, or replace the leaf. Changing an ancestor is `cascadeJump` then this. */
export function cascadeSelect(path: readonly string[], name: string, levels = 3): string[] {
  if (path.length >= levels) return [...path.slice(0, levels - 1), name];
  return [...path, name];
}

export function cascadeJump(path: readonly string[], index: number): string[] {
  if (index < 0) return [];
  return path.slice(0, index + 1);
}

export function cascadeLevel(path: readonly string[], levels = 3): number {
  return Math.min(path.length, levels - 1);
}

export function cascadeComplete(path: readonly string[], levels = 3): boolean {
  return path.length >= levels;
}

export function cascadeOptions(
  tree: readonly Region[],
  path: readonly string[],
  levels = 3,
): Region[] {
  return childrenOf(tree, path.slice(0, levels - 1));
}

export function day(y: number, m: number, d: number): Day {
  return { y, m, d };
}

export function compareDay(a: Day, b: Day): number {
  if (a.y !== b.y) return a.y < b.y ? -1 : 1;
  if (a.m !== b.m) return a.m < b.m ? -1 : 1;
  if (a.d !== b.d) return a.d < b.d ? -1 : 1;
  return 0;
}

export function isSameDay(a: Day, b: Day): boolean {
  return compareDay(a, b) === 0;
}

export function isBeforeDay(a: Day, b: Day): boolean {
  return compareDay(a, b) < 0;
}

export function isPastDay(value: Day, today: Day): boolean {
  return isBeforeDay(value, today);
}

function toDate(value: Day): Date {
  return new Date(value.y, value.m, value.d);
}

export function nightsBetween(from: Day, to: Day): number {
  return Math.round((toDate(to).getTime() - toDate(from).getTime()) / 86_400_000);
}

export function nightsOf(span: DateSpan): number {
  if (!span.from || !span.to) return 0;
  return nightsBetween(span.from, span.to);
}

export function inRange(value: Day, span: DateSpan): boolean {
  if (!span.from || !span.to) return false;
  return compareDay(value, span.from) >= 0 && compareDay(value, span.to) <= 0;
}

export function addMonths(value: Day, delta: number): Day {
  const next = new Date(value.y, value.m + delta, 1);
  return { y: next.getFullYear(), m: next.getMonth(), d: 1 };
}

export function daysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate();
}

/** 0 = Sunday. weekStartsOn 1 = Monday. */
export function leadingBlanks(y: number, m: number, weekStartsOn: 0 | 1 = 1): number {
  const weekday = new Date(y, m, 1).getDay();
  return weekStartsOn === 1 ? (weekday + 6) % 7 : weekday;
}

export function monthCells(y: number, m: number, weekStartsOn: 0 | 1 = 1): Array<Day | null> {
  const blanks = leadingBlanks(y, m, weekStartsOn);
  const count = daysInMonth(y, m);
  const cells: Array<Day | null> = [];
  for (let i = 0; i < blanks; i++) cells.push(null);
  for (let d = 1; d <= count; d++) cells.push({ y, m, d });
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function formatDay(value: Day, locale: "zh" | "en"): string {
  if (locale === "en") return `${value.y}-${String(value.m + 1).padStart(2, "0")}-${String(value.d).padStart(2, "0")}`;
  return `${value.m + 1}月${value.d}日`;
}

/**
 * Start then end. Past days are ignored. Tapping start or earlier restarts.
 */
export function pickDate(span: DateSpan, value: Day, today: Day): DateSpan {
  if (isPastDay(value, today)) return span;
  if (!span.from || span.to) return { from: value, to: null };
  if (compareDay(value, span.from) <= 0) return { from: value, to: null };
  return { from: span.from, to: value };
}

export function dateComplete(span: DateSpan): boolean {
  return Boolean(span.from && span.to);
}

export function defaultStageState(kind: KindId): StageState {
  switch (kind) {
    case "ruler":
      return "snap";
    case "range":
    case "dates":
      return "span";
    case "stepper":
      return "floor";
    case "cascader":
      return "path";
  }
}

/** Each kind has one diagnostic fixture. Any other `state` param falls back to it. */
export function stageState(raw: string, kind: KindId): StageState {
  const expected = defaultStageState(kind);
  return raw === expected ? raw : expected;
}
