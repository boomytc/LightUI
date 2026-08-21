export const YAW_COLS = 12;
export const PITCH_ROWS = 3;
export const CELL = 256;

export type LookVec = { x: number; y: number };
export type LookCell = { col: number; row: number };

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** Pointer offset → look vector. Length > 1 is clamped onto the radius circle. */
export function targetFromOffset(dx: number, dy: number, radius: number, lookY = 1): LookVec {
  let tx = dx / Math.max(radius, 1);
  let ty = (dy / Math.max(radius, 1)) * lookY;
  const len = Math.hypot(tx, ty);
  if (len > 1) {
    tx /= len;
    ty /= len;
  }
  return { x: tx, y: ty };
}

export function lookToCell(lookX: number, lookY: number): LookCell {
  const col = Math.round((clamp(lookX, -1, 1) * 0.5 + 0.5) * (YAW_COLS - 1));
  const row = Math.round((clamp(lookY, -1, 1) * 0.5 + 0.5) * (PITCH_ROWS - 1));
  return {
    col: clamp(col, 0, YAW_COLS - 1),
    row: clamp(row, 0, PITCH_ROWS - 1),
  };
}

export function blinkSourceRow(row: number, blinking: boolean): number {
  return blinking ? row + PITCH_ROWS : row;
}

export function smoothToward(current: number, target: number, smoothing: number, dt: number): number {
  const a = 1 - Math.pow(clamp(smoothing, 0, 0.98), Math.max(dt, 0) * 60);
  return current + (target - current) * a;
}

export const STAGE_POSES = {
  center: { x: 0, y: 0, blink: false },
  left: { x: -1, y: 0, blink: false },
  right: { x: 1, y: 0, blink: false },
  up: { x: 0, y: -1, blink: false },
  blink: { x: 0, y: 0, blink: true },
} as const;

export type StageKind = keyof typeof STAGE_POSES;
