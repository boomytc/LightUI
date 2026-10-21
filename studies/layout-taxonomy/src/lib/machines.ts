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

export function splitFromKey(key:string, ratio:number):number|null {
 if(key==="ArrowLeft")return clampSplit(ratio-0.04);
 if(key==="ArrowRight")return clampSplit(ratio+0.04);
 if(key==="Home")return SPLIT_MIN;
 if(key==="End")return SPLIT_MAX;
 return null;
}
export function moveModule<T>(items:T[],from:number,to:number):T[] {
 if(from<0||to<0||from>=items.length||to>=items.length||from===to)return items;
 const next=items.slice();const [item]=next.splice(from,1);next.splice(to,0,item!);return next;
}
