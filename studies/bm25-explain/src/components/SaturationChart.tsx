import { useMemo, useState } from "react";
import { tfNorm } from "../lib/bm25/score.ts";

export function SaturationChart({
  k1,
  b,
  locale,
  markTf,
  markDl,
  markAvgdl,
}: {
  k1: number;
  b: number;
  locale: "zh" | "en";
  markTf?: number;
  markDl?: number;
  markAvgdl?: number;
}) {
  const [hoverTf, setHoverTf] = useState<number | null>(null);

  const points = useMemo(() => {
    const list = [];
    for (let tf = 0; tf <= 20; tf++) {
      list.push({
        tf,
        sat: tfNorm(tf, 100, 100, k1, 0),
        short: tfNorm(tf, 25, 100, k1, b),
        long: tfNorm(tf, 400, 100, k1, b),
      });
    }
    return list;
  }, [k1, b]);

  const mark = useMemo(() => {
    if (markTf == null || markDl == null || markAvgdl == null) return null;
    return {
      tf: markTf,
      value: tfNorm(markTf, markDl, markAvgdl, k1, b),
    };
  }, [markTf, markDl, markAvgdl, k1, b]);

  const width = 460;
  const height = 196;
  const padding = { top: 18, right: 16, bottom: 28, left: 36 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;
  const maxY = Math.max(k1 + 1.2, 3.0);

  const getX = (tf: number) => padding.left + (Math.min(tf, 20) / 20) * graphWidth;
  const getY = (val: number) => padding.top + graphHeight - (val / maxY) * graphHeight;

  const satPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${getX(p.tf)} ${getY(p.sat)}`).join(" ");
  const shortPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${getX(p.tf)} ${getY(p.short)}`).join(" ");
  const longPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${getX(p.tf)} ${getY(p.long)}`).join(" ");

  const activePoint = hoverTf != null ? points[hoverTf] : points[Math.min(mark?.tf ?? 5, 20)];

  return (
    <div className="space-y-3">
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full select-none"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const normX = (mouseX / rect.width) * width - padding.left;
            const tf = Math.max(0, Math.min(20, Math.round((normX / graphWidth) * 20)));
            setHoverTf(tf);
          }}
          onMouseLeave={() => setHoverTf(null)}
        >
          <line x1={padding.left} y1={getY(0)} x2={width - padding.right} y2={getY(0)} stroke="var(--color-border)" strokeWidth="1" />
          <line x1={padding.left} y1={getY(1)} x2={width - padding.right} y2={getY(1)} stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={padding.left} y1={getY(2)} x2={width - padding.right} y2={getY(2)} stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" />

          <text x={padding.left - 8} y={getY(0) + 4} textAnchor="end" className="fill-fg-subtle font-mono text-[10px]">0</text>
          <text x={padding.left - 8} y={getY(1) + 4} textAnchor="end" className="fill-fg-subtle font-mono text-[10px]">1.0</text>
          <text x={padding.left - 8} y={getY(2) + 4} textAnchor="end" className="fill-fg-subtle font-mono text-[10px]">2.0</text>

          <text x={getX(0)} y={height - 6} textAnchor="middle" className="fill-fg-subtle font-mono text-[10px]">tf=0</text>
          <text x={getX(5)} y={height - 6} textAnchor="middle" className="fill-fg-subtle font-mono text-[10px]">5</text>
          <text x={getX(10)} y={height - 6} textAnchor="middle" className="fill-fg-subtle font-mono text-[10px]">10</text>
          <text x={getX(15)} y={height - 6} textAnchor="middle" className="fill-fg-subtle font-mono text-[10px]">15</text>
          <text x={getX(20)} y={height - 6} textAnchor="middle" className="fill-fg-subtle font-mono text-[10px]">20</text>

          <path d={satPath} fill="none" stroke="var(--color-bm25)" strokeWidth="2.5" />
          <path d={shortPath} fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeDasharray="4 2" />
          <path d={longPath} fill="none" stroke="var(--color-vector)" strokeWidth="2" strokeDasharray="4 2" />

          {mark ? (
            <g>
              <circle
                cx={getX(mark.tf)}
                cy={getY(mark.value)}
                r="5.5"
                fill="var(--color-fg)"
                stroke="var(--color-surface)"
                strokeWidth="2"
              />
            </g>
          ) : null}

          {activePoint ? (
            <g>
              <line
                x1={getX(activePoint.tf)}
                y1={padding.top}
                x2={getX(activePoint.tf)}
                y2={padding.top + graphHeight}
                stroke="var(--color-fg)"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.28"
              />
              <circle cx={getX(activePoint.tf)} cy={getY(activePoint.sat)} r="3.5" fill="var(--color-bm25)" />
              <circle cx={getX(activePoint.tf)} cy={getY(activePoint.short)} r="3" fill="var(--color-accent)" />
              <circle cx={getX(activePoint.tf)} cy={getY(activePoint.long)} r="3" fill="var(--color-vector)" />
            </g>
          ) : null}
        </svg>
      </div>

      {activePoint ? (
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-xl border border-border bg-surface-2/60 px-3 py-2 font-mono text-[11px] tabular-nums">
          <span className="text-sm font-semibold text-fg">tf = {activePoint.tf}</span>
          <span className="text-bm25">
            {locale === "en" ? "base b=0" : "基准 b=0"} {activePoint.sat.toFixed(2)}
          </span>
          <span className="text-accent">
            {locale === "en" ? "short ¼" : "短文 ¼"} {activePoint.short.toFixed(2)}
          </span>
          <span className="text-vector">
            {locale === "en" ? "long 4×" : "长文 4×"} {activePoint.long.toFixed(2)}
          </span>
          {mark ? (
            <span className="text-fg">
              {locale === "en" ? "this doc" : "这篇"} {mark.value.toFixed(2)}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
