export const DEFAULT_THRESHOLD_PX = 56;
export const DEFAULT_MAX_PULL_PX = 120;
export const DEFAULT_DAMPING = 0.42;

export function shouldTakeoverScroll(scrollTop: number, dy: number, isBusy: boolean): boolean {
  if (isBusy) return false;
  return scrollTop <= 0 && dy > 0;
}

export function calculatePull(
  dy: number,
  damping: number = DEFAULT_DAMPING,
  maxPull: number = DEFAULT_MAX_PULL_PX,
): number {
  if (dy <= 0) return 0;
  return Math.min(maxPull, Math.round(dy * damping));
}

export function isThresholdMet(pullPx: number, threshold: number = DEFAULT_THRESHOLD_PX): boolean {
  return pullPx >= threshold;
}

export function pullProgress(pullPx: number, threshold: number = DEFAULT_THRESHOLD_PX): number {
  if (threshold <= 0) return 0;
  return Math.min(1, Math.max(0, pullPx / threshold));
}

export type PullVerdict = {
  shouldRefresh: boolean;
  targetHeight: number;
};

export function resolvePointerRelease(
  pullPx: number,
  threshold: number = DEFAULT_THRESHOLD_PX,
): PullVerdict {
  if (isThresholdMet(pullPx, threshold)) {
    return {
      shouldRefresh: true,
      targetHeight: threshold,
    };
  }
  return {
    shouldRefresh: false,
    targetHeight: 0,
  };
}
