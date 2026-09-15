import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Trash2, Eye, EyeOff, Activity, Sliders, Info, Sparkles } from "lucide-react";
import {
  createSpring,
  dampingRatio,
  demoAt,
  integrateSpring,
  pruneTrail,
  pushSample,
  pushSpaced,
  zetaLabel,
  PRESETS,
  DEFAULT_PRESET,
  type LabPresetId,
  type SpringConfig,
  type TrailPalette,
  type TrailPoint,
  type Vec2,
} from "./lib/machines";
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

export type LabSettings = SpringConfig & {
  sampleHz: number;
  trailMs: number;
  name: string;
  presetId: LabPresetId | "custom";
};

export function StudyView() {
  const labRef = useRef<HTMLDivElement>(null);
  const localPlotRef = useRef<HTMLDivElement>(null);
  const rawPlotRef = useRef<HTMLDivElement>(null);
  const springPlotRef = useRef<HTMLDivElement>(null);
  const rawCanvasRef = useRef<HTMLCanvasElement>(null);
  const springCanvasRef = useRef<HTMLCanvasElement>(null);
  const localCursorRef = useRef<HTMLDivElement>(null);
  const rawLabelRef = useRef<HTMLDivElement>(null);
  const springLabelRef = useRef<HTMLDivElement>(null);
  const activePlotRef = useRef<HTMLElement | null>(null);

  const pointerRef = useRef<Vec2>({ x: 0.5, y: 0.5 });
  const sampleRef = useRef<Vec2>({ x: 0.5, y: 0.5 });
  const springRef = useRef(createSpring(0.5, 0.5));
  const lastSampleAt = useRef(0);
  const lastFrameAt = useRef(0);
  const demoStart = useRef(0);
  const drivingRef = useRef<"demo" | "user">("demo");
  const rawTrail = useRef<TrailPoint[]>([]);
  const springTrail = useRef<TrailPoint[]>([]);
  const overlayRef = useRef(true);
  const lagRef = useRef(0);
  const rafRef = useRef(0);
  const seedRef = useRef<() => void>(() => {});

  const [showOverlays, setShowOverlays] = useState(true);
  const [driving, setDriving] = useState<"demo" | "user">("demo");
  const [lagPx, setLagPx] = useState(0);
  const [settings, setSettings] = useState<LabSettings>({
    stiffness: DEFAULT_PRESET.stiffness,
    damping: DEFAULT_PRESET.damping,
    mass: DEFAULT_PRESET.mass,
    sampleHz: 16,
    trailMs: 1400,
    name: "协作者",
    presetId: DEFAULT_PRESET.id,
  });

  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  overlayRef.current = showOverlays;

  const patchSettings = useCallback((patch: Partial<LabSettings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const replay = useCallback(() => {
    drivingRef.current = "demo";
    setDriving("demo");
    seedRef.current();
  }, []);

  const clear = useCallback(() => {
    rawTrail.current = [];
    springTrail.current = [];
  }, []);

  useEffect(() => {
    const lab = labRef.current;
    if (!lab) return;

    let lastDark = document.documentElement.classList.contains("dark");
    let { raw: rawPal, spring: springPal } = readTrailPalette(lab);

    const plots = () =>
      [localPlotRef.current, rawPlotRef.current, springPlotRef.current].filter(
        (p): p is HTMLDivElement => p !== null,
      );

    const plotFromEvent = (e: PointerEvent): HTMLElement | null => {
      if (activePlotRef.current) return activePlotRef.current;
      for (const plot of plots()) {
        const r = plot.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
          return plot;
        }
      }
      return null;
    };

    const normFromEvent = (e: PointerEvent, plot: HTMLElement): Vec2 => {
      const r = plot.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - r.left) / Math.max(r.width, 1)));
      const y = Math.max(0, Math.min(1, (e.clientY - r.top) / Math.max(r.height, 1)));
      return { x, y };
    };

    const takeOver = (e: PointerEvent) => {
      const plot = plotFromEvent(e);
      if (!plot) return;
      pointerRef.current = normFromEvent(e, plot);
      if (drivingRef.current !== "user") {
        drivingRef.current = "user";
        setDriving("user");
        lastSampleAt.current = performance.now();
        sampleRef.current = { ...pointerRef.current };
      }
    };

    const onDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("button, input, label")) return;
      e.preventDefault();
      const plot = plotFromEvent(e);
      activePlotRef.current = plot;
      try {
        lab.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      takeOver(e);
    };

    const onMove = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("button, input, label")) return;
      const plot = plotFromEvent(e);
      if (!plot) return;
      takeOver(e);
    };

    const onUp = (e: PointerEvent) => {
      activePlotRef.current = null;
      try {
        lab.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    lab.addEventListener("pointerdown", onDown);
    lab.addEventListener("pointermove", onMove);
    lab.addEventListener("pointerup", onUp);
    lab.addEventListener("pointercancel", onUp);

    const paint = (
      now: number,
      rawSize?: { w: number; h: number },
      springSize?: { w: number; h: number },
    ) => {
      const cfg = settingsRef.current;
      const rawCanvas = rawCanvasRef.current;
      const springCanvas = springCanvasRef.current;
      if (!cfg || !rawCanvas || !springCanvas) return;

      const currentRawSize = rawSize ?? sizeCanvas(rawCanvas);
      const currentSpringSize = springSize ?? sizeCanvas(springCanvas);
      if (currentRawSize.w < 8 || currentSpringSize.w < 8) return;

      const rawHead = { x: sampleRef.current.x * currentRawSize.w, y: sampleRef.current.y * currentRawSize.h };
      const springHead = { x: springRef.current.x * currentSpringSize.w, y: springRef.current.y * currentSpringSize.h };
      const springTarget = { x: sampleRef.current.x * currentSpringSize.w, y: sampleRef.current.y * currentSpringSize.h };

      pruneTrail(rawTrail.current, now, cfg.trailMs);
      pruneTrail(springTrail.current, now, cfg.trailMs);

      const rawCtx = rawCanvas.getContext("2d");
      const springCtx = springCanvas.getContext("2d");

      if (rawCtx) {
        rawCtx.clearRect(0, 0, currentRawSize.w, currentRawSize.h);
        if (overlayRef.current) {
          drawRawTrail(rawCtx, rawTrail.current, now, cfg.trailMs, rawPal, rawHead);
        }
      }

      if (springCtx) {
        springCtx.clearRect(0, 0, currentSpringSize.w, currentSpringSize.h);
        if (overlayRef.current) {
          drawSpringTrail(
            springCtx,
            springTrail.current,
            now,
            cfg.trailMs,
            springPal,
            springHead,
            springTarget,
          );
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
        rawLabelRef.current.style.transform = `translate3d(${rawHead.x}px, ${rawHead.y}px, 0)`;
        rawLabelRef.current.style.opacity = "1";
      }

      if (springLabelRef.current) {
        springLabelRef.current.style.transform = `translate3d(${springHead.x}px, ${springHead.y}px, 0)`;
        springLabelRef.current.style.opacity = "1";
      }

      const dx = (springRef.current.x - sampleRef.current.x) * currentSpringSize.w;
      const dy = (springRef.current.y - sampleRef.current.y) * currentSpringSize.h;
      lagRef.current = Math.hypot(dx, dy);
    };

    const seed = () => {
      const cfg = settingsRef.current;
      if (!cfg) return;
      const now = performance.now();
      demoStart.current = now - cfg.trailMs;
      rawTrail.current = [];
      springTrail.current = [];

      let sample = demoAt(0);
      let spring = createSpring(sample.x, sample.y);
      let lastSample = demoStart.current;

      for (let t = demoStart.current; t <= now; t += SEED_DT * 1000) {
        const p = demoAt((t - demoStart.current) / 1000);
        if (t - lastSample >= 1000 / Math.max(cfg.sampleHz, 1)) {
          sample = p;
          lastSample = t;
          const rawCanvas = rawCanvasRef.current;
          if (rawCanvas) {
            const { w, h } = sizeCanvas(rawCanvas);
            pushSample(rawTrail.current, sample.x * w, sample.y * h, t);
          }
        }
        spring = integrateSpring(spring, sample, SEED_DT, cfg);
        const springCanvas = springCanvasRef.current;
        if (springCanvas) {
          const { w, h } = sizeCanvas(springCanvas);
          pushSpaced(springTrail.current, spring.x * w, spring.y * h, t, SPRING_SPACING);
        }
      }

      pointerRef.current = demoAt((now - demoStart.current) / 1000);
      sampleRef.current = sample;
      springRef.current = spring;
      lastSampleAt.current = lastSample;
      lastFrameAt.current = now;
      paint(now);
    };

    seedRef.current = seed;

    const ro = new ResizeObserver(() => {
      if (rawCanvasRef.current) sizeCanvas(rawCanvasRef.current);
      if (springCanvasRef.current) sizeCanvas(springCanvasRef.current);
      paint(performance.now());
    });
    if (rawCanvasRef.current) ro.observe(rawCanvasRef.current);
    if (springCanvasRef.current) ro.observe(springCanvasRef.current);

    seed();

    const tick = (now: number) => {
      rafRef.current = requestAnimationFrame(tick);
      const cfg = settingsRef.current;
      if (!cfg) return;

      const rawCanvas = rawCanvasRef.current;
      const springCanvas = springCanvasRef.current;
      if (!rawCanvas || !springCanvas) return;

      const isDark = document.documentElement.classList.contains("dark");
      if (isDark !== lastDark) {
        lastDark = isDark;
        const nextPal = readTrailPalette(lab);
        rawPal = nextPal.raw;
        springPal = nextPal.spring;
      }

      const rawSize = sizeCanvas(rawCanvas);
      const springSize = sizeCanvas(springCanvas);

      const dt = Math.min(0.05, Math.max(0, (now - lastFrameAt.current) / 1000));
      lastFrameAt.current = now;

      if (drivingRef.current === "demo") {
        pointerRef.current = demoAt((now - demoStart.current) / 1000);
      }

      const interval = 1000 / Math.max(cfg.sampleHz, 1);
      if (now - lastSampleAt.current >= interval) {
        lastSampleAt.current = now;
        sampleRef.current = { ...pointerRef.current };
        pushSample(rawTrail.current, sampleRef.current.x * rawSize.w, sampleRef.current.y * rawSize.h, now);
      }

      springRef.current = integrateSpring(springRef.current, sampleRef.current, dt, cfg);
      pushSpaced(
        springTrail.current,
        springRef.current.x * springSize.w,
        springRef.current.y * springSize.h,
        now,
        SPRING_SPACING,
      );

      paint(now, rawSize, springSize);
    };

    rafRef.current = requestAnimationFrame(tick);

    const hudInterval = window.setInterval(() => {
      const next = lagRef.current;
      setLagPx((prev) => (Math.abs(prev - next) < 0.5 ? prev : next));
    }, 120);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.clearInterval(hudInterval);
      ro.disconnect();
      lab.removeEventListener("pointerdown", onDown);
      lab.removeEventListener("pointermove", onMove);
      lab.removeEventListener("pointerup", onUp);
      lab.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const zeta = dampingRatio(settings);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 md:px-6">
      {/* Header section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-accent uppercase">
          <Sparkles className="size-3.5" />
          <span>Presence Cursor Reconstruction</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-fg md:text-3xl">
          多人协作光标：稀疏网络采样的弹簧物理重建
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-fg-muted">
          网络只能以 8–20Hz 丢出稀疏采样包。三栏实时对照展示：本地真实高刷光标、无平滑瞬移跳变，以及通过二阶弹簧半隐式欧拉积分实时重建出的自然平滑跟手轨迹。
        </p>
      </div>

      {/* Synchronous Comparison Canvas Stage */}
      <div
        ref={labRef}
        className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-card select-none"
      >
        {/* Panel 1: Local pointer */}
        <section className="border-b border-border">
          <header className="flex h-11 items-center justify-between border-b border-border/50 bg-surface-2 px-4">
            <div className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-fg" />
              <span className="text-xs font-semibold text-fg">本地真实指针 (Local Pointer)</span>
              <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] text-fg-subtle">60–120Hz 连续</span>
            </div>
            <button
              type="button"
              onClick={() => setShowOverlays((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-fg shadow-xs transition hover:bg-surface-2 active:scale-95"
            >
              {showOverlays ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              <span>{showOverlays ? "隐藏轨迹" : "显示轨迹"}</span>
            </button>
          </header>
          <div className="relative h-36 md:h-44">
            <div ref={localPlotRef} className="relative size-full touch-none cursor-none">
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

        {/* Panel 2: Raw packets (teleportation) */}
        <section className="border-b border-border">
          <header className="flex h-11 items-center justify-between border-b border-border/50 bg-surface-2 px-4">
            <div className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-wrong" />
              <span className="text-xs font-semibold text-fg">无平滑瞬移 (Without Smoothing)</span>
              <span className="rounded bg-wrong-soft px-1.5 py-0.5 text-[10px] font-semibold text-wrong">
                {settings.sampleHz}Hz 网络包 · 离散跳跃
              </span>
            </div>
            <span className="font-mono text-xs text-wrong">Stuttering</span>
          </header>
          <div className="relative h-36 md:h-44">
            <div ref={rawPlotRef} className="relative size-full touch-none cursor-crosshair">
              <canvas ref={rawCanvasRef} className="absolute inset-0 size-full" />
              <div ref={rawLabelRef} className="absolute top-0 left-0 opacity-0 will-change-transform">
                <div className="pointer-events-none flex items-start gap-1">
                  <svg width="12" height="12" viewBox="0 0 12 12" className="mt-px shrink-0 text-wrong" aria-hidden="true">
                    <path d="M0 0 L12 4.2 L4.6 12 Z" fill="currentColor" />
                  </svg>
                  <span className="rounded-md bg-wrong px-2 py-0.5 text-[11px] font-medium text-white shadow-xs">
                    {settings.name} (瞬移)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Panel 3: Spring physics smoothing */}
        <section>
          <header className="flex h-11 items-center justify-between border-b border-border/50 bg-surface-2 px-4">
            <div className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-intent" />
              <span className="text-xs font-semibold text-fg">弹簧平滑重建 (With Spring Smoothing)</span>
              <span className="rounded bg-intent-soft px-1.5 py-0.5 text-[10px] font-semibold text-intent">
                二阶半隐式欧拉 · 自然微过冲
              </span>
            </div>
            <span className="font-mono text-xs text-intent">60/120fps rAF</span>
          </header>
          <div className="relative h-36 md:h-44">
            <div ref={springPlotRef} className="relative size-full touch-none cursor-crosshair">
              <canvas ref={springCanvasRef} className="absolute inset-0 size-full" />
              <div ref={springLabelRef} className="absolute top-0 left-0 opacity-0 will-change-transform">
                <div className="pointer-events-none flex items-start gap-1">
                  <svg width="12" height="12" viewBox="0 0 12 12" className="mt-px shrink-0 text-intent" aria-hidden="true">
                    <path d="M0 0 L12 4.2 L4.6 12 Z" fill="currentColor" />
                  </svg>
                  <span className="rounded-md bg-intent px-2 py-0.5 text-[11px] font-medium text-white shadow-xs">
                    {settings.name} (弹簧)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Interaction Mode Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-xs text-fg-muted">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-accent" />
          <span>
            {driving === "demo" ? (
              <span className="text-fg">
                正在循环自动演示预制手势轨迹 · <strong>在任一画布区域滑动即可实时接管</strong>
              </span>
            ) : (
              <span className="text-fg">
                已进入用户实时操控模式 · 上栏为你的手势真轨迹，中栏丢弃中间点按采样率瞬移，底栏用弹簧追赶
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={replay}
            className="flex items-center gap-1 rounded-md border border-border bg-surface-2 px-2.5 py-1 text-xs font-medium text-fg hover:bg-surface hover:text-accent active:scale-95"
          >
            <RotateCcw className="size-3" />
            <span>回放演示</span>
          </button>
          <button
            type="button"
            onClick={clear}
            className="flex items-center gap-1 rounded-md border border-border bg-surface-2 px-2.5 py-1 text-xs font-medium text-fg hover:bg-surface hover:text-wrong active:scale-95"
          >
            <Trash2 className="size-3" />
            <span>清除轨迹</span>
          </button>
        </div>
      </div>

      {/* Controls Deck */}
      <div className="grid gap-6 rounded-2xl border border-border bg-surface p-5 shadow-card md:p-6 lg:grid-cols-3">
        {/* Presets & HUD */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sliders className="size-4 text-accent" />
            <h2 className="text-sm font-semibold text-fg">物理动力学预设</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => {
              const active = settings.presetId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    patchSettings({
                      presetId: p.id,
                      stiffness: p.stiffness,
                      damping: p.damping,
                      mass: p.mass,
                    })
                  }
                  className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition ${
                    active
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border bg-surface-2 text-fg hover:border-border-strong"
                  }`}
                >
                  <span className="text-xs font-semibold">{p.label}</span>
                  <span className="mt-0.5 line-clamp-1 text-[11px] text-fg-muted">{p.hint}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-auto grid grid-cols-3 gap-2 rounded-xl border border-border bg-surface-2 p-3 text-center">
            <div>
              <div className="font-mono text-sm font-bold text-fg">{zeta.toFixed(2)}</div>
              <div className="text-[11px] text-fg-subtle">阻尼比 ζ</div>
            </div>
            <div>
              <div className="font-mono text-sm font-bold text-accent">{settings.sampleHz} Hz</div>
              <div className="text-[11px] text-fg-subtle">网络采样</div>
            </div>
            <div>
              <div className="font-mono text-sm font-bold text-intent">{Math.round(lagPx)} px</div>
              <div className="text-[11px] text-fg-subtle">瞬时滞后</div>
            </div>
          </div>
          <p className="text-center text-[11px] text-fg-muted">{zetaLabel(zeta)}</p>
        </div>

        {/* Sliders Parameters */}
        <div className="flex flex-col justify-between gap-4 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium text-fg">弹簧刚度 k (Stiffness)</span>
                <span className="font-mono text-fg-muted">{Math.round(settings.stiffness)}</span>
              </div>
              <input
                type="range"
                min={40}
                max={420}
                value={Math.round(settings.stiffness)}
                onChange={(e) => patchSettings({ stiffness: Number(e.target.value), presetId: "custom" })}
                className="spring-range"
              />
              <span className="text-[10px] text-fg-subtle">决定拉力大小与加速度上限</span>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium text-fg">阻尼系数 c (Damping)</span>
                <span className="font-mono text-fg-muted">{Math.round(settings.damping)}</span>
              </div>
              <input
                type="range"
                min={4}
                max={48}
                value={Math.round(settings.damping)}
                onChange={(e) => patchSettings({ damping: Number(e.target.value), presetId: "custom" })}
                className="spring-range"
              />
              <span className="text-[10px] text-fg-subtle">消耗动能，控制振荡与过冲阻尼</span>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium text-fg">虚拟质量 m (Mass)</span>
                <span className="font-mono text-fg-muted">{Number(settings.mass.toFixed(2))}</span>
              </div>
              <input
                type="range"
                min={0.4}
                max={2.4}
                step={0.05}
                value={Number(settings.mass.toFixed(2))}
                onChange={(e) => patchSettings({ mass: Number(e.target.value), presetId: "custom" })}
                className="spring-range"
              />
              <span className="text-[10px] text-fg-subtle">惯性质量，越大启动与转向越沉稳</span>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium text-fg">模拟网络采样率 (Hz)</span>
                <span className="font-mono text-accent font-semibold">{settings.sampleHz} Hz</span>
              </div>
              <input
                type="range"
                min={4}
                max={60}
                step={1}
                value={settings.sampleHz}
                onChange={(e) => patchSettings({ sampleHz: Number(e.target.value) })}
                className="spring-range"
              />
              <span className="text-[10px] text-fg-subtle">WebSocket广播频率：低频测试弹簧韧性</span>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium text-fg">轨迹保留时间 (Trail TTL)</span>
                <span className="font-mono text-fg-muted">{settings.trailMs} ms</span>
              </div>
              <input
                type="range"
                min={400}
                max={2400}
                step={100}
                value={settings.trailMs}
                onChange={(e) => patchSettings({ trailMs: Number(e.target.value) })}
                className="spring-range"
              />
              <span className="text-[10px] text-fg-subtle">历史拖尾保留时长：调长可观察完整轨迹</span>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium text-fg">协作者名称标签</span>
                <span className="font-mono text-xs text-fg-subtle">{settings.name.length}/24</span>
              </div>
              <input
                type="text"
                maxLength={24}
                value={settings.name}
                onChange={(e) => patchSettings({ name: e.target.value.slice(0, 24) })}
                placeholder="输入协作者名称"
                className="h-7 w-full rounded-md border border-border bg-surface px-2.5 text-xs text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none"
              />
              <span className="text-[10px] text-fg-subtle">显示于远程光标跟随的悬浮状态胶囊</span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-surface-2 p-3 text-xs text-fg-muted">
            <Info className="size-4 shrink-0 text-accent" />
            <span>
              当把采样率调低至 <strong>6–10 Hz</strong> 时，中栏的跳变已无法肉眼辨识连续轨迹，而底栏依然能依靠
              <strong>二阶半隐式欧拉积分</strong> 重建出平滑顺畅的连贯路径。
            </span>
          </div>
        </div>
      </div>

      {/* Explainer Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="font-mono text-xs text-accent">01 / 方程</div>
          <h3 className="mt-1 font-semibold text-fg">半隐式欧拉积分</h3>
          <p className="mt-2 text-xs leading-relaxed text-fg-muted">
            与 React Spring 及 Motion 相同的物理积分器。每帧根据胡克定律计算合力加速度
            <code>a = (-k·Δx - c·v)/m</code>，更新速度后再推进位移，保证能量守恒与数值稳定。
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="font-mono text-xs text-wrong">02 / 弃用方案</div>
          <h3 className="mt-1 font-semibold text-fg">为什么不用 Lerp 或 CSS</h3>
          <p className="mt-2 text-xs leading-relaxed text-fg-muted">
            线性 lerp <code>x += (target - x) * λ</code> 无速度延续，高速转弯像拖泥；CSS transition 在中途到达新包时会重置起点跳闪；样条插值必须等待多个点而引入强制延迟。
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="font-mono text-xs text-intent">03 / 工业落地</div>
          <h3 className="mt-1 font-semibold text-fg">稳定三法则</h3>
          <p className="mt-2 text-xs leading-relaxed text-fg-muted">
            ① <strong>8ms 子步切分</strong>：切后台不飞车；② <strong>死区吸附</strong>：位移与速度微小时归零，消灭微颤；③ <strong>GPU Transform</strong>：脱离 React state，60/120fps 不卡主线程。
          </p>
        </div>
      </div>
    </div>
  );
}
