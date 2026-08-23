export const KIND_IDS = ["beam", "fill"] as const;

export type KindId = (typeof KIND_IDS)[number];

export type Path = "border" | "fill";

export type StageState = "run" | "park";

/** Parked conic angle so the highlight sits on a visible corner. */
export const PARK_ANGLE = 210;

export const BEAM_DURATION = "3.2s";

export function isKindId(value: string): value is KindId {
  return (KIND_IDS as readonly string[]).includes(value);
}

export function isStageState(value: string): value is StageState {
  return value === "run" || value === "park";
}

/** Beam travels the stroke. Fill floods the face — the naive path. */
export function pathOf(kind: KindId): Path {
  return kind === "beam" ? "border" : "fill";
}

export function isNaive(kind: KindId): boolean {
  return pathOf(kind) === "fill";
}

/** Reduced motion stops the spin. The beam becomes a static stroke. */
export function shouldAnimate(reduced: boolean): boolean {
  return !reduced;
}

export function usesStaticStroke(kind: KindId, reduced: boolean): boolean {
  return pathOf(kind) === "border" && reduced;
}

export function isRunning(state: StageState, reduced: boolean): boolean {
  return state === "run" && shouldAnimate(reduced);
}

export function beamAngleCss(park: boolean, parkDeg = PARK_ANGLE): string {
  return park ? `${parkDeg}deg` : "0deg";
}

export function buildSnippet(): string {
  return `@property --beam-angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

.beam {
  border: 2px solid transparent;
  background:
    linear-gradient(var(--fill), var(--fill)) padding-box,
    conic-gradient(
      from var(--beam-angle),
      transparent 72%,
      var(--accent),
      transparent 88%
    ) border-box;
  animation: spin ${BEAM_DURATION} linear infinite;
}

@keyframes spin {
  to { --beam-angle: 360deg; }
}`;
}
