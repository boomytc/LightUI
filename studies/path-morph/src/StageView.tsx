import { computeMorphFrame } from "./lib/morph-machine";
import { PRESET_PAIRS } from "./lib/presets";
import { readStageQuery } from "./lib/stage-query";

const PRESET_IDS = new Set<string>(PRESET_PAIRS.map((p) => p.id));

export function StageView() {
  const { preset, t, mode, showPoints } = readStageQuery("arrow-turn", PRESET_IDS);
  const pair = PRESET_PAIRS.find((p) => p.id === preset) || PRESET_PAIRS[0];

  const frame = computeMorphFrame(pair.from, pair.to, t, mode);

  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg px-8 py-12">
      <div
        data-stage="fixture"
        className="flex w-full max-w-sm flex-col items-center justify-center rounded-2xl border border-border bg-surface p-12 shadow-sm"
      >
        <div className="relative size-48">
          <svg
            viewBox="0 0 24 24"
            className="size-full stroke-fg"
            fill="none"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={frame.d} />
            {showPoints && (
              <g className="fill-fg stroke-none">
                {frame.buffers.flatMap((buf, bIdx) => {
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
          </svg>
        </div>

        <div className="mt-6 flex flex-col items-center text-center">
          <div className="text-[14px] font-semibold text-fg">{pair.name}</div>
          <div className="mt-1 font-mono text-[12px] text-fg-muted">
            {mode} mode · t = {t.toFixed(2)} · θ = {frame.metrics.primaryThetaDeg.toFixed(1)}°
          </div>
        </div>
      </div>
    </div>
  );
}
