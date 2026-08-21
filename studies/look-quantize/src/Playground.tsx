import { useState } from "react";
import { LookCanvas } from "./LookCanvas";
import { useLocale } from "./lib/site-locale";

export function Playground() {
  const locale = useLocale();
  const [smoothing, setSmoothing] = useState(0.6);
  const [radius, setRadius] = useState(180);
  const [autoBlink, setAutoBlink] = useState(true);
  const [showRadius, setShowRadius] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div className="space-y-3">
        <label className="block rounded-xl border border-border bg-surface px-3 py-2.5 text-[12px] text-fg-muted">
          {locale === "en" ? "Smoothing" : "平滑"}
          <input
            type="range"
            min={0}
            max={0.98}
            step={0.02}
            value={smoothing}
            onChange={(e) => setSmoothing(Number(e.target.value))}
            className="mt-2 w-full accent-accent"
          />
        </label>
        <label className="block rounded-xl border border-border bg-surface px-3 py-2.5 text-[12px] text-fg-muted">
          {locale === "en" ? "Radius" : "半径"}
          <input
            type="range"
            min={60}
            max={320}
            step={4}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="mt-2 w-full accent-accent"
          />
        </label>
        <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 text-[13px]">
          <span>{locale === "en" ? "Auto blink" : "自动眨眼"}</span>
          <input type="checkbox" checked={autoBlink} onChange={(e) => setAutoBlink(e.target.checked)} className="accent-accent" />
        </label>
        <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 text-[13px]">
          <span>{locale === "en" ? "Show radius" : "显示半径"}</span>
          <input type="checkbox" checked={showRadius} onChange={(e) => setShowRadius(e.target.checked)} className="accent-accent" />
        </label>
        <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 text-[13px]">
          <span>{locale === "en" ? "Show cells" : "显示格子"}</span>
          <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} className="accent-accent" />
        </label>
      </div>
      <section className="min-w-0">
        <p className="mb-3 text-[14px] text-fg-muted">
          {locale === "en" ? "Move the pointer. Gaze lands on a cell." : "移动指针。视线落到格子上。"}
        </p>
        <LookCanvas
          radius={radius}
          smoothing={smoothing}
          lookY={1}
          autoBlink={autoBlink}
          showRadius={showRadius}
          showGrid={showGrid}
        />
      </section>
    </div>
  );
}
