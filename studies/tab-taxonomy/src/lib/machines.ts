export type Box = { left: number; width: number };

export type StepKind = "done" | "current" | "todo";

export type FolderLayer = { z: number; raised: boolean };

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Indicator is the text span, not the equal-width cell. */
export function textIndicator(
  listLeft: number,
  textLeft: number,
  textWidth: number,
): Box {
  return {
    left: textLeft - listLeft,
    width: Math.max(0, textWidth),
  };
}

/**
 * First measure (or a zero-width box) must not animate from 0.
 * After that, only `left` / `width` may transition.
 */
export function indicatorTransition(prev: Box | null): "none" | "left, width" {
  if (!prev || prev.width <= 0) return "none";
  return "left, width";
}

/** Equal-width pill inside one track. `gap` is the space between items. */
export function equalPill(index: number, count: number, trackWidth: number, gap = 0): Box {
  const n = Math.max(1, count);
  const i = clamp(index, 0, n - 1);
  const inner = Math.max(0, trackWidth - gap * (n - 1));
  const width = inner / n;
  return { left: i * (width + gap), width };
}

export function stepKind(index: number, current: number): StepKind {
  if (index < current) return "done";
  if (index === current) return "current";
  return "todo";
}

/** Drop the panel’s top-left radius only when the first card tab is current. */
export function cardPanelRadius(
  selectedIndex: number,
  radiusPx: number,
): { topLeft: number; topRight: number } {
  return {
    topLeft: selectedIndex === 0 ? 0 : radiusPx,
    topRight: radiusPx,
  };
}

/** Selected folder sits above the stack; others keep their paper order. */
export function folderLayer(index: number, selected: number, count: number): FolderLayer {
  return {
    z: index === selected ? count + 1 : index + 1,
    raised: index === selected,
  };
}

export function bevelInset(height: number, degrees: number): number {
  const rad = (degrees * Math.PI) / 180;
  return height * Math.tan(rad);
}
