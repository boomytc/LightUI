import { collapseRatio, extentOf } from "./lib/extent";
import { computeMorphFrame } from "./lib/morph-machine";
import { PRESET_PAIRS } from "./lib/presets";
import { readStageQuery } from "./lib/stage-query";

const PRESET_IDS = new Set<string>(PRESET_PAIRS.map((p) => p.id));

export function StageView() {
  const { preset, t, mode, showPoints } = readStageQuery("arrow-turn", PRESET_IDS);
  const pair = PRESET_PAIRS.find((p) => p.id === preset) || PRESET_PAIRS[0];

  const frame = computeMorphFrame(pair.from, pair.to, t, mode);
  const rest = computeMorphFrame(pair.from, pair.to, 0, "polar");
  const done = computeMorphFrame(pair.from, pair.to, 1, "polar");
  const extent = extentOf(frame.buffers);
  const restExtent = extentOf(rest.buffers);
  const collapse = collapseRatio(extent, restExtent);
  const right = mode !== "linear";
  const stroke = right ? "var(--color-fg)" : "var(--color-wrong)";

  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg px-8 py-12">
      <div
        data-stage="fixture"
        className="flex w-full max-w-sm flex-col items-center justify-center rounded-2xl border border-border bg-surface p-10 shadow-card"
      >
        <div className="relative size-48">
          <svg
            viewBox="0 0 24 24"
            className="size-full overflow-visible"
            fill="none"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle
              cx={extent.cx}
              cy={extent.cy}
              r={Math.max(0.4, restExtent.rms)}
              stroke="var(--color-fg)"
              strokeWidth="0.2"
              strokeDasharray="0.45 0.45"
              className="opacity-25"
            />
            <path d={rest.d} stroke="var(--color-fg)" strokeWidth="1.1" className="opacity-[0.14]" />
            <path d={done.d} stroke="var(--color-fg)" strokeWidth="1.1" className="opacity-[0.14]" />
            <path d={frame.d} stroke={stroke} />
            {showPoints && (
              <g fill={stroke} stroke="none">
                {frame.buffers.flatMap((buf, bIdx) => {
                  const n = buf.length / 2;
                  const dots = [];
                  for (let i = 0; i < n; i += 2) {
                    dots.push(
                      <circle
                        key={`${bIdx}-${i}`}
                        cx={buf[2 * i]}
                        cy={buf[2 * i + 1]}
                        r="0.32"
                        className="opacity-75"
                      />,
                    );
                  }
                  return dots;
                })}
              </g>
            )}
          </svg>
        </div>

        <div className="mt-6 flex flex-col items-center text-center">
          <div
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
              right ? "bg-intent-soft text-intent" : "bg-wrong-soft text-wrong"
            }`}
          >
            {right ? "polar" : "linear"} · collapse {(collapse * 100).toFixed(0)}%
          </div>
          <div className="mt-2 text-[14px] font-semibold text-fg">{pair.name}</div>
          <div className="mt-1 font-mono text-[12px] tabular-nums text-fg-muted">
            t = {t.toFixed(2)} · θ = {frame.metrics.primaryThetaDeg.toFixed(1)}°
          </div>
        </div>
      </div>
    </div>
  );
}
