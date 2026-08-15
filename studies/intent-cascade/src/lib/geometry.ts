export type Point = { x: number; y: number };

export type Triangle = {
  cursor: Point;
  top: Point;
  bottom: Point;
};

const EPS = 1e-6;

export function dist(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function lerp(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/** Signed area / cross product of (b-a) × (c-a). */
function cross(a: Point, b: Point, c: Point): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

/**
 * Inclusive point-in-triangle via same-side cross products.
 * Stable for the long, thin "safe corridor" triangles this technique produces.
 */
export function pointInTriangle(p: Point, a: Point, b: Point, c: Point, pad = 0): boolean {
  if (pad > 0) {
    const cx = (a.x + b.x + c.x) / 3;
    const cy = (a.y + b.y + c.y) / 3;
    const grow = (q: Point): Point => {
      const vx = q.x - cx;
      const vy = q.y - cy;
      const len = Math.hypot(vx, vy) || 1;
      return { x: q.x + (vx / len) * pad, y: q.y + (vy / len) * pad };
    };
    a = grow(a);
    b = grow(b);
    c = grow(c);
  }

  const d1 = cross(p, a, b);
  const d2 = cross(p, b, c);
  const d3 = cross(p, c, a);
  const hasNeg = d1 < -EPS || d2 < -EPS || d3 < -EPS;
  const hasPos = d1 > EPS || d2 > EPS || d3 > EPS;
  return !(hasNeg && hasPos);
}

export function pointInTriangleShape(p: Point, t: Triangle, pad = 0): boolean {
  return pointInTriangle(p, t.cursor, t.top, t.bottom, pad);
}

/**
 * Slope test for a submenu opening to the right: if the slope to the top
 * corner falls and the slope to the bottom corner rises, the pointer is
 * heading into the cone.
 */
export function isHeadingTowardSubmenu(
  prev: Point,
  curr: Point,
  top: Point,
  bottom: Point,
): boolean {
  if (dist(prev, curr) < 1.25) return false;

  const slope = (from: Point, to: Point) => {
    const dx = to.x - from.x;
    if (Math.abs(dx) < EPS) return from.y >= to.y ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
    return (to.y - from.y) / dx;
  };

  const prevTop = slope(prev, top);
  const prevBot = slope(prev, bottom);
  const currTop = slope(curr, top);
  const currBot = slope(curr, bottom);

  return currTop < prevTop && currBot > prevBot;
}

/**
 * True while the pointer is still on the parent side of a right-opening
 * submenu. Past the leading edge the corridor has been crossed — a live
 * third vertex there would paint a reverse cone.
 */
export function onApproachSide(curr: Point, top: Point, bottom: Point, slack = 2): boolean {
  const edgeX = (top.x + bottom.x) / 2;
  return curr.x <= edgeX + slack;
}

/**
 * Combined intent test used by the menu:
 * 1. Current point sits inside the triangle formed by the *previous* sample
 *    and the submenu's leading-edge corners (the true "safe corridor").
 * 2. Fallback slope test — catches fast diagonal flicks that skip the triangle
 *    between sampled frames.
 * 3. Never true past the leading edge (that is the reverse cone).
 */
export function predictsIntent(
  prev: Point,
  curr: Point,
  top: Point,
  bottom: Point,
  pad = 6,
): boolean {
  if (!onApproachSide(curr, top, bottom)) return false;
  if (pointInTriangle(curr, prev, top, bottom, pad)) return true;
  return isHeadingTowardSubmenu(prev, curr, top, bottom);
}

export function pointInRect(
  p: Point,
  rect: { left: number; top: number; right: number; bottom: number },
  pad = 0,
): boolean {
  return (
    p.x >= rect.left - pad &&
    p.x <= rect.right + pad &&
    p.y >= rect.top - pad &&
    p.y <= rect.bottom + pad
  );
}
