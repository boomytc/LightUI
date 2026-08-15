export type SpaceKind = "floating" | "wheel" | "multilevel" | "collapsible" | "offcanvas";

export type ExpandKind = "none" | "widen" | "overlay";

export const COLLAPSED_RAIL_PX = 72;
export const EXPANDED_RAIL_PX = 240;
export const OFFCANVAS_PANEL_PX = 256;

export function expandKind(kind: SpaceKind): ExpandKind {
  if (kind === "collapsible") return "widen";
  if (kind === "offcanvas") return "overlay";
  return "none";
}

/** Width taken from the main flow. Overlay panels are not occupancy. */
export function occupyPx(kind: SpaceKind, expanded: boolean): number {
  if (kind === "offcanvas") return 0;
  if (kind === "collapsible") return expanded ? EXPANDED_RAIL_PX : COLLAPSED_RAIL_PX;
  if (kind === "floating") return 216;
  if (kind === "wheel") return 176;
  return 208;
}

export function occupiesFlow(kind: SpaceKind): boolean {
  return occupyPx(kind, false) > 0;
}

export function overlayPx(kind: SpaceKind, expanded: boolean): number {
  return kind === "offcanvas" && expanded ? OFFCANVAS_PANEL_PX : 0;
}

export function dismissOverlay(): { open: false; restoreFocus: true } {
  return { open: false, restoreFocus: true };
}
