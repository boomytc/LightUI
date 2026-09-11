import type { KindId } from "./kinds";
import { loc, type Localized } from "./site-locale";
import { expandKind, occupyPx, overlayPx } from "./space";

export type LaneId = "occupy" | "layer";

export const LANES: {
  id: LaneId;
  index: string;
  label: Localized;
  ask: Localized;
  kinds: KindId[];
}[] = [
  {
    id: "occupy",
    index: "01",
    label: loc("占位", "Occupies"),
    ask: loc("从主区流里拿走宽度", "Takes width from the main flow"),
    kinds: ["floating", "wheel", "multilevel", "collapsible"],
  },
  {
    id: "layer",
    index: "02",
    label: loc("图层", "Layer"),
    ask: loc("盖上来，占位仍是零", "Overlays; occupancy stays zero"),
    kinds: ["offcanvas"],
  },
];

const PAIRS: Partial<Record<KindId, KindId>> = {
  collapsible: "offcanvas",
  offcanvas: "collapsible",
  wheel: "multilevel",
  multilevel: "wheel",
};

export function laneOf(kind: KindId): LaneId {
  return kind === "offcanvas" ? "layer" : "occupy";
}

export function laneKinds(lane: LaneId): KindId[] {
  return LANES.find((item) => item.id === lane)?.kinds ?? LANES[0]!.kinds;
}

export function mixedPair(kind: KindId): KindId | undefined {
  return PAIRS[kind];
}

export function expandLine(kind: KindId): Localized {
  const expand = expandKind(kind);
  if (expand === "widen") return loc("展开改宽度", "Expand changes width");
  if (expand === "overlay") return loc("展开改图层", "Expand changes layer");
  return loc("展开不改空间", "Expand does not change space");
}

/** Teaching snapshot: occupy from the default resting state, overlay as the open layer. */
export function spaceSnap(kind: KindId): { occupy: number; overlay: number } {
  const resting = kind !== "offcanvas";
  return {
    occupy: occupyPx(kind, resting),
    overlay: overlayPx(kind, true),
  };
}
