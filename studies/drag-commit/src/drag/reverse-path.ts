export type Point = { x: number; y: number };

export function animateReversePath(
  path: Point[],
  onFrame: (point: Point) => void,
  onDone: () => void,
  duration = 380,
): () => void {
  const pts = path.length >= 2 ? path.slice().reverse() : path;
  if (pts.length === 0) {
    onDone();
    return () => {};
  }
  if (pts.length === 1) {
    onFrame(pts[0]!);
    onDone();
    return () => {};
  }

  let raf = 0;
  let cancelled = false;
  const start = performance.now();

  const tick = (now: number) => {
    if (cancelled) return;
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - (1 - t) ** 3;
    const last = pts.length - 1;
    const idx = eased * last;
    const i = Math.max(0, Math.min(Math.floor(idx), last - 1));
    const f = idx - i;
    const a = pts[i];
    const b = pts[i + 1];
    if (!a || !b) {
      onDone();
      return;
    }
    onFrame({ x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f });
    if (t < 1) raf = requestAnimationFrame(tick);
    else onDone();
  };

  raf = requestAnimationFrame(tick);
  return () => {
    cancelled = true;
    cancelAnimationFrame(raf);
  };
}
