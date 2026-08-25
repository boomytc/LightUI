import { useMemo, useState } from "react";
import { tfNorm } from "../lib/bm25/score.ts";

export function SaturationChart({
  k1,
  b,
  locale,
}: {
  k1: number;
  b: number;
  locale: "zh" | "en";
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

  const width = 460;
  const height = 190;
  const padding = { top: 20, right: 20, bottom: 30, left: 35 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;
  const maxY = Math.max(k1 + 1.2, 3.0);

  const getX = (tf: number) => padding.left + (tf / 20) * graphWidth;
  const getY = (val: number) => padding.top + graphHeight - (val / maxY) * graphHeight;

  const satPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${getX(p.tf)} ${getY(p.sat)}`).join(" ");
  const shortPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${getX(p.tf)} ${getY(p.short)}`).join(" ");
  const longPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${getX(p.tf)} ${getY(p.long)}`).join(" ");

  const activePoint = hoverTf != null ? points[hoverTf] : points[5];

  return (
    <div className="space-y-3">
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
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

          <text x={padding.left - 8} y={getY(0) + 4} textAnchor="end" className="text-[10px] fill-fg-subtle font-mono">0</text>
          <text x={padding.left - 8} y={getY(1) + 4} textAnchor="end" className="text-[10px] fill-fg-subtle font-mono">1.0</text>
          <text x={padding.left - 8} y={getY(2) + 4} textAnchor="end" className="text-[10px] fill-fg-subtle font-mono">2.0</text>

          <text x={getX(0)} y={height - 8} textAnchor="middle" className="text-[10px] fill-fg-subtle font-mono">tf=0</text>
          <text x={getX(5)} y={height - 8} textAnchor="middle" className="text-[10px] fill-fg-subtle font-mono">5</text>
          <text x={getX(10)} y={height - 8} textAnchor="middle" className="text-[10px] fill-fg-subtle font-mono">10</text>
          <text x={getX(15)} y={height - 8} textAnchor="middle" className="text-[10px] fill-fg-subtle font-mono">15</text>
          <text x={getX(20)} y={height - 8} textAnchor="middle" className="text-[10px] fill-fg-subtle font-mono">20</text>

          <path d={satPath} fill="none" stroke="var(--color-bm25)" strokeWidth="2.5" />
          <path d={shortPath} fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeDasharray="4 2" />
          <path d={longPath} fill="none" stroke="var(--color-vector)" strokeWidth="2" strokeDasharray="4 2" />

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
                opacity="0.3"
              />
              <circle cx={getX(activePoint.tf)} cy={getY(activePoint.sat)} r="4" fill="var(--color-bm25)" />
              <circle cx={getX(activePoint.tf)} cy={getY(activePoint.short)} r="3.5" fill="var(--color-accent)" />
              <circle cx={getX(activePoint.tf)} cy={getY(activePoint.long)} r="3.5" fill="var(--color-vector)" />
            </g>
          ) : null}
        </svg>
      </div>

      {activePoint ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-2/60 px-3 py-2 text-xs font-mono border border-border">
          <span className="text-fg font-semibold">tf = {activePoint.tf}</span>
          <span className="text-bm25">
            {locale === "en" ? "Base (b=0):" : "基准饱和(b=0):"} {activePoint.sat.toFixed(2)}
          </span>
          <span className="text-accent">
            {locale === "en" ? "Short doc (1/4):" : "短文(1/4):"} {activePoint.short.toFixed(2)}
          </span>
          <span className="text-vector">
            {locale === "en" ? "Long doc (4×):" : "长文(4×):"} {activePoint.long.toFixed(2)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
