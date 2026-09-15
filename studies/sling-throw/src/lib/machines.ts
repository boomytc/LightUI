/**
 * Off-track slingshot: pull away from a 1-D rail, land a ballistic intercept.
 */

export type Vec = { x: number; y: number };

export type DragMode = "slide" | "sling";

export type SlingKind = "sling" | "clamp";

/** Horizontal throw gain (1/s). */
export const H_POWER = 2.85;

/** Downward acceleration in CSS px / s². */
export const SLING_GRAVITY = 1800;

/** Leave 1-D sliding until the pointer is this far off the track. */
export const SLING_THRESHOLD = 14;

/** Soft cap on pull length so throws stay on-stage. */
export const MAX_PULL = 260;

export const FORK_HALF = 7;

/** Peak height above the track: base + gain * |pullY|. */
export const ARC_BASE = 42;
export const ARC_GAIN = 0.34;

export const FLIGHT_CAP = 0.7;

export const DEMO_MIN = 0;
export const DEMO_MAX = 100;
export const DEMO_STEP = 1;
export const DEMO_VALUE = 42;

export function add(a: Vec, b: Vec): Vec {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a: Vec, b: Vec): Vec {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(v: Vec, s: number): Vec {
  return { x: v.x * s, y: v.y * s };
}

export function hypot(v: Vec): number {
  const x = Number.isFinite(v?.x) ? v.x : 0;
  const y = Number.isFinite(v?.y) ? v.y : 0;
  return Math.hypot(x, y);
}

export function clamp(n: number, lo: number, hi: number): number {
  const x = Number.isFinite(n) ? n : lo;
  const a = Number.isFinite(lo) ? lo : 0;
  const b = Number.isFinite(hi) ? hi : a;
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  return Math.min(max, Math.max(min, x));
}

export function dragMode(offTrack: number, threshold = SLING_THRESHOLD): DragMode {
  const off = Number.isFinite(offTrack) ? Math.abs(offTrack) : 0;
  const t = Number.isFinite(threshold) && threshold > 0 ? threshold : SLING_THRESHOLD;
  return off < t ? "slide" : "sling";
}

/** Limit pull length with a soft extra stretch past MAX_PULL. */
export function limitPull(pull: Vec, maxLen = MAX_PULL): Vec {
  const cap = Number.isFinite(maxLen) && maxLen > 0 ? maxLen : MAX_PULL;
  const len = hypot(pull);
  if (len <= cap || len < 1e-6) return { x: Number.isFinite(pull?.x) ? pull.x : 0, y: Number.isFinite(pull?.y) ? pull.y : 0 };
  const extra = cap + (len - cap) * 0.32;
  return scale(pull, extra / len);
}

export function projectileAt(origin: Vec, vel: Vec, g: number, t: number): Vec {
  const ox = Number.isFinite(origin?.x) ? origin.x : 0;
  const oy = Number.isFinite(origin?.y) ? origin.y : 0;
  const vx = Number.isFinite(vel?.x) ? vel.x : 0;
  const vy = Number.isFinite(vel?.y) ? vel.y : 0;
  const grav = Number.isFinite(g) ? g : SLING_GRAVITY;
  const time = Number.isFinite(t) ? Math.max(0, t) : 0;
  return {
    x: ox + vx * time,
    y: oy + vy * time + 0.5 * grav * time * time,
  };
}

/** Positive times when the parabola crosses a horizontal line at `trackY`. */
export function interceptTimes(
  originY: number,
  velY: number,
  g: number,
  trackY: number,
): number[] {
  const oy = Number.isFinite(originY) ? originY : 0;
  const vy = Number.isFinite(velY) ? velY : 0;
  const grav = Number.isFinite(g) ? g : SLING_GRAVITY;
  const ty = Number.isFinite(trackY) ? trackY : 0;
  const a = 0.5 * grav;
  const b = vy;
  const c = oy - ty;
  if (Math.abs(a) < 1e-8) {
    if (Math.abs(b) < 1e-8) return [];
    const t = -c / b;
    return t > 0.012 ? [t] : [];
  }
  const disc = b * b - 4 * a * c;
  if (disc < 0) return [];
  const sqrt = Math.sqrt(disc);
  const t1 = (-b - sqrt) / (2 * a);
  const t2 = (-b + sqrt) / (2 * a);
  return [t1, t2].filter((t) => t > 0.012).sort((x, y) => x - y);
}

export type ThrowPrediction = {
  velocity: Vec;
  tFork: number;
  tHit: number;
  landing: Vec;
  rawLanding: Vec;
  samples: Vec[];
  forkA: Vec;
  forkB: Vec;
};

/**
 * Slingshot: pull away from the track, release to throw.
 * Vertical speed always returns to the track with a visible arc;
 * horizontal speed is opposite the pull.
 */
export function predictThrow(args: {
  origin: Vec;
  anchor: Vec;
  trackY: number;
  trackMinX: number;
  trackMaxX: number;
  gravity?: number;
}): ThrowPrediction | null {
  const g = Number.isFinite(args.gravity) ? args.gravity! : SLING_GRAVITY;
  const origin = {
    x: Number.isFinite(args.origin?.x) ? args.origin.x : 0,
    y: Number.isFinite(args.origin?.y) ? args.origin.y : 0,
  };
  const anchor = {
    x: Number.isFinite(args.anchor?.x) ? args.anchor.x : 0,
    y: Number.isFinite(args.anchor?.y) ? args.anchor.y : 0,
  };
  const trackY = Number.isFinite(args.trackY) ? args.trackY : 0;
  const trackMinX = Number.isFinite(args.trackMinX) ? args.trackMinX : 0;
  const trackMaxX = Number.isFinite(args.trackMaxX) ? args.trackMaxX : trackMinX;

  const pull = limitPull(sub(origin, anchor));
  const below = origin.y >= trackY;
  const dist = Math.abs(origin.y - trackY);
  const peak = ARC_BASE + dist * ARC_GAIN;

  const vx = -pull.x * H_POWER;
  const rise = below ? dist + peak : peak;
  const vy = (below ? -1 : 1) * Math.sqrt(Math.max(2 * g * rise, 1));
  const velocity = { x: vx, y: vy };

  const times = interceptTimes(origin.y, velocity.y, g, trackY);
  if (times.length === 0) return null;

  const tFork = below && times.length >= 2 ? times[0]! : Math.min(0.05, times[0]! * 0.4);
  const tHit = below && times.length >= 2 ? times[1]! : times[0]!;

  const rawLanding = projectileAt(origin, velocity, g, tHit);
  const landing = {
    x: clamp(rawLanding.x, trackMinX, trackMaxX),
    y: trackY,
  };

  const samples: Vec[] = [];
  const n = 18;
  for (let i = 0; i <= n; i++) {
    const t = tFork + (tHit - tFork) * (i / n);
    const p = projectileAt(origin, velocity, g, t);
    if (p.x < trackMinX - 12 || p.x > trackMaxX + 12) break;
    samples.push(p);
  }

  return {
    velocity,
    tFork,
    tHit,
    landing,
    rawLanding,
    samples,
    forkA: { x: anchor.x - FORK_HALF, y: trackY },
    forkB: { x: anchor.x + FORK_HALF, y: trackY },
  };
}

export function flightSpeed(tHit: number): number {
  const t = Number.isFinite(tHit) ? tHit : 0;
  return t > FLIGHT_CAP ? t / FLIGHT_CAP : 1;
}

export function valueFromX(
  x: number,
  trackMinX: number,
  trackMaxX: number,
  min: number,
  max: number,
): number {
  const w = Math.max(1, trackMaxX - trackMinX);
  const t = clamp((x - trackMinX) / w, 0, 1);
  return min + t * (max - min);
}

export function xFromValue(
  value: number,
  trackMinX: number,
  trackMaxX: number,
  min: number,
  max: number,
): number {
  const span = max - min;
  const t = clamp((value - min) / (span || 1), 0, 1);
  return trackMinX + t * (trackMaxX - trackMinX);
}

export function quantize(value: number, min: number, max: number, step: number): number {
  const lo = Number.isFinite(min) ? min : 0;
  const hi = Number.isFinite(max) ? max : lo;
  const v = Number.isFinite(value) ? value : lo;
  if (!Number.isFinite(step) || step <= 0) return clamp(v, lo, hi);
  const n = Math.round((v - lo) / step);
  return clamp(lo + n * step, lo, hi);
}

export function formatDemo(value: number): string {
  return `${Math.round(quantize(value, DEMO_MIN, DEMO_MAX, DEMO_STEP))}`;
}
