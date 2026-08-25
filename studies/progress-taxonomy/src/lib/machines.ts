export type KindId =
  | "fill"
  | "steps"
  | "circular"
  | "liquid"
  | "spin"
  | "radar"
  | "dots"
  | "wave"
  | "button";

export type Category = "determinate" | "indeterminate";

export type StepKind = "done" | "active" | "todo";

export type StageState = "mid" | "done" | "loop";

export const KIND_IDS: readonly KindId[] = [
  "fill",
  "steps",
  "circular",
  "liquid",
  "spin",
  "radar",
  "dots",
  "wave",
  "button",
];

export const MID_PROGRESS = 0.62;

export const STEP_COUNT = 3;

const DETERMINATE: ReadonlySet<KindId> = new Set(["fill", "steps", "circular", "liquid"]);

export function isKindId(value: string): value is KindId {
  return (KIND_IDS as readonly string[]).includes(value);
}

export function category(kind: KindId): Category {
  return DETERMINATE.has(kind) ? "determinate" : "indeterminate";
}

/** Progress is a unit interval. Non-finite values collapse to 0. */
export function clampProgress(p: number): number {
  if (!Number.isFinite(p)) return 0;
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  return p;
}

export function showPercent(kind: KindId): boolean {
  return category(kind) === "determinate";
}

/** Chrome lives on the control that started the work. */
export function locksTrigger(kind: KindId): boolean {
  return kind === "button";
}

export type ButtonPhase = "idle" | "loading" | "done";

export function buttonPhase(state: StageState, looping: boolean): ButtonPhase {
  if (state === "done") return "done";
  if (looping || state === "loop" || state === "mid") return "loading";
  return "idle";
}

/** `active` is the current index. Everything before is done. */
export function stepKind(index: number, current: number): StepKind {
  if (index < current) return "done";
  if (index === current) return "active";
  return "todo";
}

/** Remaining dash length. `p` is 0..1; full ring is offset 0. */
export function circularOffset(p: number, circumference: number): number {
  return circumference * (1 - clampProgress(p));
}

export function shouldLoop(kind: KindId): boolean {
  return category(kind) === "indeterminate";
}

/**
 * Reduced motion freezes determinate work at p and turns
 * indeterminate motion into a static mark.
 */
export function prefersStatic(reduceMotion: boolean, kind: KindId): boolean {
  if (!reduceMotion) return false;
  return showPercent(kind) || shouldLoop(kind);
}

export function stageState(raw: string): StageState {
  if (raw === "done" || raw === "loop") return raw;
  return "mid";
}

/** At 1, current is `count` so every node is done. */
export function stepCurrent(progress: number, count = STEP_COUNT): number {
  const p = clampProgress(progress);
  if (p >= 1) return count;
  if (count <= 0) return 0;
  return Math.min(count - 1, Math.floor(p * count));
}

export function resolveLock(
  kind: KindId,
  rawState: string,
): { progress: number; looping: boolean; current: number; state: StageState } {
  const state = stageState(rawState);
  const progress = state === "done" ? 1 : MID_PROGRESS;
  return {
    progress,
    looping: shouldLoop(kind) && state === "loop",
    current: stepCurrent(progress),
    state,
  };
}
