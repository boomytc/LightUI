export type IntentId =
  | "change"
  | "compare"
  | "share"
  | "relate"
  | "flow"
  | "ability";

export type KindId = IntentId;

export type Followup = "primary" | "alt";

export type Mark =
  | "line"
  | "area"
  | "column"
  | "bar"
  | "pie"
  | "stacked"
  | "scatter"
  | "heatmap"
  | "funnel"
  | "radar";

export const KIND_IDS: readonly KindId[] = [
  "change",
  "compare",
  "share",
  "relate",
  "flow",
  "ability",
];

const MARK_BY_INTENT: Record<IntentId, { primary: Mark; alt: Mark }> = {
  change: { primary: "line", alt: "area" },
  compare: { primary: "column", alt: "bar" },
  share: { primary: "pie", alt: "stacked" },
  relate: { primary: "scatter", alt: "heatmap" },
  flow: { primary: "funnel", alt: "funnel" },
  ability: { primary: "radar", alt: "radar" },
};

const FROM_ZERO: ReadonlySet<Mark> = new Set([
  "line",
  "area",
  "column",
  "bar",
  "stacked",
  "radar",
]);

export const maxPieSlices = 5;

export function isKindId(value: string): value is KindId {
  return (KIND_IDS as readonly string[]).includes(value);
}

export function isFollowup(value: string): value is Followup {
  return value === "primary" || value === "alt";
}

/** The six leaves are the questions. Kind is the intent. */
export function intentOf(kind: KindId): IntentId {
  return kind;
}

export function markFor(intent: IntentId, followup: Followup = "primary"): Mark {
  const pair = MARK_BY_INTENT[intent];
  return followup === "alt" ? pair.alt : pair.primary;
}

export function hasAlt(intent: IntentId): boolean {
  return markFor(intent, "primary") !== markFor(intent, "alt");
}

/** Column, bar, stacked, line, area, and radar exaggerate if the axis is cropped. */
export function axisFromZero(mark: Mark): boolean {
  return FROM_ZERO.has(mark);
}

export function tooManyForPie(n: number): boolean {
  return n > maxPieSlices;
}

/** A line may only connect ordered time. Unordered categories stay bars. */
export function lineRequiresTime(kind: KindId): boolean {
  return intentOf(kind) === "change";
}

export function stageState(raw: string): Followup {
  return raw === "alt" ? "alt" : "primary";
}
