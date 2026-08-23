export type KindId =
  | "baseline"
  | "cover"
  | "axis"
  | "margin"
  | "padding"
  | "optical"
  | "inset";

export type StageState = "wrong" | "right";

/** What the right construction lines up. */
export type AlignTarget = "baseline" | "focus" | "box" | "gap" | "edge";

export type ObjectFit = "cover" | "contain";

export const KIND_IDS: readonly KindId[] = [
  "baseline",
  "cover",
  "axis",
  "margin",
  "padding",
  "optical",
  "inset",
];

/** Subject sits low in the frame (walker under the colonnade). */
export const SUBJECT_POSITION = "50% 88%";

export const GEOMETRIC_POSITION = "50% 50%";

/** Default cap-height as a fraction of em. */
export const CAP_RATIO = 0.7;

export function isKindId(value: string): value is KindId {
  return (KIND_IDS as readonly string[]).includes(value);
}

export function isStageState(value: string): value is StageState {
  return value === "wrong" || value === "right";
}

/**
 * What this spell aligns.
 * Cover and optical both answer “focus”: the photograph’s subject, or the
 * visual mass of a glyph/shape — not the geometric center of the box.
 */
export function aligns(kind: KindId): AlignTarget {
  switch (kind) {
    case "baseline":
      return "baseline";
    case "cover":
      return "focus";
    case "axis":
      return "box";
    case "margin":
      return "gap";
    case "padding":
      return "edge";
    case "optical":
      return "focus";
    case "inset":
      return "edge";
  }
}

/** Only the cover spell fills a crop. Everything else leaves object-fit at contain. */
export function objectFitFor(kind: KindId): ObjectFit {
  return kind === "cover" ? "cover" : "contain";
}

/** Cover still needs a focal point. Default 50% 50% is a blind crop. */
export function needsObjectPosition(kind: KindId): boolean {
  return kind === "cover";
}

export function objectPositionFor(kind: KindId, state: StageState = "right"): string {
  if (needsObjectPosition(kind) && state === "right") return SUBJECT_POSITION;
  return GEOMETRIC_POSITION;
}

/**
 * Padding-top so the cap sits `insetPx` from the edge.
 * Extra leading above the cap is not part of the visual inset.
 */
export function paddingTopForCap(
  insetPx: number,
  fontSizePx: number,
  lineHeightPx: number,
  capRatio = CAP_RATIO,
): number {
  const cap = fontSizePx * capRatio;
  const extraLeading = Math.max(0, (lineHeightPx - cap) / 2);
  return Math.max(0, insetPx - extraLeading);
}
