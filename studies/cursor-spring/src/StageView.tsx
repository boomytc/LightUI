import { useEffect, useRef } from "react";
import {
  createSpring,
  demoAt,
  integrateSpring,
  pruneTrail,
  pushSample,
  pushSpaced,
  PRESETS,
  type SpringConfig,
  type TrailPalette,
  type TrailPoint,
  type Vec2,
} from "./lib/machines";
import { readStageQuery } from "./lib/stage-query";
import "./cursor-spring.css";

const SPRING_SPACING = 7;
const SEED_DT = 1 / 60;

function sizeCanvas(canvas: HTMLCanvasElement): { w: number; h: number } {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.round(rect.width * dpr));
  const h = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  return { w: rect.width, h: rect.height };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h[0]! + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function withAlpha(color: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));
  if (color.startsWith("#")) {
    const { r, g, b } = hexToRgb(color);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  const match = color.match(/\d+(\.\d+)?/g);
  if (match && match.length >= 3) {
    return `rgba(${match[0]}, ${match[1]}, ${match[2]}, ${a})`;
  }
  return color;
}

function readTrailPalette(container: HTMLElement | null): { raw: TrailPalette; spring: TrailPalette } {
  const fallbackRaw = "#e11d48";
  const fallbackSpring = "#16a34a";
  if (!container || typeof window === "undefined") {
    return {
      raw: { fill: fallbackRaw, ring: fallbackRaw, ghost: fallbackRaw },
      spring: { fill: fallbackSpring, ring: fallbackSpring, ghost: fallbackSpring },
    };
  }
  const style = window.getComputedStyle(container);
  const rawColor = style.getPropertyValue("--color-wrong").trim() || fallbackRaw;
  const springColor = style.getPropertyValue("--color-intent").trim() || fallbackSpring;
  return {
    raw: { fill: rawColor, ring: rawColor, ghost: rawColor },
    spring: { fill: springColor, ring: springColor, ghost: springColor },
  };
}

function drawRawTrail(
  ctx: CanvasRenderingContext2D,
  trail: TrailPoint[],
  now: number,
  ttl: number,
  palette: TrailPalette,
  head: Vec2 | null,
): void {
  for (const p of trail) {
    const a = Math.max(0, 1 - (now - p.t) / ttl);
    if (a <= 0) continue;
    ctx.beginPath();
    ctx.fillStyle = withAlpha(palette.fill, 0.18 + a * 0.72);
    ctx.arc(p.x, p.y, 4.2 + a * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  if (!head) return;
  ctx.beginPath();
  ctx.strokeStyle = withAlpha(palette.ring, 0.45);
  ctx.lineWidth = 1.5;
  ctx.arc(head.x, head.y, 16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.fillStyle = palette.fill;
  ctx.arc(head.x, head.y, 5.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawSpringTrail(
  ctx: CanvasRenderingContext2D,
  trail: TrailPoint[],
  now: number,
  ttl: number,
  palette: TrailPalette,
  head: Vec2 | null,
  target: Vec2 | null,
): void {
  for (const p of trail) {
    const a = Math.max(0, 1 - (now - p.t) / ttl);
    if (a <= 0) continue;
    ctx.beginPath();
    ctx.strokeStyle = withAlpha(palette.fill, 0.2 + a * 0.75);
    ctx.lineWidth = 1.4;
    ctx.arc(p.x, p.y, 3.6, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (target) {
    ctx.beginPath();
    ctx.strokeStyle = withAlpha(palette.ghost, 0.35);
    ctx.lineWidth = 1.5;
    ctx.arc(target.x, target.y, 18, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (!head) return;
  ctx.beginPath();
  ctx.strokeStyle = withAlpha(palette.ring, 0.5);
  ctx.lineWidth = 1.6;
  ctx.arc(head.x, head.y, 14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.fillStyle = palette.fill;
  ctx.arc(head.x, head.y, 4.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  ctx.arc(head.x, head.y, 4.6, 0, Math.PI * 2);
  ctx.stroke();
}

export function StageView() {
  const query = readStageQuery();
  const matchedPreset = PRESETS.find((p) => p.id === query.preset) ?? PRESETS[1]!;

  const labRef = useRef<HTMLDivElement>(null);
  const localPlotRef = useRef<HTMLDivElement>(null);
  const rawPlotRef = useRef<HTMLDivElement>(null);
  const springPlotRef = useRef<HTMLDivElement>(null);
  const rawCanvasRef = useRef<HTMLCanvasElement>(null);
  const springCanvasRef = useRef<HTMLCanvasElement>(null);
  const localCursorRef = useRef<HTMLDivElement>(null);
  const rawLabelRef = useRef<HTMLDivElement>(null);
  const springLabelRef = useRef<HTMLDivElement>(null);

  const pointerRef = useRef<Vec2>({ x: 0.5, y: 0.5 });
  const sampleRef = useRef<Vec2>({ x: 0.5, y: 0.5 });
  const springRef = useRef(createSpring(0.5, 0.5));
  const rawTrail = useRef<TrailPoint[]>([]);
  const springTrail = useRef<TrailPoint[]>([]);

  useEffect(() => {
    const rawCanvas = rawCanvasRef.current;
    const springCanvas = springCanvasRef.current;
    if (!rawCanvas || !springCanvas) return;

    let lastDark = document.documentElement.classList.contains("dark");
    let { raw: rawPal, spring: springPal } = readTrailPalette(labRef.current);

    const cfg: SpringConfig = {
      stiffness: matchedPreset.stiffness,
      damping: matchedPreset.damping,
      mass: matchedPreset.mass,
    };
    const sampleHz = query.sampleHz;
    const trailMs = 1400;

    const now = performance.now();
    const demoStart = now - trailMs;

    // Seed historical trajectory
    let sample = demoAt(0);
    let spring = createSpring(sample.x, sample.y);
    let lastSample = demoStart;

    const initialRawSize = sizeCanvas(rawCanvas);
    const initialSpringSize = sizeCanvas(springCanvas);

    for (let t = demoStart; t <= now; t += SEED_DT * 1000) {
      const p = demoAt((t - demoStart) / 1000);
      if (t - lastSample >= 1000 / sampleHz) {
        sample = p;
        lastSample = t;
        pushSample(rawTrail.current, sample.x * initialRawSize.w, sample.y * initialRawSize.h, t);
      }
      spring = integrateSpring(spring, sample, SEED_DT, cfg);
      pushSpaced(springTrail.current, spring.x * initialSpringSize.w, spring.y * initialSpringSize.h, t, SPRING_SPACING);
    }

    pointerRef.current = demoAt((now - demoStart) / 1000);
    sampleRef.current = sample;
    springRef.current = spring;

    const paint = (
      currentNow: number,
      rawSize: { w: number; h: number },
      springSize: { w: number; h: number },
    ) => {
      pruneTrail(rawTrail.current, currentNow, trailMs);
      pruneTrail(springTrail.current, currentNow, trailMs);

      const rawCtx = rawCanvas.getContext("2d");
      const springCtx = springCanvas.getContext("2d");

      if (rawCtx) {
        rawCtx.clearRect(0, 0, rawSize.w, rawSize.h);
        if (query.overlay) {
          const rawHead = { x: sampleRef.current.x * rawSize.w, y: sampleRef.current.y * rawSize.h };
          drawRawTrail(rawCtx, rawTrail.current, currentNow, trailMs, rawPal, rawHead);
        }
      }

      if (springCtx) {
        springCtx.clearRect(0, 0, springSize.w, springSize.h);
        if (query.overlay) {
          const springHead = { x: springRef.current.x * springSize.w, y: springRef.current.y * springSize.h };
          const springTarget = { x: sampleRef.current.x * springSize.w, y: sampleRef.current.y * springSize.h };
          drawSpringTrail(springCtx, springTrail.current, currentNow, trailMs, springPal, springHead, springTarget);
        }
      }

      const localPlot = localPlotRef.current;
      if (localPlot && localCursorRef.current) {
        const x = pointerRef.current.x * localPlot.clientWidth;
        const y = pointerRef.current.y * localPlot.clientHeight;
        localCursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        localCursorRef.current.style.opacity = "1";
      }

      if (rawLabelRef.current) {
        const x = sampleRef.current.x * rawSize.w;
        const y = sampleRef.current.y * rawSize.h;
        rawLabelRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        rawLabelRef.current.style.opacity = "1";
      }

      if (springLabelRef.current) {
        const x = springRef.current.x * springSize.w;
        const y = springRef.current.y * springSize.h;
        springLabelRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        springLabelRef.current.style.opacity = "1";
      }
    };

    // Paint initial synchronous state so StageView never renders blank
    paint(now, initialRawSize, initialSpringSize);

    let lastFrame = performance.now();
    let raf = 0;

    const tick = (currentNow: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, Math.max(0, (currentNow - lastFrame) / 1000));
      lastFrame = currentNow;

      const isDark = document.documentElement.classList.contains("dark");
      if (isDark !== lastDark) {
        lastDark = isDark;
        const nextPal = readTrailPalette(labRef.current);
        rawPal = nextPal.raw;
        springPal = nextPal.spring;
      }

      const rawSize = sizeCanvas(rawCanvas);
      const springSize = sizeCanvas(springCanvas);

      pointerRef.current = demoAt((currentNow - demoStart) / 1000);

      const interval = 1000 / sampleHz;
      if (currentNow - lastSample >= interval) {
        lastSample = currentNow;
        sampleRef.current = { ...pointerRef.current };
        pushSample(rawTrail.current, sampleRef.current.x * rawSize.w, sampleRef.current.y * rawSize.h, currentNow);
      }

      springRef.current = integrateSpring(springRef.current, sampleRef.current, dt, cfg);
      pushSpaced(
        springTrail.current,
        springRef.current.x * springSize.w,
        springRef.current.y * springSize.h,
        currentNow,
        SPRING_SPACING,
      );

      paint(currentNow, rawSize, springSize);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [matchedPreset, query.sampleHz, query.overlay]);

  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg px-4 py-8 md:px-8">
      <div
        data-stage="fixture"
        ref={labRef}
        className="relative flex min-h-[460px] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card select-none"
      >
        <section className="border-b border-border">
          <header className="flex h-10 items-center justify-between border-b border-border/50 bg-surface-2 px-4">
            <span className="text-xs font-medium text-fg">你的光标 (真指针 60–120Hz)</span>
            <span className="font-mono text-[11px] text-fg-subtle">Local Pointer</span>
          </header>
          <div className="relative h-32 md:h-36">
            <div ref={localPlotRef} className="relative size-full touch-none">
              <div ref={localCursorRef} className="absolute top-0 left-0 opacity-0 will-change-transform">
                <svg width="18" height="24" viewBox="0 0 18 24" className="pointer-events-none text-fg" aria-hidden="true">
                  <path
                    d="M1.2 1.2 L1.2 20.4 L6.1 15.6 L10.4 23.2 L13.8 21.5 L9.4 13.8 L16.8 13.8 Z"
                    fill="currentColor"
                    stroke="#ffffff"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <header className="flex h-10 items-center justify-between border-b border-border/50 bg-surface-2 px-4">
            <span className="text-xs font-medium text-fg">无平滑 (瞬移采样 {query.sampleHz}Hz)</span>
            <span className="font-mono text-[11px] text-wrong">Discrete Jumps</span>
          </header>
          <div className="relative h-32 md:h-36">
            <div ref={rawPlotRef} className="relative size-full touch-none">
              <canvas ref={rawCanvasRef} className="absolute inset-0 size-full" />
              <div ref={rawLabelRef} className="absolute top-0 left-0 opacity-0 will-change-transform">
                <div className="pointer-events-none flex items-start gap-1">
                  <svg width="12" height="12" viewBox="0 0 12 12" className="mt-px shrink-0 text-wrong" aria-hidden="true">
                    <path d="M0 0 L12 4.2 L4.6 12 Z" fill="currentColor" />
                  </svg>
                  <span className="rounded-md bg-wrong px-2 py-0.5 text-[11px] font-medium text-white shadow-sm">
                    协作者 (瞬移)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <header className="flex h-10 items-center justify-between border-b border-border/50 bg-surface-2 px-4">
            <span className="text-xs font-medium text-fg">弹簧平滑 ({matchedPreset.label} · 物理积分重建)</span>
            <span className="font-mono text-[11px] text-intent">Spring Smoothed</span>
          </header>
          <div className="relative h-32 md:h-36">
            <div ref={springPlotRef} className="relative size-full touch-none">
              <canvas ref={springCanvasRef} className="absolute inset-0 size-full" />
              <div ref={springLabelRef} className="absolute top-0 left-0 opacity-0 will-change-transform">
                <div className="pointer-events-none flex items-start gap-1">
                  <svg width="12" height="12" viewBox="0 0 12 12" className="mt-px shrink-0 text-intent" aria-hidden="true">
                    <path d="M0 0 L12 4.2 L4.6 12 Z" fill="currentColor" />
                  </svg>
                  <span className="rounded-md bg-intent px-2 py-0.5 text-[11px] font-medium text-white shadow-sm">
                    协作者 (弹簧)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
