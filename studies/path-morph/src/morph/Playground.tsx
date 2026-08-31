import { useEffect, useRef, useState } from "react";
import {
  SPRING_PRESETS,
  Spring,
  type SpringPreset,
} from "../lib/core";
import { computeMorphFrame } from "../lib/morph-machine";
import { PRESET_PAIRS } from "../lib/presets";
import { useLocale } from "../lib/site-locale";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { cn } from "../lib/utils";

interface PlaygroundProps {
  initialPresetId?: string;
  initialT?: number;
}

export function Playground({
  initialPresetId = "arrow-turn",
  initialT = 0.5,
}: PlaygroundProps = {}) {
  const locale = useLocale();
  const prefersReduced = useReducedMotion();

  const [presetId, setPresetId] = useState(initialPresetId);
  const [t, setT] = useState(initialT);
  const [isPlaying, setIsPlaying] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [springPreset, setSpringPreset] = useState<SpringPreset>("snappy");

  // Inspector toggles
  const [showPoints, setShowPoints] = useState(false);
  const [showCentroids, setShowCentroids] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  const activePreset = PRESET_PAIRS.find((p) => p.id === presetId) || PRESET_PAIRS[0];

  // Spring animation ref
  const animRef = useRef<number | null>(null);
  const springRef = useRef<Spring>(new Spring());
  const lastTimeRef = useRef<number>(0);

  // Compute live frames for both modes
  const polarFrame = computeMorphFrame(activePreset.from, activePreset.to, t, "polar");
  const linearFrame = computeMorphFrame(activePreset.from, activePreset.to, t, "linear");
  const metrics = polarFrame.metrics;

  const handlePlay = (targetDir: 1 | -1) => {
    if (prefersReduced) {
      setT(targetDir === 1 ? 1 : 0);
      setDirection(targetDir === 1 ? -1 : 1);
      return;
    }

    setDirection(targetDir);
    setIsPlaying(true);

    const sp = springRef.current;
    const cfg = SPRING_PRESETS[springPreset];
    sp.config(cfg.k, cfg.c);
    sp.start();

    lastTimeRef.current = performance.now();
  };

  useEffect(() => {
    if (!isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const loop = (now: number) => {
      const dt = Math.min(0.064, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      const sp = springRef.current;
      const settled = sp.step(dt);

      const progress = sp.x;
      const currentT = direction === 1 ? progress : 1 - progress;
      setT(Math.max(0, Math.min(1.2, currentT)));

      if (settled) {
        setIsPlaying(false);
        setT(direction === 1 ? 1 : 0);
        setDirection((prev) => (prev === 1 ? -1 : 1));
      } else {
        animRef.current = requestAnimationFrame(loop);
      }
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, direction, springPreset]);

  return (
    <div className="flex flex-col gap-6">
      {/* Preset Selector */}
      <div className="flex flex-wrap gap-2">
        {PRESET_PAIRS.map((pair) => {
          const isSelected = pair.id === activePreset.id;
          return (
            <button
              key={pair.id}
              type="button"
              onClick={() => {
                setPresetId(pair.id);
                setIsPlaying(false);
              }}
              className={cn(
                "group flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-all",
                isSelected
                  ? "border-fg bg-fg text-surface shadow-sm"
                  : "border-border bg-surface text-fg hover:border-fg/30 hover:bg-surface-elevated",
              )}
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface/10 text-current">
                <svg
                  viewBox="0 0 24 24"
                  className="size-4.5 stroke-current"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={computeMorphFrame(pair.from, pair.to, 0, "polar").d} />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-medium leading-tight">
                  {locale === "en" ? pair.nameEn : pair.name}
                </div>
                <div
                  className={cn(
                    "text-[11px] leading-tight",
                    isSelected ? "text-surface/70" : "text-fg-muted",
                  )}
                >
                  {pair.fromName} → {pair.toName}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Preset summary banner */}
      <div className="rounded-xl border border-border/80 bg-surface/60 px-4 py-3 text-[13px] text-fg-muted">
        <span className="font-medium text-fg">
          {locale === "en" ? "Rule in action: " : "正在观察的几何规则："}
        </span>
        {locale === "en" ? activePreset.summaryEn : activePreset.summary}
      </div>

      {/* Main Dual Comparison Stage */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Polar Procrustes */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="flex items-center justify-between border-b border-border bg-surface-elevated/40 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-2 rounded-full bg-emerald-500" />
              <span className="text-[13px] font-semibold text-fg">
                {locale === "en" ? "Polar Procrustes (Recommended)" : "极坐标相似分解 (推荐)"}
              </span>
            </div>
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              {locale === "en" ? "Decomposed similarity + polar deformation" : "刚体旋放 + 极坐标形变"}
            </span>
          </div>

          <div className="relative flex aspect-square items-center justify-center p-8 sm:p-12">
            <MorphCanvas
              d={polarFrame.d}
              buffers={polarFrame.buffers}
              plan={polarFrame.plan}
              showPoints={showPoints}
              showCentroids={showCentroids}
              showGrid={showGrid}
              highlightColor="currentColor"
            />
          </div>

          <div className="border-t border-border/60 bg-surface-elevated/20 px-4 py-2.5 text-[12px] text-fg-muted">
            {locale === "en"
              ? "Decomposes motion into pure similarity (θ, σ) and residual deformation. Zero chord collapse."
              : "分解为最优旋转角 θ* 与缩放 σ*，无弦长塌陷，旋转不收缩，保真度高。"}
          </div>
        </div>

        {/* Right: Naive Linear Coordinate Lerp */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="flex items-center justify-between border-b border-border bg-surface-elevated/40 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-2 rounded-full bg-rose-500" />
              <span className="text-[13px] font-semibold text-fg">
                {locale === "en" ? "Naive Linear Lerp (What breaks)" : "朴素坐标线性插值 (错误示范)"}
              </span>
            </div>
            <span className="rounded-md bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-600 dark:text-rose-400">
              {locale === "en" ? "Direct coordinate lerp" : "直接按点 (1-t)A + tB"}
            </span>
          </div>

          <div className="relative flex aspect-square items-center justify-center p-8 sm:p-12">
            <MorphCanvas
              d={linearFrame.d}
              buffers={linearFrame.buffers}
              plan={linearFrame.plan}
              showPoints={showPoints}
              showCentroids={showCentroids}
              showGrid={showGrid}
              highlightColor="#f43f5e"
            />
          </div>

          <div className="border-t border-border/60 bg-surface-elevated/20 px-4 py-2.5 text-[12px] text-fg-muted">
            {locale === "en"
              ? "Rotations travel along the chord: points shrink inward and shear mid-transit."
              : "旋转走弦长：中间帧严重向中心缩小、剪切变形、转角软化无力。"}
          </div>
        </div>
      </div>

      {/* Interactive Controls Toolbar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
        {/* Scrubber & playback buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePlay(direction === 1 ? 1 : -1)}
              className="flex items-center gap-2 rounded-xl bg-fg px-4 py-2 text-[13px] font-semibold text-surface transition hover:opacity-90 active:scale-95"
            >
              {isPlaying ? (
                <span>{locale === "en" ? "Animating..." : "动画进行中..."}</span>
              ) : (
                <span>
                  {direction === 1
                    ? locale === "en"
                      ? "Play Morph →"
                      : "播放变形 →"
                    : locale === "en"
                      ? "← Reverse Morph"
                      : "← 反向变形"}
                </span>
              )}
            </button>

            {/* Quick Freeze Buttons */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-elevated/50 p-1 text-[12px]">
              {[0, 0.25, 0.5, 0.75, 1].map((stepT) => (
                <button
                  key={stepT}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setT(stepT);
                  }}
                  className={cn(
                    "rounded-md px-2.5 py-1 font-mono text-[11px] transition",
                    Math.abs(t - stepT) < 0.01 && !isPlaying
                      ? "bg-fg text-surface font-semibold"
                      : "text-fg-muted hover:text-fg",
                  )}
                >
                  t={stepT}
                </button>
              ))}
            </div>
          </div>

          {/* Spring preset selector */}
          <div className="flex items-center gap-2 text-[12px]">
            <span className="text-fg-muted">{locale === "en" ? "Spring: " : "弹簧阻尼："}</span>
            {(["smooth", "snappy", "bouncy"] as SpringPreset[]).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setSpringPreset(preset)}
                className={cn(
                  "rounded-md px-2 py-1 capitalize transition",
                  springPreset === preset
                    ? "bg-fg/10 font-semibold text-fg"
                    : "text-fg-muted hover:text-fg",
                )}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Fine-grained Progress Slider */}
        <div className="flex items-center gap-4 pt-1">
          <span className="font-mono text-[12px] font-semibold text-fg">t = 0.0</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.005"
            value={Math.max(0, Math.min(1, t))}
            onChange={(e) => {
              setIsPlaying(false);
              setT(parseFloat(e.target.value));
            }}
            className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-surface-elevated accent-fg"
          />
          <span className="font-mono text-[12px] font-semibold text-fg">t = 1.0</span>
          <span className="min-w-[4.5rem] rounded-md border border-border bg-surface-elevated/80 px-2 py-1 text-center font-mono text-[12px] font-semibold text-fg">
            t = {t.toFixed(3)}
          </span>
        </div>

        {/* Inspector toggles */}
        <div className="flex flex-wrap items-center justify-between border-t border-border/70 pt-4 text-[12px]">
          <div className="flex items-center gap-4">
            <span className="font-medium text-fg">{locale === "en" ? "Inspector:" : "几何透视："}</span>
            <label className="flex cursor-pointer items-center gap-1.5 text-fg-muted hover:text-fg">
              <input
                type="checkbox"
                checked={showPoints}
                onChange={(e) => setShowPoints(e.target.checked)}
                className="rounded accent-fg"
              />
              <span>{locale === "en" ? "Sample points (N=64)" : "采样点 (N=64)"}</span>
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-fg-muted hover:text-fg">
              <input
                type="checkbox"
                checked={showCentroids}
                onChange={(e) => setShowCentroids(e.target.checked)}
                className="rounded accent-fg"
              />
              <span>{locale === "en" ? "Centroids & Vector" : "质心与旋转向量"}</span>
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-fg-muted hover:text-fg">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded accent-fg"
              />
              <span>{locale === "en" ? "24×24 Grid" : "24×24 网格"}</span>
            </label>
          </div>

          {/* Real-time Math Diagnostics */}
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-fg-muted">
            <span title="Emergent rotation angle via 2D Procrustes">
              θ*: <strong className="text-fg">{metrics.primaryThetaDeg.toFixed(1)}°</strong>
            </span>
            <span title="Optimal scale factor">
              σ*: <strong className="text-fg">{metrics.primarySigma.toFixed(2)}</strong>
            </span>
            <span title="Normalized RMS residual (0 is exact congruence)">
              res: <strong className="text-fg">{metrics.maxResidual.toFixed(4)}</strong>
            </span>
            <span title="Subpaths count in flight">
              subpaths: <strong className="text-fg">{metrics.subpathsCount}</strong>
            </span>
            {metrics.hasBlockTransport && (
              <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-indigo-500 dark:text-indigo-400">
                Block Transport
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface MorphCanvasProps {
  d: string;
  buffers: Float64Array[];
  plan: any;
  showPoints: boolean;
  showCentroids: boolean;
  showGrid: boolean;
  highlightColor?: string;
}

function MorphCanvas({
  d,
  buffers,
  plan,
  showPoints,
  showCentroids,
  showGrid,
  highlightColor = "currentColor",
}: MorphCanvasProps) {
  return (
    <div className="relative size-full max-w-[280px]">
      <svg
        viewBox="0 0 24 24"
        className="size-full overflow-visible"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Optional 24x24 coordinate grid */}
        {showGrid && (
          <g className="stroke-fg/10" strokeWidth="0.2">
            {[0, 4, 8, 12, 16, 20, 24].map((coord) => (
              <g key={coord}>
                <line x1={coord} y1="0" x2={coord} y2="24" />
                <line x1="0" y1={coord} x2="24" y2={coord} />
              </g>
            ))}
            <rect x="0" y="0" width="24" height="24" strokeWidth="0.5" className="stroke-fg/20" />
          </g>
        )}

        {/* The Animated Path */}
        <path
          d={d}
          stroke={highlightColor}
          strokeWidth="1.75"
          className="transition-[stroke] duration-150"
        />

        {/* Sample Points Visualization */}
        {showPoints && (
          <g className="fill-fg stroke-none">
            {buffers.flatMap((buf, bIdx) => {
              const n = buf.length / 2;
              const dots = [];
              for (let i = 0; i < n; i += 2) {
                dots.push(
                  <circle
                    key={`${bIdx}-${i}`}
                    cx={buf[2 * i]}
                    cy={buf[2 * i + 1]}
                    r="0.35"
                    className="opacity-75"
                  />,
                );
              }
              return dots;
            })}
          </g>
        )}

        {/* Centroids & Orientation */}
        {showCentroids && plan?.items && (
          <g className="stroke-amber-500 fill-amber-500">
            {plan.items.map((item: any, idx: number) => {
              const cx = item.ca[0];
              const cy = item.ca[1];
              return (
                <g key={idx}>
                  <circle cx={cx} cy={cy} r="0.6" strokeWidth="0.2" className="fill-amber-500" />
                  <circle cx={item.cb[0]} cy={item.cb[1]} r="0.6" strokeWidth="0.2" className="fill-indigo-500" />
                  <line
                    x1={cx}
                    y1={cy}
                    x2={item.cb[0]}
                    y2={item.cb[1]}
                    strokeWidth="0.3"
                    strokeDasharray="0.6 0.6"
                    className="stroke-amber-500/70"
                  />
                </g>
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
}
