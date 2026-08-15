export function stepIndex(index: number, dir: number, length: number): number {
  if (length <= 0) return 0;
  return Math.min(length - 1, Math.max(0, index + dir));
}

export function wheelOffset(index: number, active: number): number {
  return index - active;
}

export type WheelVisual = {
  rotate: number;
  y: number;
  x: number;
  opacity: number;
  blur: number;
  scale: number;
  baseline: boolean;
};

export function wheelVisual(offset: number): WheelVisual {
  const abs = Math.abs(offset);
  return {
    rotate: offset * -10,
    y: offset * 58,
    x: -abs * 10,
    opacity: Math.max(0.16, 1 - abs * 0.32),
    blur: abs === 0 ? 0 : Math.min(5, abs * 1.6),
    scale: 1 - Math.min(0.12, abs * 0.04),
    baseline: offset === 0,
  };
}

export function shouldStepWheel(delta: number, threshold = 6): -1 | 0 | 1 {
  if (Math.abs(delta) < threshold) return 0;
  return delta > 0 ? 1 : -1;
}
