import { PHASE_COPY, type RefreshPhase } from "../lib/kinds";
import {
  DEFAULT_THRESHOLD_PX,
  isThresholdMet,
  pullProgress,
} from "../lib/machines";
import { pick, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import "./playground.css";

export function PullIndicator({
  pullPx,
  phase,
  locale,
  settling = false,
}: {
  pullPx: number;
  phase: RefreshPhase;
  locale: Locale;
  settling?: boolean;
}) {
  const progress = pullProgress(pullPx);
  const qualified = isThresholdMet(pullPx);
  const refreshing = phase === "refreshing";
  const show = pullPx > 0 || refreshing;

  const caption = refreshing
    ? locale === "en"
      ? "Fetching · pinned"
      : "刷新中 · 吸顶"
    : qualified
      ? pick(PHASE_COPY.ready.label, locale)
      : locale === "en"
        ? "Keep pulling"
        : "继续下拉";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        settling && "transition-[height] duration-300 ease-out",
      )}
      style={{ height: `${pullPx}px` }}
    >
      {show && (
        <div
          className={cn(
            "flex items-center gap-2.5",
            refreshing && "pull-pin-pulse",
          )}
        >
          <ProgressRing
            progress={refreshing ? 0.72 : progress}
            spinning={refreshing}
            qualified={qualified || refreshing}
          />
          <div className="min-w-0">
            <p
              className={cn(
                "text-[12px] font-semibold leading-tight",
                refreshing || qualified ? "text-intent" : "text-fg-muted",
              )}
            >
              {caption}
            </p>
            <p className="mt-0.5 font-mono text-[10px] tabular-nums text-fg-subtle">
              {Math.round(pullPx)} / {DEFAULT_THRESHOLD_PX}px
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressRing({
  progress,
  spinning,
  qualified,
}: {
  progress: number;
  spinning: boolean;
  qualified: boolean;
}) {
  const radius = 12;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - Math.min(1, Math.max(0, progress)));
  const stroke = qualified ? "var(--color-intent)" : "var(--color-accent)";

  return (
    <svg className="size-9 shrink-0" viewBox="0 0 36 36" aria-hidden>
      <circle
        cx="18"
        cy="18"
        r={radius}
        fill={qualified ? "var(--color-intent-soft)" : "var(--color-surface)"}
        stroke="var(--color-border-strong)"
        strokeWidth="2"
      />
      <g className={spinning ? "pull-ring-spin" : undefined}>
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="3.25"
          strokeLinecap="round"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={offset}
          transform="rotate(-90 18 18)"
        />
      </g>
    </svg>
  );
}
