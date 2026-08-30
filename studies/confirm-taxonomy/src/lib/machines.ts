export const DEFAULT_HOLD_DURATION_MS = 2000;
export const DEFAULT_SWIPE_THRESHOLD_PX = 56;
export const DEFAULT_SWIPE_ACTION_PX = 80;

/**
 * Calculates continuous hold press progress ratio [0, 1].
 */
export function calculateHoldProgress(
  elapsedMs: number,
  targetMs: number = DEFAULT_HOLD_DURATION_MS,
): number {
  if (targetMs <= 0) return 1;
  if (elapsedMs <= 0) return 0;
  return Math.min(1, Math.max(0, elapsedMs / targetMs));
}

/**
 * Checks whether the continuous hold duration has been satisfied.
 */
export function isHoldComplete(
  elapsedMs: number,
  targetMs: number = DEFAULT_HOLD_DURATION_MS,
): boolean {
  return elapsedMs >= targetMs;
}

/**
 * Calculates drag reveal distance and determine whether it should snap open.
 */
export function resolveSwipeReveal(
  dx: number,
  thresholdPx: number = DEFAULT_SWIPE_THRESHOLD_PX,
  maxActionPx: number = DEFAULT_SWIPE_ACTION_PX,
): {
  revealedPx: number;
  shouldOpen: boolean;
} {
  // dx is negative when dragging left
  const offset = Math.min(0, Math.max(-maxActionPx - 12, dx));
  const shouldOpen = dx < -thresholdPx;
  return {
    revealedPx: offset,
    shouldOpen,
  };
}

/**
 * Verifies exact string matching for dangerous type-to-confirm inputs.
 */
export function isTypeMatchValid(input: string, targetToken: string = "DELETE"): boolean {
  return input === targetToken;
}

/**
 * Checks if every required item in a consequence checklist is confirmed.
 */
export function areAllChecklistItemsSelected(
  checkedMap: Record<string, boolean>,
  requiredIds: string[],
): boolean {
  if (requiredIds.length === 0) return false;
  return requiredIds.every((id) => Boolean(checkedMap[id]));
}
