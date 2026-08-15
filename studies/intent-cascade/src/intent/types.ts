import type { Point, Triangle } from "../lib/geometry";
import type { MenuNode } from "../lib/menu-data";

export type AimColor = "predict" | "confirm";

export type AimBand = {
  level: number;
  color: AimColor;
  triangle: Triangle;
  parentId: string;
};

export type AimDecision = "idle" | "protected" | "switched" | "confirmed" | "closed";

export type PointerKind = "mouse" | "touch" | "pen" | "unknown";

export type CascadeState = {
  open: boolean;
  path: string[];
  mouse: Point | null;
  bands: AimBand[];
  decision: AimDecision;
  hoveredId: string | null;
  pointerKind: PointerKind;
};

export type LevelSlice = {
  level: number;
  nodes: MenuNode[];
  activeId: string | null;
  placeholder: string;
};
