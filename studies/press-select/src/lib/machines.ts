export const PRESS_HOLD_DELAY_MS = 480;
export const DRIFT_TOLERANCE_PX = 8;
export const DRIFT_TOLERANCE_SQ = DRIFT_TOLERANCE_PX * DRIFT_TOLERANCE_PX;

export function shouldCancelHold(dx: number, dy: number): boolean {
  return dx * dx + dy * dy > DRIFT_TOLERANCE_SQ;
}

export type GestureVerdict = "open" | "scroll" | "select" | "pending";

export function gestureVerdict(
  elapsedMs: number,
  driftSq: number,
  isReleased: boolean,
): GestureVerdict {
  if (driftSq > DRIFT_TOLERANCE_SQ) {
    return "scroll";
  }
  if (elapsedMs >= PRESS_HOLD_DELAY_MS) {
    return "select";
  }
  if (isReleased) {
    return "open";
  }
  return "pending";
}

export function toggleSelection(selectedIds: string[], targetId: string): string[] {
  if (selectedIds.includes(targetId)) {
    return selectedIds.filter((id) => id !== targetId);
  }
  return [...selectedIds, targetId];
}

export function selectAll(allIds: string[]): string[] {
  return [...allIds];
}

export function clearSelection(): string[] {
  return [];
}
