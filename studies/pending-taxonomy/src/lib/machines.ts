export type KindId = "skeleton" | "empty" | "page";

export type StageState = "loading" | "ready" | "empty";

export type Occupancy = "skeleton" | "content" | "empty" | "veil";

export const KIND_IDS: readonly KindId[] = ["skeleton", "empty", "page"];

/** Arrival swap. Short enough that the layout does not sit in two skins. */
export const CROSSFADE_MS = 180;

export function isKindId(value: string): value is KindId {
  return (KIND_IDS as readonly string[]).includes(value);
}

/** Skeleton holds the seat while content is arriving. Empty does not. */
export function reservesLayout(kind: KindId): boolean {
  return kind === "skeleton";
}

/** Empty must offer one next action. A skeleton is not a CTA. */
export function hasAction(kind: KindId): boolean {
  return kind === "empty";
}

/**
 * A spinner is indeterminate progress, not a pending occupancy.
 * Neither leaf may replace its job with a loop.
 */
export function allowsSpinner(kind: KindId): boolean {
  void kind;
  return false;
}

export function stageState(raw: string, kind: KindId = "skeleton"): StageState {
  if (raw === "loading" || raw === "ready" || raw === "empty") return raw;
  if (kind === "empty") return "empty";
  return "loading";
}

/**
 * What occupies the region.
 * Skeleton never becomes an empty state; empty never becomes a spinner.
 * Page is a full-page veil while the shell is unknown — not a skeleton, not a spinner.
 */
export function occupancy(kind: KindId, state: StageState): Occupancy {
  if (kind === "skeleton") {
    return state === "ready" ? "content" : "skeleton";
  }
  if (kind === "page") {
    return state === "ready" ? "content" : "veil";
  }
  return state === "ready" ? "content" : "empty";
}

/** First-open veil. Structure is unknown, so there is no layout to reserve. */
export function isVeil(kind: KindId, state: StageState): boolean {
  return occupancy(kind, state) === "veil";
}

/** Shimmer is a background-position loop. Reduced motion leaves gray blocks. */
export function shimmerMotion(reduceMotion: boolean): boolean {
  return !reduceMotion;
}
