export type SnapPoint = "peek" | "half" | "full";

export type SnapHeights = Record<SnapPoint, number>;

export const DEFAULT_SNAP_HEIGHTS: SnapHeights = {
  peek: 118,
  half: 260,
  full: 460,
};

export const DEFAULT_DAMPING = 0.2;
export const DEFAULT_VELOCITY_THRESHOLD = 0.45; // px / ms

export function clampHeight(
  rawHeight: number,
  minSnap: number = DEFAULT_SNAP_HEIGHTS.peek,
  maxSnap: number = DEFAULT_SNAP_HEIGHTS.full,
  damping: number = DEFAULT_DAMPING,
): number {
  if (rawHeight < minSnap) {
    const under = minSnap - rawHeight;
    return Math.round(minSnap - under * damping);
  }
  if (rawHeight > maxSnap) {
    const over = rawHeight - maxSnap;
    return Math.round(maxSnap + over * damping);
  }
  return Math.round(rawHeight);
}

export type SnapReleaseVerdict = {
  targetSnap: SnapPoint;
  targetHeight: number;
  reason: "velocity_up" | "velocity_down" | "nearest";
};

export function resolveSnapRelease(
  currentHeight: number,
  velocityY: number,
  snaps: SnapHeights = DEFAULT_SNAP_HEIGHTS,
  velocityThreshold: number = DEFAULT_VELOCITY_THRESHOLD,
): SnapReleaseVerdict {
  // Velocity-driven threshold detection
  // In screen coordinate space: vy < 0 is upward movement (expanding), vy > 0 is downward movement (collapsing).
  if (velocityY < -velocityThreshold) {
    // Flick up: advance to next higher level
    if (currentHeight < snaps.half) {
      return { targetSnap: "half", targetHeight: snaps.half, reason: "velocity_up" };
    }
    return { targetSnap: "full", targetHeight: snaps.full, reason: "velocity_up" };
  }

  if (velocityY > velocityThreshold) {
    // Flick down: advance to next lower level
    if (currentHeight > snaps.half) {
      return { targetSnap: "half", targetHeight: snaps.half, reason: "velocity_down" };
    }
    return { targetSnap: "peek", targetHeight: snaps.peek, reason: "velocity_down" };
  }

  // Low velocity: snap to closest point by distance
  const entries: [SnapPoint, number][] = [
    ["peek", snaps.peek],
    ["half", snaps.half],
    ["full", snaps.full],
  ];

  let nearestSnap: SnapPoint = "peek";
  let minDiff = Infinity;

  for (const [snap, height] of entries) {
    const diff = Math.abs(currentHeight - height);
    if (diff < minDiff) {
      minDiff = diff;
      nearestSnap = snap;
    }
  }

  return {
    targetSnap: nearestSnap,
    targetHeight: snaps[nearestSnap],
    reason: "nearest",
  };
}

export type PointerSample = {
  t: number; // timestamp in ms
  y: number; // clientY in px
};

export function computeVelocity(
  samples: PointerSample[],
  now?: number,
  maxAgeMs: number = 100,
): number {
  if (samples.length < 2) return 0;
  const refTime = Math.max(now ?? 0, samples[samples.length - 1].t);
  const lastSample = samples[samples.length - 1];
  if (refTime - lastSample.t > maxAgeMs) {
    return 0;
  }
  const recent = samples.filter((s) => refTime - s.t <= maxAgeMs);
  if (recent.length < 2) {
    return 0;
  }
  const first = recent[0];
  const last = recent[recent.length - 1];
  const dt = last.t - first.t;
  if (dt <= 0) return 0;
  return (last.y - first.y) / dt; // px / ms
}

export function canScrollContent(snap: SnapPoint, isDragging: boolean): boolean {
  return snap === "full" && !isDragging;
}

export function shouldHandoffToDrawer(
  startScrollTop: number,
  currentScrollTop: number,
  dy: number,
): boolean {
  return (
    (startScrollTop <= 0 || currentScrollTop <= 0 || dy > startScrollTop) &&
    dy > Math.max(0, startScrollTop)
  );
}

