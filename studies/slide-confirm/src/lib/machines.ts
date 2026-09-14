export type SlideState = "idle" | "dragging" | "resetting" | "committed";

export interface SlideGeometry {
  trackWidth: number;
  thumbWidth: number;
  maxTravel: number;
}

/**
 * 限制数值在 [min, max] 闭区间内
 */
export function clamp(val: number, min: number, max: number): number {
  if (Number.isNaN(val)) return min;
  const [lower, upper] = min <= max ? [min, max] : [max, min];
  return Math.min(Math.max(val, lower), upper);
}

/**
 * 计算滑轨最大可用滑行行程 L = trackWidth - thumbWidth - padding
 */
export function calcMaxTravel(trackWidth: number, thumbWidth: number, padding = 0): number {
  if (!Number.isFinite(trackWidth) || !Number.isFinite(thumbWidth)) return 0;
  const pad = Number.isFinite(padding) ? padding : 0;
  return Math.max(0, trackWidth - thumbWidth - pad);
}

/**
 * 物理阻尼位移计算（两端橡皮筋衰减）
 * 在 [0, maxTravel] 之间为 1:1 精确跟手；
 * 超过 maxTravel 时施加指数衰减阻尼；向左反向拖动同样阻尼抑制。
 */
export function calcDampedOffset(rawDx: number, maxTravel: number): number {
  if (!Number.isFinite(rawDx) || !Number.isFinite(maxTravel) || maxTravel <= 0) {
    return 0;
  }
  if (rawDx < 0) {
    return -Math.pow(Math.abs(rawDx), 0.75);
  }
  if (rawDx > maxTravel) {
    const over = rawDx - maxTravel;
    return maxTravel + Math.pow(over, 0.75);
  }
  return rawDx;
}

/**
 * 计算归一化进度比率 [0, 1]
 */
export function calcSlideProgress(rawDx: number, maxTravel: number): number {
  if (!Number.isFinite(rawDx) || !Number.isFinite(maxTravel) || maxTravel <= 0) {
    return 0;
  }
  return clamp(rawDx / maxTravel, 0, 1);
}

/**
 * 计算提示文案透明度：随滑动位移快速线性淡出，避免与抓手重叠
 */
export function calcTextOpacity(progress: number): number {
  if (!Number.isFinite(progress)) return 1;
  const clamped = clamp(progress, 0, 1);
  return Math.max(0, 1 - clamped * 1.5);
}

/**
 * 裁决是否达到确认阈值（默认 85%）
 */
export function isThresholdReached(progress: number, threshold = 0.85): boolean {
  if (!Number.isFinite(progress) || !Number.isFinite(threshold)) return false;
  return progress >= threshold;
}
