import { useState } from "react";
import { LookCanvas, type LookSample } from "./LookCanvas";
import { PITCH_ROWS, YAW_COLS } from "./lib/look";
import { useLocale } from "./lib/site-locale";
import "./look.css";

const INITIAL: LookSample = {
  lookX: 0,
  lookY: 0,
  col: 6,
  row: 1,
  blink: false,
  clamped: false,
  srcRow: 1,
};

export function Playground() {
  const locale = useLocale();
  const [smoothing, setSmoothing] = useState(0.6);
  const [radius, setRadius] = useState(180);
  const [autoBlink, setAutoBlink] = useState(true);
  const [showRadius, setShowRadius] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [blinkPulse, setBlinkPulse] = useState(0);
  const [sample, setSample] = useState<LookSample>(INITIAL);

  function onSample(next: LookSample) {
    setSample((prev) => (sameSample(prev, next) ? prev : next));
  }

  return (
    <div className="look-stage">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[1.6rem] font-semibold tracking-tight">
            {locale === "en" ? "Offset → smooth → cell" : "偏移 → 平滑 → 格子"}
          </h2>
          <p className="mt-1 text-[14px] text-fg-muted">
            {locale === "en"
              ? "Move the pointer. Gaze lands on a cell. A blink is the other row."
              : "移动指针。视线落到格子上。眨眼是同一格的另一行。"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setBlinkPulse((n) => n + 1)}
          className="rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-medium text-fg hover:bg-surface-2"
        >
          {locale === "en" ? "Blink once" : "眨一下"}
        </button>
      </div>

      <div className="look-hud mb-4">
        <HudCard
          label={locale === "en" ? "Look" : "看向"}
          value={`${fmt(sample.lookX)}  ${fmt(sample.lookY)}`}
        />
        <HudCard
          label={locale === "en" ? "Cell" : "格子"}
          value={`r${sample.row + 1} · c${sample.col + 1}`}
        />
        <HudCard
          label={locale === "en" ? "Source row" : "源行"}
          value={sample.blink ? `${sample.row + 1} → ${sample.srcRow + 1}` : `${sample.srcRow + 1}`}
          on={sample.blink}
        />
        <HudCard
          label={locale === "en" ? "Radius" : "半径"}
          value={sample.clamped ? (locale === "en" ? "Clamped" : "夹在圆上") : locale === "en" ? "Inside" : "半径内"}
          on={sample.clamped}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16.5rem] lg:items-start">
        <div className="look-well min-w-0">
          <LookCanvas
            radius={radius}
            smoothing={smoothing}
            lookY={1}
            autoBlink={autoBlink}
            showRadius={showRadius}
            showGrid={showGrid}
            blinkPulse={blinkPulse}
            onSample={onSample}
          />
        </div>

        <aside className="min-w-0 space-y-4">
          <AtlasMap sample={sample} locale={locale} />

          <label className="look-slider">
            <span className="flex items-baseline justify-between gap-2">
              <span>{locale === "en" ? "Smoothing" : "平滑"}</span>
              <span className="font-mono text-[11px] text-fg-subtle">{smoothing.toFixed(2)}</span>
            </span>
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
          <label className="look-slider">
            <span className="flex items-baseline justify-between gap-2">
              <span>{locale === "en" ? "Radius" : "半径"}</span>
              <span className="font-mono text-[11px] text-fg-subtle">{radius}</span>
            </span>
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

          <div className="grid gap-2">
            <Toggle
              pressed={autoBlink}
              onClick={() => setAutoBlink((v) => !v)}
              label={locale === "en" ? "Auto blink" : "自动眨眼"}
            />
            <Toggle
              pressed={showRadius}
              onClick={() => setShowRadius((v) => !v)}
              label={locale === "en" ? "Show radius" : "显示半径"}
            />
            <Toggle
              pressed={showGrid}
              onClick={() => setShowGrid((v) => !v)}
              label={locale === "en" ? "Show cells" : "显示格子"}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function AtlasMap({ sample, locale }: { sample: LookSample; locale: "zh" | "en" }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-3">
      <p className="text-[11px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
        {locale === "en" ? "12 × 3 look" : "12 × 3 看向"}
      </p>
      <div className="look-atlas mt-2" aria-hidden="true">
        {Array.from({ length: PITCH_ROWS * YAW_COLS }, (_, i) => {
          const row = Math.floor(i / YAW_COLS);
          const col = i % YAW_COLS;
          const on = col === sample.col && row === sample.row && !sample.blink;
          return <i key={`look-${i}`} className={`look-atlas-cell${on ? " is-on" : ""}`} />;
        })}
      </div>
      <p className="mt-3 text-[11px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
        {locale === "en" ? "Other row · blink" : "另一行 · 眨眼"}
      </p>
      <div className="look-atlas mt-2" data-band="blink" aria-hidden="true">
        {Array.from({ length: PITCH_ROWS * YAW_COLS }, (_, i) => {
          const row = Math.floor(i / YAW_COLS);
          const col = i % YAW_COLS;
          const on = col === sample.col && row === sample.row && sample.blink;
          return <i key={`blink-${i}`} className={`look-atlas-cell${on ? " is-on" : ""}`} />;
        })}
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-fg-subtle">
        {locale === "en"
          ? `Hard cut to the cell. Blink uses source row ${sample.srcRow + 1}.`
          : `换格硬切。眨眼走源行 ${sample.srcRow + 1}。`}
      </p>
    </div>
  );
}

function HudCard({ label, value, on }: { label: string; value: string; on?: boolean }) {
  return (
    <div className="look-hud-card" data-on={on ? "true" : "false"}>
      <p className="text-[10px] font-medium tracking-[0.12em] text-fg-subtle uppercase">{label}</p>
      <p className="mt-1 truncate font-mono text-[13px] tabular-nums text-fg">{value}</p>
    </div>
  );
}

function Toggle({
  pressed,
  onClick,
  label,
}: {
  pressed: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button type="button" aria-pressed={pressed} onClick={onClick} className="look-toggle">
      <span>{label}</span>
      <span className="font-mono text-[10px] text-current/60">{pressed ? "on" : "off"}</span>
    </button>
  );
}

function fmt(n: number): string {
  const v = n.toFixed(2);
  return n >= 0 ? ` ${v}` : v;
}

function sameSample(a: LookSample, b: LookSample): boolean {
  return (
    a.col === b.col &&
    a.row === b.row &&
    a.blink === b.blink &&
    a.clamped === b.clamped &&
    a.srcRow === b.srcRow &&
    a.lookX.toFixed(2) === b.lookX.toFixed(2) &&
    a.lookY.toFixed(2) === b.lookY.toFixed(2)
  );
}
