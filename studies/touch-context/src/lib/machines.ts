export const DEFAULT_HOLD_DELAY_MS = 460;
export const DEFAULT_DRIFT_TOLERANCE_PX = 10;
export const DEFAULT_MENU_WIDTH = 152;
export const DEFAULT_MENU_HEIGHT = 126; // 3 items x 42px

export function shouldCancelHold(
  startX: number,
  startY: number,
  currentX: number,
  currentY: number,
  tolerancePx: number = DEFAULT_DRIFT_TOLERANCE_PX,
): boolean {
  if (
    !Number.isFinite(startX) ||
    !Number.isFinite(startY) ||
    !Number.isFinite(currentX) ||
    !Number.isFinite(currentY)
  ) {
    return true;
  }
  const drift = Math.hypot(currentX - startX, currentY - startY);
  return drift > tolerancePx;
}

export type MenuPositionVerdict = {
  x: number;
  y: number;
  flippedY: boolean;
};

export function calcClampedMenuPosition(
  anchorX: number,
  anchorY: number,
  menuWidth: number = DEFAULT_MENU_WIDTH,
  menuHeight: number = DEFAULT_MENU_HEIGHT,
  containerWidth: number = 320,
  containerHeight: number = 500,
  padding: number = 12,
): MenuPositionVerdict {
  const safeAnchorX = Number.isFinite(anchorX) ? anchorX : 0;
  const safeAnchorY = Number.isFinite(anchorY) ? anchorY : 0;

  // Horizontal clamp: keep within container margins
  const minX = padding;
  const maxX = Math.max(minX, containerWidth - menuWidth - padding);
  const rawX = safeAnchorX - 20; // align slightly to the left of touch center
  const x = Math.round(Math.min(maxX, Math.max(minX, rawX)));

  // Vertical placement & collision flip
  // If placing below would overflow the bottom edge, flip above anchor
  const wouldOverflowBottom = safeAnchorY + menuHeight + padding > containerHeight;
  let rawY: number;
  let flippedY = false;

  if (wouldOverflowBottom) {
    rawY = safeAnchorY - menuHeight - 8;
    flippedY = true;
  } else {
    rawY = safeAnchorY + 8;
    flippedY = false;
  }

  const minY = padding;
  const maxY = Math.max(minY, containerHeight - menuHeight - padding);
  const y = Math.round(Math.min(maxY, Math.max(minY, rawY)));

  return { x, y, flippedY };
}

export function calcHoldProgress(
  elapsedMs: number,
  holdDelayMs: number = DEFAULT_HOLD_DELAY_MS,
): number {
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0 || holdDelayMs <= 0) return 0;
  return Math.min(1, Number((elapsedMs / holdDelayMs).toFixed(3)));
}
