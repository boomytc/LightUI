export const DEFAULT_ACTIONS_WIDTH = 148; // px
export const DEFAULT_COMMIT_THRESHOLD = 172; // px
export const DEFAULT_LOCK_THRESHOLD = 8; // px
export const DEFAULT_SNAP_RATIO = 0.45; // 45% of actions width

export type GestureLockAxis = "undecided" | "horizontal" | "vertical";

export function resolveGestureLock(
  dx: number,
  dy: number,
  thresholdPx: number = DEFAULT_LOCK_THRESHOLD,
): GestureLockAxis {
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) {
    return "undecided";
  }
  const dist = Math.hypot(dx, dy);
  if (dist < thresholdPx || dist === 0) {
    return "undecided";
  }
  return Math.abs(dx) >= Math.abs(dy) ? "horizontal" : "vertical";
}

export function calcDragOffset(
  deltaX: number,
  originX: number = 0,
  maxLeftPx: number = 220,
  damping: number = 0.25,
): number {
  if (!Number.isFinite(deltaX)) return originX;
  const raw = originX + deltaX;

  // Swiping to the right (positive): resisted bounce back
  if (raw > 0) {
    return Number((raw * damping).toFixed(1));
  }

  // Swiping deeper past maxLeftPx: resisted overdrag
  if (raw < -maxLeftPx) {
    const excess = -raw - maxLeftPx;
    return Number((-maxLeftPx - excess * damping).toFixed(1));
  }

  return Number(raw.toFixed(1));
}

export type SwipeReleaseVerdict = {
  targetX: number;
  action: "commit" | "reveal" | "close";
};

export function resolveSwipeRelease(
  currentX: number,
  actionsWidth: number = DEFAULT_ACTIONS_WIDTH,
  commitThreshold: number = DEFAULT_COMMIT_THRESHOLD,
  snapRatio: number = DEFAULT_SNAP_RATIO,
): SwipeReleaseVerdict {
  if (!Number.isFinite(currentX)) {
    return { targetX: 0, action: "close" };
  }
  // 1. Deep overswipe past commit threshold -> execute destructive action directly
  if (currentX <= -commitThreshold) {
    return {
      targetX: -commitThreshold,
      action: "commit",
    };
  }

  // 2. Swiped past latch ratio (e.g. 45% of reveal width) -> snap open to reveal tray
  const latchThreshold = -actionsWidth * snapRatio;
  if (currentX <= latchThreshold) {
    return {
      targetX: -actionsWidth,
      action: "reveal",
    };
  }

  // 3. Otherwise spring back to closed
  return {
    targetX: 0,
    action: "close",
  };
}

export function calcActionProgress(currentX: number, actionsWidth: number = DEFAULT_ACTIONS_WIDTH): number {
  if (currentX >= 0) return 0;
  return Math.min(1, Number((Math.abs(currentX) / actionsWidth).toFixed(2)));
}
