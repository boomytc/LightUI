import { useState } from "react";
import { ShimmerLine } from "./ShimmerLine";
import {
  PER_CHAR_DEFAULT,
  STYLES,
  paceFromSecondsPerChar,
  secondsPerCharFromPace,
  type ShimmerStyle,
} from "./lib/shimmer";
import { useLocale } from "./lib/site-locale";
import { cn } from "./lib/utils";

const DEFAULT_LINES = ["CSS is awesome, right?", "CSS is awesome", "Right?!", "CSS"];

const STYLE_LABEL: Record<ShimmerStyle, { zh: string; en: string }> = {
  classic: { zh: "单色", en: "Classic" },
  aurora: { zh: "极光", en: "Aurora" },
  flame: { zh: "火焰", en: "Flame" },
};

export function Playground() {
  const locale = useLocale();
  const [style, setStyle] = useState<ShimmerStyle>("classic");
  const [pace, setPace] = useState(() => paceFromSecondsPerChar(PER_CHAR_DEFAULT));
  const [spread, setSpread] = useState(3);
  const angle = 295;
  const [park, setPark] = useState(false);
  const [position, setPosition] = useState(50);
  const [lines, setLines] = useState(DEFAULT_LINES);

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div className="space-y-3">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
          {STYLES.map((id) => {
            const on = id === style;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setStyle(id)}
                className={cn(
                  "flex min-w-28 shrink-0 items-center rounded-xl border px-3 py-2.5 text-left text-[13px] font-medium transition-colors lg:min-w-0 lg:w-full",
                  on
                    ? "border-border-strong bg-surface shadow-card"
                    : "border-transparent bg-transparent hover:bg-surface-2",
                )}
              >
                {locale === "en" ? STYLE_LABEL[id].en : STYLE_LABEL[id].zh}
              </button>
            );
          })}
        </div>
        <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 text-[13px]">
          <span>{locale === "en" ? "Park the beam" : "停住光带"}</span>
          <input type="checkbox" checked={park} onChange={(e) => setPark(e.target.checked)} className="accent-accent" />
        </label>
        <label className="block rounded-xl border border-border bg-surface px-3 py-2.5 text-[12px] text-fg-muted">
          <span className="flex items-baseline justify-between gap-2">
            <span>{locale === "en" ? "Speed" : "速度"}</span>
            <span className="font-mono text-[11px] text-fg-subtle">
              {locale === "en"
                ? `${secondsPerCharFromPace(pace).toFixed(2)}s / glyph`
                : `每字 ${secondsPerCharFromPace(pace).toFixed(2)}s`}
            </span>
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={pace}
            onChange={(e) => setPace(Number(e.target.value))}
            className="mt-2 w-full accent-accent"
          />
          <span className="mt-1.5 flex justify-between text-[11px] text-fg-subtle">
            <span>{locale === "en" ? "Slow" : "慢"}</span>
            <span>{locale === "en" ? "Fast" : "快"}</span>
          </span>
        </label>
        <label className="block rounded-xl border border-border bg-surface px-3 py-2.5 text-[12px] text-fg-muted">
          {locale === "en" ? "Spread (ch)" : "宽度（ch）"}
          <input
            type="range"
            min={1}
            max={8}
            step={0.5}
            value={spread}
            onChange={(e) => setSpread(Number(e.target.value))}
            className="mt-2 w-full accent-accent"
          />
        </label>
        {park ? (
          <label className="block rounded-xl border border-border bg-surface px-3 py-2.5 text-[12px] text-fg-muted">
            {locale === "en" ? "Position" : "位置"}
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={position}
              onChange={(e) => setPosition(Number(e.target.value))}
              className="mt-2 w-full accent-accent"
            />
          </label>
        ) : null}
      </div>

      <section className="min-w-0">
        <p className="mb-4 text-[14px] text-fg-muted">
          {locale === "en" ? "Click a line to edit. Duration follows character count." : "点一行可以改字。时长跟着字数走。"}
        </p>
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface px-6 py-10">
          {lines.map((line, i) => (
            <ShimmerLine
              key={i}
              text={line}
              style={style}
              secondsPerChar={secondsPerCharFromPace(pace)}
              spread={spread}
              angle={angle}
              park={park}
              position={position}
              editable
              onCommit={(text) => {
                setLines((prev) => prev.map((row, j) => (j === i ? text : row)));
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
