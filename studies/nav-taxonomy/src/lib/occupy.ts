import type { KindId } from "./kinds";

export type Occupancy = "occupy" | "overlay" | "aux";

export type Edge = "top" | "left" | "bottom" | "none";

export function navOccupancy(kind: KindId): Occupancy {
  switch (kind) {
    case "floating":
    case "sidebar":
    case "scrollspy":
    case "shrink":
    case "bottom":
      return "occupy";
    case "drawer":
    case "overlay":
      return "overlay";
    case "breadcrumb":
    case "dropdown":
    case "mega":
      return "aux";
  }
}

export function occupiesBottom(kind: KindId): boolean {
  return kind === "bottom";
}

export function isHamburgerOverlay(kind: KindId): boolean {
  return kind === "drawer" || kind === "overlay";
}

export function itemCap(kind: KindId): number | null {
  return kind === "bottom" ? 5 : null;
}

export function occupiesEdge(kind: KindId): Edge {
  if (kind === "bottom") return "bottom";
  // Scrollspy is a side rail in `placeSketch`/`ScrollspyDemo`, not a top bar.
  if (kind === "sidebar" || kind === "scrollspy") return "left";
  if (kind === "floating" || kind === "shrink") return "top";
  return "none";
}
