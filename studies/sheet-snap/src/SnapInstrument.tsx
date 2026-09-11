import {
  DEFAULT_SNAP_HEIGHTS,
  DEFAULT_VELOCITY_THRESHOLD,
  type SnapPoint,
} from "./lib/machines";
import { PHASE_LABELS, SNAPS_META } from "./lib/kinds";
import { pick, useLocale, type Locale } from "./lib/site-locale";
import { cn } from "./lib/utils";
import { PHONE_HEIGHT } from "./PhoneSheet";

type Phase = keyof typeof PHASE_LABELS;

const RAIL_MIN = 90;
const RAIL_MAX = 500;

export function SnapSideRail({
  height,
  snap,
  previewSnap,
  isDragging,
  isOverdrag,
}: {
  height: number;
  snap: SnapPoint;
  previewSnap: SnapPoint;
  isDragging: boolean;
  isOverdrag: boolean;
}) {
  const locale = useLocale();

  return (
    <div
      className="relative hidden w-[4.5rem] shrink-0 sm:block"
      style={{ height: PHONE_HEIGHT }}
      aria-hidden
    >
      <div className="absolute top-0 right-3 bottom-0 w-px bg-border" />
      <div
        className="absolute right-3 w-px bg-wrong/35"
        style={{
          bottom: DEFAULT_SNAP_HEIGHTS.full,
          height: RAIL_MAX - DEFAULT_SNAP_HEIGHTS.full,
        }}
      />
      <div
        className="absolute right-3 w-px bg-wrong/35"
        style={{
          bottom: RAIL_MIN,
          height: DEFAULT_SNAP_HEIGHTS.peek - RAIL_MIN,
        }}
      />

      {SNAPS_META.map((item) => {
        const active = snap === item.id && !isDragging;
        const preview = previewSnap === item.id && isDragging;
        return (
          <div
            key={item.id}
            className="absolute right-0 flex -translate-y-1/2 items-center gap-1.5"
            style={{ bottom: item.height }}
          >
            <span
              className={cn(
                "text-right text-[10px] leading-none",
                active ? "font-semibold text-accent" : preview ? "font-medium text-predict" : "text-fg-subtle",
              )}
            >
              {pick(item.name, locale)}
              <span className="mt-0.5 block font-mono text-[9px] text-fg-subtle">{item.height}</span>
            </span>
            <span
              className={cn(
                "size-2 rounded-full",
                active ? "bg-accent" : preview ? "bg-predict" : "bg-fg-subtle/50",
              )}
            />
          </div>
        );
      })}

      <div
        className={cn(
          "sheet-caret absolute right-0 flex -translate-y-1/2 items-center gap-1.5",
          isDragging && "is-live",
        )}
        style={{ bottom: height }}
      >
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums",
            isOverdrag ? "bg-wrong-soft text-wrong" : "bg-accent text-accent-fg",
          )}
        >
          {height}
        </span>
        <span className={cn("h-0.5 w-3 rounded-full", isOverdrag ? "bg-wrong" : "bg-accent")} />
      </div>
    </div>
  );
}

export function DiscreteTrack({
  height,
  snap,
  previewSnap,
  isDragging,
}: {
  height: number;
  snap: SnapPoint;
  previewSnap: SnapPoint;
  isDragging: boolean;
}) {
  const locale = useLocale();
  const livePct = heightToPct(height);

  return (
    <div className="relative pt-5 pb-7">
      <div className="absolute inset-x-1 top-[1.65rem] h-px bg-border" />
      {SNAPS_META.map((item) => {
        const active = snap === item.id && !isDragging;
        const preview = previewSnap === item.id && isDragging;
        return (
          <div
            key={item.id}
            className="absolute top-3 -translate-x-1/2"
            style={{ left: `${heightToPct(item.height)}%` }}
          >
            <div
              className={cn(
                "mx-auto size-2.5 rounded-full ring-2 ring-surface",
                active ? "bg-accent" : preview ? "bg-predict" : "bg-fg-subtle/45",
              )}
            />
            <p
              className={cn(
                "mt-2 text-center text-[10px] leading-tight",
                active ? "font-semibold text-fg" : "text-fg-subtle",
              )}
            >
              {pick(item.name, locale)}
              <span className="mt-0.5 block font-mono">{item.height}</span>
            </p>
          </div>
        );
      })}
      <div
        className={cn(
          "sheet-caret absolute top-2 -translate-x-1/2",
          isDragging && "is-live",
        )}
        style={{ left: `${livePct}%` }}
      >
        <div className="h-5 w-1 rounded-full bg-accent shadow-card" />
        <p className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[10px] font-semibold text-accent tabular-nums">
          {height}
        </p>
      </div>
    </div>
  );
}

export function VelocityMeter({
  velocity,
  armed,
}: {
  velocity: number;
  armed: boolean;
}) {
  const locale = useLocale();
  const clamped = Math.max(-1, Math.min(1, velocity));
  const left = ((clamped + 1) / 2) * 100;
  const thresholdPct = ((DEFAULT_VELOCITY_THRESHOLD + 1) / 2) * 100;
  const downPct = ((-DEFAULT_VELOCITY_THRESHOLD + 1) / 2) * 100;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[11px] text-fg-muted">
        <span>{locale === "en" ? "Flick up" : "上甩"}</span>
        <span className="font-mono text-fg tabular-nums">{velocity.toFixed(2)} px/ms</span>
        <span>{locale === "en" ? "Flick down" : "下甩"}</span>
      </div>
      <div className="relative h-2 rounded-full bg-surface-2">
        <div
          className="absolute inset-y-0 w-px bg-border-strong"
          style={{ left: `${downPct}%` }}
        />
        <div
          className="absolute inset-y-0 w-px bg-border-strong"
          style={{ left: `${thresholdPct}%` }}
        />
        <div
          className={cn(
            "absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full",
            armed ? "bg-accent" : "bg-fg-subtle",
          )}
          style={{ left: `${left}%` }}
        />
      </div>
      <p className="mt-1.5 text-center font-mono text-[10px] text-fg-subtle">
        ±{DEFAULT_VELOCITY_THRESHOLD} ·{" "}
        {armed
          ? locale === "en"
            ? "velocity will jump a notch"
            : "超阈将跃迁一档"
          : locale === "en"
            ? "calm release uses nearest"
            : "低速按就近落入"}
      </p>
    </div>
  );
}

export function phaseOf(isDragging: boolean, isOverdrag: boolean): Phase {
  if (isDragging && isOverdrag) return "overdrag";
  if (isDragging) return "tracking";
  return "settled";
}

export function phaseLabel(phase: Phase, locale: Locale) {
  return pick(PHASE_LABELS[phase], locale);
}

function heightToPct(height: number) {
  return ((height - RAIL_MIN) / (RAIL_MAX - RAIL_MIN)) * 100;
}
