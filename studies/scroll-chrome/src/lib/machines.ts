export const KIND_IDS = ["native", "cue", "track"] as const;

export type KindId = (typeof KIND_IDS)[number];

export type StageState = "start" | "mid" | "end" | "fit";

export const OVERFLOW_EPS = 8;
export const START_EPS = 8;
export const DOT_SPACING = 16;
export const MIN_DOTS = 6;
export const MAX_DOTS = 18;
export const MAX_EXTEND = 22;
export const EXT_FALLOFF = 0.58;
export const LINE_RATIO = 0.52;
export const LINE_MIN = 128;
export const LINE_MAX = 320;
export const MID_FRACTION = 0.45;
export const AXIS_INSET = 14;
export const TICK = 5;
export const EXT_TAU = 0.08;

export function isKindId(value: string): value is KindId {
  return (KIND_IDS as readonly string[]).includes(value);
}

export function isStageState(value: string): value is StageState {
  return value === "start" || value === "mid" || value === "end" || value === "fit";
}

export function stageState(raw: string): StageState {
  return isStageState(raw) ? raw : "mid";
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function overflow(max: number): boolean {
  return max > OVERFLOW_EPS;
}

export function atStart(top: number): boolean {
  return top < START_EPS;
}

export function fraction(top: number, max: number): number {
  if (max <= 0) return 0;
  return clamp(top / max, 0, 1);
}

/** Custom chrome may hide the OS thumb only when it is the control. */
export function hidesNative(kind: KindId): boolean {
  return kind !== "native";
}

export function showsCue(kind: KindId, hasOverflow: boolean, start: boolean): boolean {
  return kind === "cue" && hasOverflow && start;
}

export function showsTrack(kind: KindId, hasOverflow: boolean): boolean {
  return kind === "track" && hasOverflow;
}

export function lineLength(viewportH: number): number {
  return clamp(viewportH * LINE_RATIO, LINE_MIN, LINE_MAX);
}

export function dotCount(length: number): number {
  return clamp(Math.round(length / DOT_SPACING), MIN_DOTS, MAX_DOTS);
}

export function focusDot(frac: number, n: number): number {
  if (n <= 1) return 0;
  return Math.round(clamp(frac, 0, 1) * (n - 1));
}

export function extensionAt(index: number, focus: number): number {
  return MAX_EXTEND * EXT_FALLOFF ** Math.abs(index - focus);
}

export function seekTop(
  kind: KindId,
  args: { index: number; n: number; max: number; viewport: number; current: number },
): number | null {
  if (kind === "native") return null;
  if (kind === "cue") return Math.min(args.max, Math.max(0, args.current + args.viewport));
  const last = Math.max(args.n - 1, 1);
  return clamp(args.index, 0, last) * (args.max / last);
}

/** `null` means the pane must not overflow (fit). */
export function stageFraction(state: StageState): number | null {
  if (state === "fit") return null;
  if (state === "start") return 0;
  if (state === "end") return 1;
  return MID_FRACTION;
}

export function buildSnippet(): string {
  return [
    "hidesNative(kind) = kind !== native",
    "showsCue  = cue  && overflow && atStart",
    "showsTrack = track && overflow",
    "focus = round(fraction * (n - 1))",
    "seek(track, i) = i / (n - 1) * max",
    "seek(cue)      = current + viewport",
  ].join("\n");
}
