import type { Point, Rect, Triangle } from "./geometry";

export function midY(rect: Rect): number {
  return (rect.top + rect.bottom) / 2;
}

export function leadingEdge(child: Rect): { top: Point; bottom: Point } {
  return {
    top: { x: child.left, y: child.top + 2 },
    bottom: { x: child.left, y: child.bottom - 2 },
  };
}

/** Pointer still on a parent-column item, toward the submenu. */
export function pinHoverCursor(item: Rect, child: Rect): Point {
  return {
    x: Math.min(item.right - 22, child.left - 16),
    y: midY(item),
  };
}

/** Green lock: pointer already on the target row inside the submenu. */
export function pinConfirmCursor(child: Rect, toward: Rect): Point {
  return {
    x: child.left + Math.min(72, (child.right - child.left) * 0.4),
    y: midY(toward),
  };
}

/** Stage stills: fat corridor nailed to the open parent item. */
export function corridorTriangle(child: Rect, item: Rect): Triangle {
  const { top, bottom } = leadingEdge(child);
  return { cursor: { x: item.left + 12, y: midY(item) }, top, bottom };
}

/**
 * Overlay triangle. Confirmed uses the parent-item vertex so the corridor
 * stays attached to the open path; predict uses the live / pinned cursor.
 */
export function visualTriangle(cursor: Point, child: Rect, item: Rect | null, confirmed: boolean): Triangle {
  if (confirmed && item) return corridorTriangle(child, item);
  const { top, bottom } = leadingEdge(child);
  return { cursor, top, bottom };
}
