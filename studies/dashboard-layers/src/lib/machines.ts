export type ViewMode = "layered" | "platter";
export type KindId = ViewMode;
export type Layer = "kpi" | "dim" | "detail";
export type StageState = "kpi" | "dim" | "all";

export type Selection = {
  kpi: string | null;
  dim: string | null;
};

export const KIND_IDS: readonly KindId[] = ["layered", "platter"];

export const EMPTY_SELECTION: Selection = { kpi: null, dim: null };

export function isKindId(value: string): value is KindId {
  return (KIND_IDS as readonly string[]).includes(value);
}

/** Platter serves every block at once. */
export function showsAll(view: ViewMode): boolean {
  return view === "platter";
}

/** Only layered waits for a click before the next grain. */
export function canExpand(view: ViewMode): boolean {
  return view === "layered";
}

/**
 * Current grain. Platter is already at the last layer even with
 * an empty selection — nothing is waiting to be opened.
 */
export function layerOf(view: ViewMode, selection: Selection): Layer {
  if (showsAll(view)) return "detail";
  if (selection.dim) return "detail";
  if (selection.kpi) return "dim";
  return "kpi";
}

/** Mini chart belongs on the platter, not as a layered middle step. */
export function showsChart(view: ViewMode): boolean {
  return showsAll(view);
}

export function showsDimTable(view: ViewMode, selection: Selection): boolean {
  return showsAll(view) || layerOf(view, selection) !== "kpi";
}

/** Short detail is a drill panel. A platter has the table, not this. */
export function showsDetail(view: ViewMode, selection: Selection): boolean {
  return canExpand(view) && layerOf(view, selection) === "detail";
}

export function stageState(raw: string, view: ViewMode = "layered"): StageState {
  if (raw === "kpi" || raw === "dim" || raw === "all") return raw;
  return view === "platter" ? "all" : "dim";
}

export function selectionForStage(
  state: StageState,
  kpiId: string,
  dimId: string,
): Selection {
  if (state === "kpi") return { kpi: null, dim: null };
  if (state === "dim") return { kpi: kpiId, dim: null };
  return { kpi: kpiId, dim: dimId };
}
