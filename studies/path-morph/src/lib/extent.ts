/** Silhouette metrics for teaching — not used by the interpolators. */

export type PathExtent = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  area: number;
  cx: number;
  cy: number;
  rms: number;
};

const EMPTY: PathExtent = {
  minX: 0,
  minY: 0,
  maxX: 24,
  maxY: 24,
  width: 24,
  height: 24,
  area: 576,
  cx: 12,
  cy: 12,
  rms: 8,
};

export function extentOf(buffers: Float64Array[]): PathExtent {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let sx = 0;
  let sy = 0;
  let n = 0;

  for (const buf of buffers) {
    const pts = buf.length / 2;
    for (let i = 0; i < pts; i++) {
      const x = buf[2 * i];
      const y = buf[2 * i + 1];
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      sx += x;
      sy += y;
      n++;
    }
  }

  if (!n) return EMPTY;

  const cx = sx / n;
  const cy = sy / n;
  let r2 = 0;
  for (const buf of buffers) {
    const pts = buf.length / 2;
    for (let i = 0; i < pts; i++) {
      const dx = buf[2 * i] - cx;
      const dy = buf[2 * i + 1] - cy;
      r2 += dx * dx + dy * dy;
    }
  }

  const width = Math.max(0, maxX - minX);
  const height = Math.max(0, maxY - minY);
  return {
    minX,
    minY,
    maxX,
    maxY,
    width,
    height,
    area: width * height,
    cx,
    cy,
    rms: Math.sqrt(r2 / n),
  };
}

/** Rotation-invariant collapse: 0 keeps the rest cloud, 1 is a point. */
export function collapseRatio(live: PathExtent, rest: PathExtent): number {
  const restR = rest.rms;
  if (restR <= 1e-6) return 0;
  const keep = (live.rms / restR) * (live.rms / restR);
  return Math.max(0, Math.min(1, 1 - keep));
}
