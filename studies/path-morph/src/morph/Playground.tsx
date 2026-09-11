import { useEffect, useMemo, useRef, useState } from "react";
import {
  SPRING_PRESETS,
  Spring,
  type MorphPlan,
  type SpringPreset,
} from "../lib/core";
import { collapseRatio, extentOf } from "../lib/extent";
import { computeMorphFrame, getCanonicalD } from "../lib/morph-machine";
import { PRESET_PAIRS } from "../lib/presets";
import { useLocale } from "../lib/site-locale";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { cn } from "../lib/utils";
import "./morph.css";

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
  const zh = locale !== "en";

  const [presetId, setPresetId] = useState(initialPresetId);
  const [t, setT] = useState(initialT);
  const [isPlaying, setIsPlaying] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [looping, setLooping] = useState(true);
  const [springPreset, setSpringPreset] = useState<SpringPreset>("smooth");
  const [showPoints, setShowPoints] = useState(false);
  const [showCentroids, setShowCentroids] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  const activePreset = PRESET_PAIRS.find((p) => p.id === presetId) || PRESET_PAIRS[0];

  const animRef = useRef<number | null>(null);
  const springRef = useRef<Spring>(new Spring());
  const lastTimeRef = useRef<number>(0);
  const spanRef = useRef({ from: 0, to: 1 });
  const loopRef = useRef(looping);
  const dirRef = useRef(direction);
  loopRef.current = looping;
  dirRef.current = direction;

  const ghosts = useMemo(() => {
    const rest = computeMorphFrame(activePreset.from, activePreset.to, 0, "polar");
    const done = computeMorphFrame(activePreset.from, activePreset.to, 1, "polar");
    return { from: rest.d, to: done.d, restExtent: extentOf(rest.buffers) };
  }, [activePreset]);

  const polarFrame = computeMorphFrame(activePreset.from, activePreset.to, t, "polar");
  const linearFrame = computeMorphFrame(activePreset.from, activePreset.to, t, "linear");
  const metrics = polarFrame.metrics;
  const polarExtent = extentOf(polarFrame.buffers);
  const linearExtent = extentOf(linearFrame.buffers);
  const polarCollapse = collapseRatio(polarExtent, ghosts.restExtent);
  const linearCollapse = collapseRatio(linearExtent, ghosts.restExtent);

  const handlePlay = (targetDir: 1 | -1) => {
    const target = targetDir === 1 ? 1 : 0;
    if (prefersReduced) {
      setT(target);
      setDirection(targetDir === 1 ? -1 : 1);
      return;
    }

    spanRef.current = { from: t, to: target };
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
      const dt = Math.min(0.048, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      const sp = springRef.current;
      const settled = sp.step(dt);
      const { from, to } = spanRef.current;
      const next = from + (to - from) * sp.x;
      setT(next);

      if (settled) {
        if (loopRef.current && !prefersReduced) {
          const nextDir: 1 | -1 = dirRef.current === 1 ? -1 : 1;
          spanRef.current = { from: to, to: nextDir === 1 ? 1 : 0 };
          setDirection(nextDir);
          const cfg = SPRING_PRESETS[springPreset];
          sp.config(cfg.k, cfg.c);
          sp.start();
          animRef.current = requestAnimationFrame(loop);
        } else {
          setIsPlaying(false);
          setT(to);
          setDirection((prev) => (prev === 1 ? -1 : 1));
        }
      } else {
        animRef.current = requestAnimationFrame(loop);
      }
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, springPreset, prefersReduced]);

  return (
    <div className="flex flex-col gap-5">
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
                setT(0.5);
                setDirection(1);
              }}
              className={cn(
                "group flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors",
                isSelected
                  ? "border-fg bg-fg text-surface shadow-card"
                  : "border-border bg-surface text-fg hover:border-border-strong hover:bg-surface-2",
              )}
            >
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-lg",
                  isSelected ? "bg-surface/15" : "bg-surface-2",
                )}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-4 stroke-current"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={getCanonicalD(pair.from)} />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-medium leading-tight">
                  {zh ? pair.name : pair.nameEn}
                </span>
                <span
                  className={cn(
                    "block text-[11px] leading-tight",
                    isSelected ? "text-surface/70" : "text-fg-muted",
                  )}
                >
                  {pair.fromName} → {pair.toName}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-surface px-4 py-3 text-[13px] leading-relaxed text-fg-muted">
        <span className="font-medium text-fg">
          {zh ? "中间帧最能说明问题：" : "The mid-frame tells the story: "}
        </span>
        {zh ? activePreset.summary : activePreset.summaryEn}
      </div>

      <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-card lg:grid-cols-2">
        <CompareStage
          tone="right"
          title={zh ? "极坐标相似分解" : "Polar Procrustes"}
          badge={zh ? "对 · 刚体旋放" : "Right · similarity"}
          note={
            zh
              ? "绕质心转。尺寸几乎不掉。叠影是左边那条弦。"
              : "Pivots about the centroid. Size holds. The ghost is the chord."
          }
          collapse={polarCollapse}
          localeZh={zh}
          d={polarFrame.d}
          overlayD={showOverlay ? linearFrame.d : undefined}
          buffers={polarFrame.buffers}
          plan={polarFrame.plan}
          extent={polarExtent}
          restRms={ghosts.restExtent.rms}
          ghostFrom={ghosts.from}
          ghostTo={ghosts.to}
          showPoints={showPoints}
          showCentroids={showCentroids}
          showChords={false}
        />
        <CompareStage
          tone="wrong"
          title={zh ? "朴素坐标插值" : "Naive coordinate lerp"}
          badge={zh ? "错 · (1−t)A + tB" : "Wrong · (1−t)A + tB"}
          note={
            zh
              ? "顶点抄弦。中间帧往里瘪。叠影是右边那条弧。"
              : "Vertices ride the chord. The mid-frame caves in. The ghost is the arc."
          }
          collapse={linearCollapse}
          localeZh={zh}
          d={linearFrame.d}
          overlayD={showOverlay ? polarFrame.d : undefined}
          buffers={linearFrame.buffers}
          plan={linearFrame.plan}
          extent={linearExtent}
          restRms={ghosts.restExtent.rms}
          ghostFrom={ghosts.from}
          ghostTo={ghosts.to}
          showPoints={showPoints}
          showCentroids={showCentroids}
          showChords
        />
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handlePlay(direction === 1 ? 1 : -1)}
              className="rounded-xl bg-fg px-4 py-2 text-[13px] font-semibold text-surface transition hover:opacity-90 active:scale-[0.98]"
            >
              {isPlaying
                ? zh
                  ? "变形中…"
                  : "Morphing…"
                : direction === 1
                  ? zh
                    ? "播放变形 →"
                    : "Play morph →"
                  : zh
                    ? "← 反向变形"
                    : "← Reverse morph"}
            </button>
            <button
              type="button"
              onClick={() => setLooping((v) => !v)}
              className={cn(
                "rounded-xl border px-3 py-2 text-[12px] font-medium transition-colors",
                looping
                  ? "border-intent/40 bg-intent-soft text-intent"
                  : "border-border bg-surface text-fg-muted hover:text-fg",
              )}
            >
              {zh ? "往返" : "Loop"}
            </button>
            <div className="flex items-center gap-1 rounded-xl border border-border bg-surface-2 p-1">
              {[0, 0.5, 1].map((stepT) => (
                <button
                  key={stepT}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setT(stepT);
                    setDirection(stepT >= 1 ? -1 : 1);
                  }}
                  className={cn(
                    "rounded-lg px-2.5 py-1 font-mono text-[11px] transition-colors",
                    Math.abs(t - stepT) < 0.02 && !isPlaying
                      ? "bg-fg font-semibold text-surface"
                      : "text-fg-muted hover:text-fg",
                  )}
                >
                  {stepT === 0.5 ? (zh ? "t=½ 塌陷峰" : "t=½ peak") : `t=${stepT}`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] tabular-nums text-fg-muted">
            <span>
              θ* <strong className="text-fg">{metrics.primaryThetaDeg.toFixed(1)}°</strong>
            </span>
            <span>
              σ* <strong className="text-fg">{metrics.primarySigma.toFixed(2)}</strong>
            </span>
            <span>
              res <strong className="text-fg">{metrics.maxResidual.toFixed(3)}</strong>
            </span>
            {metrics.hasBlockTransport ? (
              <span className="rounded-md bg-accent-soft px-1.5 py-0.5 text-accent">
                Block Transport
              </span>
            ) : null}
          </div>
        </div>

        <div className="relative flex items-center gap-3 pt-1">
          <MiniIcon d={ghosts.from} />
          <div className="relative flex-1">
            <span className="pm-mid-tick" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.002"
              value={Math.max(0, Math.min(1, t))}
              onChange={(e) => {
                setIsPlaying(false);
                setT(parseFloat(e.target.value));
              }}
              className="pm-range w-full"
              aria-label={zh ? "变形进度" : "Morph progress"}
            />
          </div>
          <MiniIcon d={ghosts.to} />
          <span className="min-w-[4.4rem] rounded-md border border-border bg-surface-2 px-2 py-1 text-center font-mono text-[12px] font-semibold tabular-nums">
            t={t.toFixed(2)}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-[12px]">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex cursor-pointer items-center gap-1.5 text-fg-muted hover:text-fg">
              <input
                type="checkbox"
                checked={showOverlay}
                onChange={(e) => setShowOverlay(e.target.checked)}
                className="rounded accent-fg"
              />
              <span>{zh ? "叠影对照" : "Overlay the other"}</span>
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-fg-muted hover:text-fg">
              <input
                type="checkbox"
                checked={showPoints}
                onChange={(e) => setShowPoints(e.target.checked)}
                className="rounded accent-fg"
              />
              <span>{zh ? "采样点" : "Samples"}</span>
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-fg-muted hover:text-fg">
              <input
                type="checkbox"
                checked={showCentroids}
                onChange={(e) => setShowCentroids(e.target.checked)}
                className="rounded accent-fg"
              />
              <span>{zh ? "质心" : "Centroids"}</span>
            </label>
          </div>
          <div className="flex items-center gap-2 text-fg-muted">
            <span>{zh ? "弹簧" : "Spring"}</span>
            {(["smooth", "snappy", "bouncy"] as SpringPreset[]).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setSpringPreset(preset)}
                className={cn(
                  "rounded-md px-2 py-1 capitalize transition-colors",
                  springPreset === preset
                    ? "bg-surface-2 font-semibold text-fg"
                    : "hover:text-fg",
                )}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompareStage({
  tone,
  title,
  badge,
  note,
  collapse,
  localeZh,
  d,
  overlayD,
  buffers,
  plan,
  extent,
  restRms,
  ghostFrom,
  ghostTo,
  showPoints,
  showCentroids,
  showChords,
}: {
  tone: "right" | "wrong";
  title: string;
  badge: string;
  note: string;
  collapse: number;
  localeZh: boolean;
  d: string;
  overlayD?: string;
  buffers: Float64Array[];
  plan: MorphPlan;
  extent: ReturnType<typeof extentOf>;
  restRms: number;
  ghostFrom: string;
  ghostTo: string;
  showPoints: boolean;
  showCentroids: boolean;
  showChords: boolean;
}) {
  const right = tone === "right";
  return (
    <div className="flex min-w-0 flex-col bg-surface">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-medium",
              right ? "bg-intent-soft text-intent" : "bg-wrong-soft text-wrong",
            )}
          >
            {right ? (localeZh ? "对" : "Right") : localeZh ? "错" : "Wrong"}
          </span>
          <span className="truncate text-[13px] font-semibold">{title}</span>
        </div>
        <span className="hidden font-mono text-[10px] text-fg-subtle sm:inline">{badge}</span>
      </div>

      <div className="pm-stage flex min-h-[18rem] items-center justify-center p-5 sm:min-h-[20rem] sm:p-7" data-tone={tone}>
        <MorphCanvas
          d={d}
          overlayD={overlayD}
          buffers={buffers}
          plan={plan}
          extent={extent}
          restRms={restRms}
          ghostFrom={ghostFrom}
          ghostTo={ghostTo}
          showPoints={showPoints}
          showCentroids={showCentroids}
          showChords={showChords}
          tone={tone}
        />
      </div>

      <div className="border-t border-border px-4 py-3">
        <div className="mb-2 flex items-center justify-between gap-3 text-[12px]">
          <span className="text-fg-muted">
            {localeZh ? "相对静止态塌陷" : "Collapse vs rest"}
          </span>
          <span
            className={cn(
              "font-mono text-[12px] font-semibold tabular-nums",
              collapse > 0.12 ? "text-wrong" : "text-intent",
            )}
          >
            {(collapse * 100).toFixed(0)}%
          </span>
        </div>
        <div className="pm-collapse" aria-hidden="true">
          <i
            className={right ? "bg-intent" : "bg-wrong"}
            style={{ width: `${Math.max(2, collapse * 100)}%` }}
          />
        </div>
        <p className="mt-2.5 text-[12px] leading-relaxed text-fg-muted">{note}</p>
      </div>
    </div>
  );
}

function MorphCanvas({
  d,
  overlayD,
  buffers,
  plan,
  extent,
  restRms,
  ghostFrom,
  ghostTo,
  showPoints,
  showCentroids,
  showChords,
  tone,
}: {
  d: string;
  overlayD?: string;
  buffers: Float64Array[];
  plan: MorphPlan;
  extent: ReturnType<typeof extentOf>;
  restRms: number;
  ghostFrom: string;
  ghostTo: string;
  showPoints: boolean;
  showCentroids: boolean;
  showChords: boolean;
  tone: "right" | "wrong";
}) {
  const right = tone === "right";
  const stroke = right ? "var(--color-fg)" : "var(--color-wrong)";
  const overlayStroke = right ? "var(--color-wrong)" : "var(--color-intent)";

  return (
    <div className="relative aspect-square w-full max-w-[240px]">
      <svg
        viewBox="0 0 24 24"
        className="size-full overflow-visible"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {right ? (
          <g className="stroke-fg/10" strokeWidth="0.18">
            {[4, 8, 12].map((r) => (
              <circle key={r} cx="12" cy="12" r={r} />
            ))}
            <line x1="12" y1="0" x2="12" y2="24" />
            <line x1="0" y1="12" x2="24" y2="12" />
          </g>
        ) : (
          <g className="stroke-fg/10" strokeWidth="0.18">
            {[0, 4, 8, 12, 16, 20, 24].map((coord) => (
              <g key={coord}>
                <line x1={coord} y1="0" x2={coord} y2="24" />
                <line x1="0" y1={coord} x2="24" y2={coord} />
              </g>
            ))}
          </g>
        )}

        <circle
          cx={extent.cx}
          cy={extent.cy}
          r={Math.max(0.4, restRms)}
          stroke="var(--color-fg)"
          strokeWidth="0.18"
          strokeDasharray="0.45 0.45"
          className="opacity-25"
        />
        <circle
          cx={extent.cx}
          cy={extent.cy}
          r={Math.max(0.35, extent.rms)}
          stroke={stroke}
          strokeWidth="0.22"
          className="opacity-45"
        />

        <path d={ghostFrom} stroke="var(--color-fg)" strokeWidth="1.15" className="opacity-[0.14]" />
        <path d={ghostTo} stroke="var(--color-fg)" strokeWidth="1.15" className="opacity-[0.14]" />

        {overlayD ? (
          <path d={overlayD} stroke={overlayStroke} strokeWidth="1.35" className="opacity-30" />
        ) : null}

        <path d={d} stroke={stroke} strokeWidth="1.75" />

        {showChords
          ? plan.items.map((item, bIdx) => {
              const buf = buffers[bIdx];
              if (!buf) return null;
              const n = plan.n;
              const marks = [];
              for (let i = 0; i < n; i += 8) {
                marks.push(
                  <line
                    key={`${bIdx}-${i}`}
                    x1={item.a[2 * i]}
                    y1={item.a[2 * i + 1]}
                    x2={buf[2 * i]}
                    y2={buf[2 * i + 1]}
                    stroke="var(--color-wrong)"
                    strokeWidth="0.22"
                    className="opacity-45"
                  />,
                );
              }
              return <g key={bIdx}>{marks}</g>;
            })
          : null}

        {showPoints ? (
          <g fill={stroke} stroke="none">
            {buffers.flatMap((buf, bIdx) => {
              const n = buf.length / 2;
              const dots = [];
              for (let i = 0; i < n; i += 2) {
                dots.push(
                  <circle key={`${bIdx}-${i}`} cx={buf[2 * i]} cy={buf[2 * i + 1]} r="0.28" />,
                );
              }
              return dots;
            })}
          </g>
        ) : null}

        {showCentroids
          ? plan.items.map((item, idx) => (
              <g key={idx}>
                <circle cx={item.ca[0]} cy={item.ca[1]} r="0.45" fill="var(--color-fg)" className="opacity-50" />
                <circle cx={item.cb[0]} cy={item.cb[1]} r="0.45" fill="var(--color-accent)" className="opacity-70" />
                <line
                  x1={item.ca[0]}
                  y1={item.ca[1]}
                  x2={item.cb[0]}
                  y2={item.cb[1]}
                  stroke="var(--color-accent)"
                  strokeWidth="0.22"
                  strokeDasharray="0.55 0.45"
                  className="opacity-50"
                />
              </g>
            ))
          : null}
      </svg>
    </div>
  );
}

function MiniIcon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5 shrink-0 stroke-fg"
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
