export type KindId =
  | "classic"
  | "fade"
  | "coverflow"
  | "stack"
  | "flip"
  | "accordion"
  | "spin"
  | "parallax";

export type StepMode = "wrap" | "clamp";

export type TransitionSpec = {
  property: "opacity" | "transform" | "grid-template-columns";
  opacityOnly: boolean;
};

export const KIND_IDS: readonly KindId[] = [
  "classic",
  "fade",
  "coverflow",
  "stack",
  "flip",
  "accordion",
  "spin",
  "parallax",
];

/** Four frames is the teaching cap. */
export const SLIDE_COUNT = 4;

/** Stage default: a non-first slide, so the cut is visible. */
export const DEFAULT_STAGE_INDEX = 1;

const AUTOPLAY_KINDS: ReadonlySet<KindId> = new Set([
  "classic",
  "fade",
  "coverflow",
  "parallax",
]);

export function isKindId(value: string): value is KindId {
  return (KIND_IDS as readonly string[]).includes(value);
}

export function wrapIndex(i: number, length: number): number {
  if (length <= 0) return 0;
  const n = Number.isFinite(i) ? Math.trunc(i) : 0;
  return ((n % length) + length) % length;
}

export function clampIndex(i: number, length: number): number {
  if (length <= 0) return 0;
  if (!Number.isFinite(i)) return 0;
  const n = Math.trunc(i);
  if (n < 0) return 0;
  if (n >= length) return length - 1;
  return n;
}

/**
 * Advance one step. Classic wraps; pass `"clamp"` to stop at the ends.
 */
export function stepIndex(
  i: number,
  dir: number,
  length: number,
  mode: StepMode = "wrap",
): number {
  if (length <= 0) return 0;
  const start = mode === "clamp" ? clampIndex(i, length) : wrapIndex(i, length);
  const step = dir < 0 ? -1 : dir > 0 ? 1 : 0;
  if (step === 0) return start;
  const next = start + step;
  return mode === "clamp" ? clampIndex(next, length) : wrapIndex(next, length);
}

/** Dots always bind to the current index. */
export function dotsIndex(index: number, length: number): number {
  return wrapIndex(index, length);
}

/**
 * Hover pauses autoplay. `prefers-reduced-motion` kills it.
 * A user toggle ANDs with this in the hook.
 */
export function shouldAutoplay(hovering: boolean, reducedMotion: boolean): boolean {
  return !hovering && !reducedMotion;
}

export function defaultAutoplay(kind: KindId): boolean {
  return AUTOPLAY_KINDS.has(kind);
}

/**
 * Fade commits the cut with opacity. Do not translate or relayout.
 * Documented as a constant so a fade cannot pick up a track offset.
 */
export function fadeUsesOpacityOnly(): true {
  return true;
}

export function transitionProps(kind: KindId): TransitionSpec {
  if (kind === "fade") return { property: "opacity", opacityOnly: true };
  if (kind === "accordion") {
    return { property: "grid-template-columns", opacityOnly: false };
  }
  return { property: "transform", opacityOnly: false };
}

/** Spin rotates a product. It is not a list of slides. */
export function isRotateNotSlide(kind: KindId): boolean {
  return kind === "spin";
}

/**
 * Reduced motion: fade keeps opacity; every other cut jumps.
 * Spatial tweens are not a fallback.
 */
export function reducedAdvance(kind: KindId, reducedMotion: boolean): "tween" | "fade" | "jump" {
  if (!reducedMotion) return "tween";
  if (kind === "fade") return "fade";
  return "jump";
}

export function motionMs(reducedMotion: boolean, tweenMs: number): number {
  return reducedMotion ? 0 : tweenMs;
}

export function shortestOffset(i: number, active: number, length: number): number {
  if (length <= 0) return 0;
  let d = wrapIndex(i, length) - wrapIndex(active, length);
  const half = length / 2;
  if (d > half) d -= length;
  if (d < -half) d += length;
  return d;
}

export function coverflowHidden(offset: number): boolean {
  return Math.abs(offset) > 1;
}

export function stackLayer(depth: number): { y: number; rotate: number; scale: number } {
  if (depth <= 0) return { y: 0, rotate: 0, scale: 1 };
  if (depth === 1) return { y: 12, rotate: 3.5, scale: 0.96 };
  return { y: 22, rotate: -2.5, scale: 0.92 };
}

export function accordionWeights(active: number, length: number): number[] {
  if (length <= 0) return [];
  const current = wrapIndex(active, length);
  return Array.from({ length }, (_, i) => (i === current ? 4 : 1));
}

export function spinAngle(index: number, faces = SLIDE_COUNT): number {
  if (faces <= 0) return 0;
  return wrapIndex(index, faces) * (360 / faces);
}

export function angleToIndex(angle: number, faces = SLIDE_COUNT): number {
  if (faces <= 0) return 0;
  const span = 360 / faces;
  const a = ((angle % 360) + 360) % 360;
  return wrapIndex(Math.round(a / span), faces);
}

/** Layer shift in px. Factors 0.3 / 0.7 / 1.0. */
export function parallaxOffset(index: number, factor: number, stride = 72): number {
  return -index * stride * factor;
}

export function stageIndex(
  raw: string,
  length = SLIDE_COUNT,
  fallback = DEFAULT_STAGE_INDEX,
): number {
  if (raw === "") return clampIndex(fallback, length);
  const n = Number(raw);
  if (!Number.isFinite(n)) return clampIndex(fallback, length);
  return clampIndex(n, length);
}
