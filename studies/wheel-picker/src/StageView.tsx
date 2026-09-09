import { ChevronRight, Repeat, Volume2 } from "lucide-react";
import { readStageQuery } from "./lib/stage-query";
import {
  calcCylinderVisual,
  DEFAULT_ITEM_HEIGHT,
  formatTimeString,
  pad2,
} from "./lib/machines";

export function StageView() {
  const { hour, minute } = readStageQuery();

  return (
    <div
      data-stage="root"
      className="flex min-h-dvh items-center justify-center bg-bg p-4 sm:p-8"
    >
      <div
        data-stage="fixture"
        className="relative flex h-[580px] w-full max-w-[340px] flex-col overflow-hidden rounded-[36px] border border-border bg-surface shadow-2xl"
      >
        {/* Dynamic Island / Speaker */}
        <div className="absolute top-3 left-1/2 z-30 h-4 w-28 -translate-x-1/2 rounded-full bg-border/40" />

        {/* Status bar */}
        <div className="flex items-center justify-between px-7 pt-4 pb-2 text-xs font-medium text-fg-muted">
          <span>9:41</span>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* Alarm Header */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-accent font-medium">取消</span>
            <h2 className="text-sm font-semibold text-fg">编辑闹钟</h2>
            <span className="text-xs text-accent font-semibold">存储</span>
          </div>
        </div>

        {/* Big Time Display */}
        <div className="mt-4 text-center">
          <p className="font-mono text-5xl font-bold tracking-tight text-fg tabular-nums">
            {formatTimeString(hour, minute)}
          </p>
          <p className="mt-1 text-xs text-fg-muted">早上 · 响铃一次</p>
        </div>

        {/* Wheel Picker Stage Container */}
        <div className="relative mx-6 mt-6 rounded-2xl border border-border/60 bg-surface-2/60 p-3 shadow-inner">
          <div className="mb-2 flex px-4 text-center text-[10px] font-semibold text-fg-subtle uppercase tracking-wider">
            <span className="flex-1">小时 (HH)</span>
            <span className="flex-1">分钟 (MM)</span>
          </div>

          <div className="relative h-[200px] overflow-hidden">
            {/* Center Baseline Highlight Band */}
            <div
              className="pointer-events-none absolute inset-x-2 z-20 rounded-lg border-y border-accent/40 bg-accent-soft/40 shadow-xs backdrop-blur-[0.5px]"
              style={{
                top: `calc(50% - ${DEFAULT_ITEM_HEIGHT / 2}px)`,
                height: DEFAULT_ITEM_HEIGHT,
              }}
            />

            {/* Top & Bottom Vignette Mask */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-14 bg-linear-to-b from-surface-2 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-14 bg-linear-to-t from-surface-2 to-transparent" />

            <div className="flex h-full">
              {/* Hour Column */}
              <div className="flex-1 flex flex-col justify-center items-center">
                {[-2, -1, 0, 1, 2].map((offset) => {
                  const val = (hour + offset + 24) % 24;
                  const visual = calcCylinderVisual(offset);
                  return (
                    <div
                      key={`h-${offset}`}
                      className="flex w-full items-center justify-center font-mono text-xl tabular-nums transition-transform"
                      style={{
                        height: DEFAULT_ITEM_HEIGHT,
                        opacity: visual.opacity,
                        transform: `perspective(240px) rotateX(${visual.rotateXDeg}deg) scale(${visual.scale})`,
                        color: visual.isBaseline ? "var(--color-accent)" : "var(--color-fg)",
                        fontWeight: visual.isBaseline ? "700" : "500",
                      }}
                    >
                      {pad2(val)}
                    </div>
                  );
                })}
              </div>

              {/* Minute Column */}
              <div className="flex-1 flex flex-col justify-center items-center">
                {[-2, -1, 0, 1, 2].map((offset) => {
                  const val = (minute + offset + 60) % 60;
                  const visual = calcCylinderVisual(offset);
                  return (
                    <div
                      key={`m-${offset}`}
                      className="flex w-full items-center justify-center font-mono text-xl tabular-nums transition-transform"
                      style={{
                        height: DEFAULT_ITEM_HEIGHT,
                        opacity: visual.opacity,
                        transform: `perspective(240px) rotateX(${visual.rotateXDeg}deg) scale(${visual.scale})`,
                        color: visual.isBaseline ? "var(--color-accent)" : "var(--color-fg)",
                        fontWeight: visual.isBaseline ? "700" : "500",
                      }}
                    >
                      {pad2(val)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Options Checklist */}
        <div className="mt-auto divide-y divide-border border-t border-border bg-surface px-6 text-xs text-fg">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2 text-fg-muted">
              <Repeat className="size-3.5" />
              <span>重复频率</span>
            </div>
            <span className="text-fg-subtle flex items-center gap-1">
              工作日 (周一至周五) <ChevronRight className="size-3" />
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2 text-fg-muted">
              <Volume2 className="size-3.5" />
              <span>铃声提示</span>
            </div>
            <span className="text-fg-subtle flex items-center gap-1">
              雷达 (默认) <ChevronRight className="size-3" />
            </span>
          </div>
        </div>

        {/* Stage locked indicator */}
        <div className="absolute top-16 right-4 z-20 rounded-full border border-border/60 bg-surface/90 px-2 py-0.5 text-[10px] font-mono text-fg-muted shadow-sm backdrop-blur-sm">
          locked: {formatTimeString(hour, minute)}
        </div>
      </div>
    </div>
  );
}
