import { useId } from "react";
import { PARSE_STEPS } from "../lib/kinds";
import { circularOffset, clampProgress, stepCurrent, stepKind } from "../lib/machines";
import type { Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import "../progress.css";

const RING = 120;

/** Fill uses scaleX, not width — stays on the compositor. */
export function FillBar({
  progress,
  className,
}: {
  progress: number;
  className?: string;
}) {
  const p = clampProgress(progress);
  return (
    <div
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-surface-2", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(p * 100)}
    >
      <div className="h-full origin-left rounded-full bg-accent" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
}

export function StageSteps({
  progress,
  locale,
  className,
}: {
  progress: number;
  locale: Locale;
  className?: string;
}) {
  const p = clampProgress(progress);
  const current = p <= 0 ? -1 : stepCurrent(p);
  const complete = current >= PARSE_STEPS.length;
  const line = complete ? 1 : current <= 0 ? 0 : current / (PARSE_STEPS.length - 1);

  return (
    <div className={cn("relative w-full", className)}>
      <div className="absolute top-4 right-10 left-10 h-0.5 bg-surface-2">
        <span className="block h-full origin-left rounded-full bg-accent" style={{ transform: `scaleX(${line})` }} />
      </div>
      <ol className="relative grid grid-cols-3">
        {PARSE_STEPS.map((stage, index) => {
          const kind = complete ? "done" : stepKind(index, current);
          const label = locale === "en" ? stage.shortEn : stage.shortZh;
          return (
            <li key={stage.zh} className="flex flex-col items-center gap-2">
              <span
                className={cn(
                  "relative z-10 grid size-8 place-items-center rounded-full",
                  kind === "done" && "bg-accent text-accent-fg",
                  kind === "active" && "bg-surface text-accent",
                  kind === "todo" && "bg-surface-2 text-fg-subtle",
                )}
                aria-current={kind === "active" ? "step" : undefined}
                aria-label={locale === "en" ? stage.en : stage.zh}
              >
                {kind === "done" ? (
                  <CheckIcon className="size-4" />
                ) : kind === "active" ? (
                  <svg viewBox="0 0 32 32" className="size-[85%]" aria-hidden>
                    <g className="meter-spin">
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray="54 21"
                      />
                    </g>
                  </svg>
                ) : (
                  <span className="text-xs font-medium tabular-nums">{index + 1}</span>
                )}
              </span>
              <span
                className={cn(
                  "text-center text-[11px] leading-tight",
                  kind === "todo" ? "text-fg-subtle" : "text-fg",
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function CircularPercent({
  progress,
  className,
}: {
  progress: number;
  className?: string;
}) {
  const p = clampProgress(progress);
  const r = 40;
  const c = 2 * Math.PI * r;
  return (
    <div className={cn("relative text-accent", className)} style={{ width: RING, height: RING }}>
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-surface-2)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={circularOffset(p, c)}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-lg font-medium tabular-nums text-accent">
        {Math.round(p * 100)}%
      </span>
    </div>
  );
}

export function LiquidGauge({
  progress,
  wave = false,
  className,
}: {
  progress: number;
  wave?: boolean;
  className?: string;
}) {
  const p = clampProgress(progress);
  const rawId = useId().replace(/:/g, "");
  const clipId = `liq-${rawId}`;
  const surface = 96 - 88 * p;
  const lightText = p > 0.46;

  return (
    <div className={cn("relative text-accent", className)} style={{ width: RING, height: RING }}>
      <svg viewBox="0 0 100 100" className="size-full">
        <defs>
          <clipPath id={clipId}>
            <circle cx="50" cy="50" r="42" />
          </clipPath>
        </defs>
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" />
        <g clipPath={`url(#${clipId})`}>
          <rect x="0" y={surface} width="100" height="100" fill="currentColor" />
          <g transform={`translate(0 ${surface})`}>
            <path
              className={wave ? "meter-wave origin-left" : undefined}
              d="M0 0 Q 12.5 -5 25 0 T 50 0 T 75 0 T 100 0 T 125 0 T 150 0 V 8 H 0 Z"
              fill="currentColor"
            />
            <path
              className={wave ? "meter-wave-slow origin-left opacity-50" : "opacity-50"}
              d="M0 2 Q 12.5 7 25 2 T 50 2 T 75 2 T 100 2 T 125 2 T 150 2 V 10 H 0 Z"
              fill="currentColor"
            />
          </g>
        </g>
      </svg>
      <span
        className={cn(
          "absolute inset-0 grid place-items-center text-lg font-medium tabular-nums",
          lightText ? "text-accent-fg" : "text-accent",
        )}
      >
        {Math.round(p * 100)}%
      </span>
    </div>
  );
}

export function LoopSpinner({ looping, className }: { looping: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("size-16 text-accent", className)}
      aria-hidden
    >
      <g className={cn("origin-center", looping && "meter-spin")}>
        <circle
          cx="24"
          cy="24"
          r="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray="72 28"
        />
      </g>
    </svg>
  );
}

export function RadarScan({ looping, className }: { looping: boolean; className?: string }) {
  return (
    <div className={cn("relative text-accent", className)} style={{ width: RING, height: RING }}>
      <div className="absolute inset-0 rounded-full border-2 border-accent/70" />
      <div className="absolute inset-[18%] rounded-full border border-accent/50" />
      <div className="absolute inset-[36%] rounded-full border border-accent/40" />
      <div className="absolute inset-0 overflow-hidden rounded-full">
        <div
          className={cn("size-full origin-center", looping && "meter-radar")}
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, transparent 210deg, color-mix(in oklab, var(--color-accent) 28%, transparent) 270deg, color-mix(in oklab, var(--color-accent) 72%, transparent) 330deg, var(--color-accent) 360deg)",
          }}
        />
      </div>
      <div className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
    </div>
  );
}

export function BounceDots({ looping, className }: { looping: boolean; className?: string }) {
  return (
    <div className={cn("flex items-end gap-2.5", className)} aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn("size-3.5 rounded-full bg-accent", looping && "meter-dot")}
          style={{ animationDelay: looping ? `${i * 150}ms` : undefined }}
        />
      ))}
    </div>
  );
}

const WAVE_BARS = [
  { delay: "0ms", duration: "0.85s", rest: 0.42 },
  { delay: "120ms", duration: "0.7s", rest: 0.78 },
  { delay: "80ms", duration: "1.05s", rest: 1 },
  { delay: "200ms", duration: "0.78s", rest: 0.55 },
  { delay: "40ms", duration: "0.92s", rest: 0.7 },
];

export function AudioWave({ looping, className }: { looping: boolean; className?: string }) {
  const h = 44;
  return (
    <div className={cn("flex items-center gap-1", className)} style={{ height: h }} aria-hidden>
      {WAVE_BARS.map((bar, i) => (
        <span
          key={i}
          className={cn("w-2 origin-center rounded-full bg-accent", looping && "meter-eq")}
          style={{
            height: h,
            transform: looping ? undefined : `scaleY(${bar.rest})`,
            animationDelay: looping ? bar.delay : undefined,
            animationDuration: looping ? bar.duration : undefined,
          }}
        />
      ))}
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3.2 8.2 6.4 11.4 12.8 4.6" />
    </svg>
  );
}
