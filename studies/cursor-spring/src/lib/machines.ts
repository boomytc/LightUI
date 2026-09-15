/**
 * 2D Spring physics and trajectory mathematics for presence cursor tracking.
 */

export type Vec2 = { x: number; y: number };

export type SpringState = Vec2 & { vx: number; vy: number };

export type SpringConfig = {
  stiffness: number;
  damping: number;
  mass: number;
};

export type TrailPoint = { x: number; y: number; t: number };

export type TrailPalette = {
  fill: string;
  ring: string;
  ghost: string;
};

export type LabPresetId = "follow" | "soft" | "jelly" | "heavy";

export type LabPreset = SpringConfig & {
  id: LabPresetId;
  label: string;
  hint: string;
};

/** Critical damping value: 2 * sqrt(k * m) */
export function criticalDamping(stiffness: number, mass: number): number {
  const k = Math.max(0, Number.isFinite(stiffness) ? stiffness : 0);
  const m = Math.max(0.0001, Number.isFinite(mass) ? mass : 0.0001);
  return 2 * Math.sqrt(k * m);
}

/** Damping ratio: zeta = damping / criticalDamping */
export function dampingRatio(cfg: SpringConfig): number {
  const crit = criticalDamping(cfg.stiffness, cfg.mass);
  if (crit <= 0) return 0;
  const c = Math.max(0, Number.isFinite(cfg.damping) ? cfg.damping : 0);
  return c / crit;
}

export function zetaLabel(zeta: number): string {
  if (!Number.isFinite(zeta) || zeta <= 0) return "无阻尼";
  if (zeta < 0.9) return "欠阻尼 · 有过冲";
  if (zeta <= 1.1) return "临界阻尼 · 最速贴合";
  return "过阻尼 · 迟滞";
}

export const MAX_DT = 0.048; // Max frame delta (48ms) to prevent teleportation explosions
export const SUBSTEP = 0.008; // 8ms sub-step for numerical stability
export const SETTLE_POS2 = 1e-6; // (0.001 normalized units)^2 ≈ (0.8px on 800px panel)^2 deadband
export const SETTLE_VEL2 = 1e-4; // (0.01 normalized units/s)^2 deadband

export function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return Math.max(lo, Math.min(hi, n));
}

export function hypot2(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

/**
 * Single sub-step of semi-implicit Euler integration:
 * a = (-k * (x - target) - c * v) / m
 * v += a * dt
 * x += v * dt
 */
export function stepSpring(
  state: SpringState,
  target: Vec2,
  h: number,
  cfg: SpringConfig,
): SpringState {
  if (!Number.isFinite(target?.x) || !Number.isFinite(target?.y)) return state;
  const sx = Number.isFinite(state?.x) ? state.x : target.x;
  const sy = Number.isFinite(state?.y) ? state.y : target.y;
  const svx = Number.isFinite(state?.vx) ? state.vx : 0;
  const svy = Number.isFinite(state?.vy) ? state.vy : 0;

  const m = Math.max(Number.isFinite(cfg?.mass) ? cfg.mass : 1, 0.05);
  const k = Math.max(Number.isFinite(cfg?.stiffness) ? cfg.stiffness : 100, 1);
  const c = Math.max(Number.isFinite(cfg?.damping) ? cfg.damping : 10, 0);

  const ax = (-k * (sx - target.x) - c * svx) / m;
  const ay = (-k * (sy - target.y) - c * svy) / m;

  const vx = svx + ax * h;
  const vy = svy + ay * h;

  return {
    x: sx + vx * h,
    y: sy + vy * h,
    vx,
    vy,
  };
}

/**
 * Semi-implicit Euler spring integrator with variable sub-stepping and deadband settle.
 */
export function integrateSpring(
  state: SpringState,
  target: Vec2,
  dt: number,
  cfg: SpringConfig,
): SpringState {
  if (!Number.isFinite(target?.x) || !Number.isFinite(target?.y)) return state;
  const validDt = Number.isFinite(dt) ? dt : 0;
  const clamped = Math.min(Math.max(validDt, 0), MAX_DT);
  if (clamped <= 0) return state;

  const steps = Math.max(1, Math.ceil(clamped / SUBSTEP));
  const h = clamped / steps;

  let next = state;
  for (let i = 0; i < steps; i++) {
    next = stepSpring(next, target, h, cfg);
  }

  const dx = next.x - target.x;
  const dy = next.y - target.y;
  const v2 = next.vx * next.vx + next.vy * next.vy;

  if (dx * dx + dy * dy < SETTLE_POS2 && v2 < SETTLE_VEL2) {
    return { x: target.x, y: target.y, vx: 0, vy: 0 };
  }

  return next;
}

export function createSpring(x = 0, y = 0): SpringState {
  return { x, y, vx: 0, vy: 0 };
}

/**
 * Remove points older than TTL, cap maximum trail point count.
 */
export function pruneTrail(trail: TrailPoint[], now: number, ttl: number): TrailPoint[] {
  const safeNow = Number.isFinite(now) ? now : performance.now();
  const safeTtl = Number.isFinite(ttl) && ttl > 0 ? ttl : 1400;
  const cutoff = safeNow - safeTtl;
  let i = 0;
  while (i < trail.length && trail[i]!.t < cutoff) {
    i++;
  }
  if (i > 0) {
    trail.splice(0, i);
  }
  const MAX_TRAIL = 480;
  if (trail.length > MAX_TRAIL) {
    trail.splice(0, trail.length - MAX_TRAIL);
  }
  return trail;
}

/**
 * Drop beads along a segment so high-speed frames do not create broken sparse gaps.
 */
export function pushSpaced(
  trail: TrailPoint[],
  x: number,
  y: number,
  now: number,
  spacing: number,
): void {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;
  const safeSpacing = Number.isFinite(spacing) && spacing > 0 ? spacing : 7;
  const safeNow = Number.isFinite(now) ? now : performance.now();
  const last = trail[trail.length - 1];
  if (!last) {
    trail.push({ x, y, t: safeNow });
    return;
  }
  const dx = x - last.x;
  const dy = y - last.y;
  const dist = Math.hypot(dx, dy);
  if (dist < safeSpacing) return;

  const n = Math.max(1, Math.min(60, Math.round(dist / safeSpacing)));
  for (let i = 1; i <= n; i++) {
    const k = i / n;
    trail.push({ x: last.x + dx * k, y: last.y + dy * k, t: safeNow });
  }
}

/**
 * Record a raw sample point, deduplicating sub-pixel micro-movements.
 */
export function pushSample(trail: TrailPoint[], x: number, y: number, now: number): void {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;
  const safeNow = Number.isFinite(now) ? now : performance.now();
  const last = trail[trail.length - 1];
  if (last && Math.hypot(x - last.x, y - last.y) < 0.4) return;
  trail.push({ x, y, t: safeNow });
}

export const DEMO_PERIOD = 8.4;

/**
 * A looping human-like hand-drawn trajectory in normalized [0, 1] unit space.
 * Stacks harmonic frequencies so it looks like an organic collaborator mouse.
 */
export function demoAt(seconds: number): Vec2 {
  const t = Number.isFinite(seconds) ? seconds : 0;
  const x =
    0.5 +
    0.33 * Math.sin(t * 1.18) +
    0.11 * Math.sin(t * 2.55 + 0.7) +
    0.045 * Math.sin(t * 5.2 + 1.4) +
    0.02 * Math.sin(t * 9.1);

  const y =
    0.52 +
    0.26 * Math.sin(t * 0.82 + 1.05) +
    0.13 * Math.sin(t * 1.95 + 0.35) +
    0.055 * Math.cos(t * 3.6 + 0.8) +
    0.025 * Math.sin(t * 7.4 + 2.1);

  return {
    x: clamp(x, 0.08, 0.92),
    y: clamp(y, 0.16, 0.86),
  };
}

export const PRESETS: LabPreset[] = [
  {
    id: "follow",
    label: "跟手",
    hint: "接近临界阻尼，响应极快，几乎无过冲",
    stiffness: 280,
    damping: criticalDamping(280, 1) * 0.92,
    mass: 1,
  },
  {
    id: "soft",
    label: "软弹",
    hint: "主流协作工具标配：柔和惯性与自然微过冲",
    stiffness: 150,
    damping: 16,
    mass: 1,
  },
  {
    id: "jelly",
    label: "果冻",
    hint: "欠阻尼，大幅度甩尾与弹性回弹",
    stiffness: 110,
    damping: 8,
    mass: 1.15,
  },
  {
    id: "heavy",
    label: "迟滞",
    hint: "大质量高阻尼，厚重追随感",
    stiffness: 70,
    damping: 18,
    mass: 1.5,
  },
];

export const DEFAULT_PRESET: LabPreset = PRESETS[1]!;
