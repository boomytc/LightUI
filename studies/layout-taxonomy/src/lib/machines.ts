export type KindId =
  | "single"
  | "landing"
  | "masonry"
  | "fullscreen"
  | "splitter"
  | "dashboard"
  | "modular";

export type SplitPanes = 1 | 2 | "grid";

export const KIND_IDS: readonly KindId[] = [
  "single",
  "landing",
  "masonry",
  "fullscreen",
  "splitter",
  "dashboard",
  "modular",
];

/** 42rem at 16px. Single-column reading measure. */
export const READING_MEASURE_PX = 672;

export const SPLIT_DEFAULT = 0.32;
export const SPLIT_MIN = 0.22;
export const SPLIT_MAX = 0.56;

export function isKindId(value: string): value is KindId {
  return (KIND_IDS as readonly string[]).includes(value);
}

export function readingMeasurePx(kind: KindId): number | null {
  return kind === "single" ? READING_MEASURE_PX : null;
}

export function isFullBleed(kind: KindId): boolean {
  return kind === "fullscreen";
}

export function allowsUnevenHeight(kind: KindId): boolean {
  return kind === "masonry";
}

export function splitPanes(kind: KindId): SplitPanes {
  if (kind === "splitter") return 2;
  if (kind === "masonry" || kind === "dashboard" || kind === "modular") return "grid";
  return 1;
}

export function clampSplit(ratio: number, min = SPLIT_MIN, max = SPLIT_MAX): number {
  if (!Number.isFinite(ratio)) return SPLIT_DEFAULT;
  if (ratio < min) return min;
  if (ratio > max) return max;
  return ratio;
}

export function splitRatioFromPointer(pointer: number, origin: number, size: number): number {
  if (size <= 0) return SPLIT_DEFAULT;
  return clampSplit((pointer - origin) / size);
}
