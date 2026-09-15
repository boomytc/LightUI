/**
 * Angular cone coverage for per-glyph secret reveal.
 */

export type Point = { x: number; y: number };

export type RevealKind = "cone" | "toggle" | "nearest";

export const EDGE_RATIO = 0.22;
export const NEAR_DIST = 4;
export const IN_CONE = 0.38;
/** Test cone is tighter than the painted cone so letters sit in the core. */
export const REVEAL_NARROW = 0.72;
export const DEFAULT_BEAM_WIDTH = 34;
/** Full beam width in degrees; half-angle is this / 2. Default 34° → 17°. */
export const DEFAULT_SWEEP_SPEED = 0.7;
/** Auto-search nods around the field aim, in radians — enough to cut the row. */
export const SEARCH_YAW = 0.2;
export const DEMO_SECRET = "only-the-beam";
export const PARK_ANGLE = Math.PI;

export type FieldRect = { left: number; top: number; width: number; height: number };

export function shortestAngle(from: number, to: number): number {
  const a = Number.isFinite(from) ? from : 0;
  const b = Number.isFinite(to) ? to : 0;
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function lerpAngle(from: number, to: number, t: number): number {
  const k = Number.isFinite(t) ? Math.min(1, Math.max(0, t)) : 0;
  return from + shortestAngle(from, to) * k;
}

export function angleTo(from: Point, to: Point): number {
  const x0 = Number.isFinite(from?.x) ? from.x : 0;
  const y0 = Number.isFinite(from?.y) ? from.y : 0;
  const x1 = Number.isFinite(to?.x) ? to.x : 0;
  const y1 = Number.isFinite(to?.y) ? to.y : 0;
  return Math.atan2(y1 - y0, x1 - x0);
}

export function beamHalfAngle(widthDeg: number): number {
  const w = Number.isFinite(widthDeg) ? Math.min(80, Math.max(8, widthDeg)) : DEFAULT_BEAM_WIDTH;
  return (w * Math.PI) / 180 / 2;
}

/** 1 inside the cone, 0 outside, with a soft edge. */
export function coneCoverage(
  point: Point,
  origin: Point,
  angle: number,
  halfAngle: number,
  maxDist: number,
): number {
  if (!Number.isFinite(point?.x) || !Number.isFinite(point?.y)) return 0;
  if (!Number.isFinite(origin?.x) || !Number.isFinite(origin?.y)) return 0;
  const reach = Number.isFinite(maxDist) && maxDist > 0 ? maxDist : 0;
  if (reach <= 0) return 0;

  const dx = point.x - origin.x;
  const dy = point.y - origin.y;
  const dist = Math.hypot(dx, dy);
  if (dist > reach) return 0;
  if (dist < NEAR_DIST) return 1;

  const half = Number.isFinite(halfAngle) && halfAngle > 0 ? halfAngle : 0;
  if (half <= 0) return 0;

  const a = Math.atan2(dy, dx);
  const diff = Math.abs(shortestAngle(angle, a));
  const edge = half * EDGE_RATIO;
  if (diff > half + edge) return 0;
  if (diff <= half - edge) {
    const fall = 1 - dist / reach;
    return 0.55 + 0.45 * fall;
  }
  const span = 2 * edge;
  if (span <= 0) return 0;
  const t = 1 - (diff - (half - edge)) / span;
  const s = Math.max(0, Math.min(1, t));
  return s * s * (3 - 2 * s);
}

export function inCone(
  point: Point,
  origin: Point,
  angle: number,
  halfAngle: number,
  maxDist: number,
): boolean {
  return coneCoverage(point, origin, angle, halfAngle, maxDist) > IN_CONE;
}

export function revealGlyphs(
  glyphs: Point[],
  origin: Point,
  angle: number,
  halfAngle: number,
  maxDist: number,
): boolean[] {
  const h = halfAngle * REVEAL_NARROW;
  return glyphs.map((p) => inCone(p, origin, angle, h, maxDist));
}

export function nearestIndex(glyphs: Point[], pointer: Point): number {
  if (!glyphs.length) return -1;
  const px = Number.isFinite(pointer?.x) ? pointer.x : 0;
  const py = Number.isFinite(pointer?.y) ? pointer.y : 0;
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < glyphs.length; i++) {
    const g = glyphs[i]!;
    const gx = Number.isFinite(g.x) ? g.x : 0;
    const gy = Number.isFinite(g.y) ? g.y : 0;
    const d = (gx - px) * (gx - px) + (gy - py) * (gy - py);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

export function toggleReveal(length: number, awake: boolean): boolean[] {
  const n = Number.isFinite(length) ? Math.max(0, Math.floor(length)) : 0;
  return Array.from({ length: n }, () => Boolean(awake));
}

export function searchAngle(
  t: number,
  speed: number = DEFAULT_SWEEP_SPEED,
  yaw: number = SEARCH_YAW,
): number {
  const s = Number.isFinite(speed) ? speed : DEFAULT_SWEEP_SPEED;
  const y = Number.isFinite(yaw) ? yaw : SEARCH_YAW;
  const time = Number.isFinite(t) ? t : 0;
  const searchT = time * s;
  return PARK_ANGLE + Math.sin(searchT * 0.82) * y + Math.sin(searchT * 0.29 + 0.8) * (y * 0.39);
}

/** Aim at a fraction along the field row (0 = left, 1 = right). */
export function fieldAim(field: FieldRect, t = 0.32): Point {
  const w = Number.isFinite(field?.width) ? field.width : 0;
  const h = Number.isFinite(field?.height) ? field.height : 0;
  const left = Number.isFinite(field?.left) ? field.left : 0;
  const top = Number.isFinite(field?.top) ? field.top : 0;
  const k = Number.isFinite(t) ? Math.min(1, Math.max(0, t)) : 0.32;
  return { x: left + w * k, y: top + h * 0.5 };
}

/** Stage peek: aim further left on the row so the rim cuts near the lamp. */
export function peekAim(field: FieldRect): Point {
  return fieldAim(field, 0.12);
}

export function sameReveal(a: boolean[], b: boolean[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
