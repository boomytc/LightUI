import type { CSSProperties } from "react";
import type { CylinderVisual } from "../lib/machines";

export function cylinderAppearance(
  visual: CylinderVisual,
  enableDepth: boolean,
  emphasized: boolean,
): CSSProperties {
  if (!enableDepth) {
    return {
      opacity: emphasized ? 1 : 0.36,
      color: emphasized ? "var(--color-accent)" : "var(--color-fg)",
      fontWeight: emphasized ? 700 : 500,
      transform: "none",
      filter: "none",
    };
  }

  return {
    opacity: visual.opacity,
    color: emphasized ? "var(--color-accent)" : "var(--color-fg)",
    fontWeight: emphasized ? 700 : 500,
    transform: `rotateX(${visual.rotateXDeg}deg) scale(${visual.scale})`,
    filter: visual.blurPx > 0 ? `blur(${visual.blurPx}px)` : "none",
  };
}

export type WheelVisualFrame = {
  fraction: number;
  index: number;
  scrollTop: number;
};
