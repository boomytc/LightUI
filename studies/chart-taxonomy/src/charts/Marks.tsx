import type { ReactNode } from "react";
import {
  AREA_DATA,
  BAR_DATA,
  CHART_COLORS,
  COLUMN_DATA,
  FUNNEL_DATA,
  HEAT_DAYS,
  HEAT_SLOTS,
  HEAT_VALUES,
  LINE_DATA,
  PIE_DATA,
  RADAR_DATA,
  SCATTER_DATA,
  STACK_SERIES,
  STACKED_DATA,
  type NamedValue,
} from "../lib/catalog";
import type { Mark } from "../lib/machines";
import { pick, type Locale } from "../lib/site-locale";

const ACCENT = "var(--color-accent)";
const GRID = "var(--color-border)";
const MUTED = "var(--color-fg-subtle)";
const FG = "var(--color-fg-muted)";

const FUNNEL_WIDTHS = [100, 82, 64, 46, 30];

function ChartSvg({
  label,
  width = 360,
  height = 200,
  children,
}: {
  label: string;
  width?: number;
  height?: number;
  children: ReactNode;
}) {
  return (
    <div className="chart-frame">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={label}
        className="chart-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {children}
      </svg>
    </div>
  );
}

function hGrid(x0: number, x1: number, y0: number, y1: number, ticks = 3) {
  const lines = [];
  for (let i = 0; i <= ticks; i++) {
    const y = y1 - ((y1 - y0) * i) / ticks;
    lines.push(
      <line key={i} x1={x0} x2={x1} y1={y} y2={y} stroke={GRID} strokeWidth={1} />,
    );
  }
  return lines;
}

function yAt(value: number, max: number, top: number, height: number): number {
  if (max <= 0) return top + height;
  return top + height - (value / max) * height;
}

function xAt(i: number, n: number, left: number, width: number): number {
  if (n <= 1) return left;
  return left + (i * width) / (n - 1);
}

function roundTop(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.min(r, w / 2, Math.max(0, h));
  if (h <= 0) return "";
  return `M ${x} ${y + h} L ${x} ${y + rr} Q ${x} ${y} ${x + rr} ${y} L ${x + w - rr} ${y} Q ${x + w} ${y} ${x + w} ${y + rr} L ${x + w} ${y + h} Z`;
}

function roundRight(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.min(r, h / 2, Math.max(0, w));
  if (w <= 0) return "";
  return `M ${x} ${y} L ${x + w - rr} ${y} Q ${x + w} ${y} ${x + w} ${y + rr} L ${x + w} ${y + h - rr} Q ${x + w} ${y + h} ${x + w - rr} ${y + h} L ${x} ${y + h} Z`;
}

function SeriesLine({
  data,
  locale,
  label,
  fill,
}: {
  data: NamedValue[];
  locale: Locale;
  label: string;
  fill?: boolean;
}) {
  const pad = { l: 10, r: 12, t: 14, b: 28 };
  const W = 360;
  const H = 200;
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const max = Math.max(...data.map((d) => d.value), 1) * 1.12;
  const xs = data.map((_, i) => xAt(i, data.length, pad.l, innerW));
  const ys = data.map((d) => yAt(d.value, max, pad.t, innerH));
  const line = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${ys[i]}`).join(" ");
  const area = `${line} L ${xs[xs.length - 1]} ${pad.t + innerH} L ${xs[0]} ${pad.t + innerH} Z`;

  return (
    <ChartSvg label={label} width={W} height={H}>
      {hGrid(pad.l, W - pad.r, pad.t, pad.t + innerH)}
      {fill ? <path d={area} fill={ACCENT} fillOpacity={0.22} /> : null}
      <path d={line} fill="none" stroke={ACCENT} strokeWidth={2.4} strokeLinejoin="round" />
      {xs.map((x, i) => (
        <circle key={data[i]!.name.zh} cx={x} cy={ys[i]} r={3} fill={ACCENT} />
      ))}
      {data.map((d, i) =>
        i % 2 === 0 || i === data.length - 1 ? (
          <text
            key={`t-${d.name.zh}`}
            x={xs[i]}
            y={H - 8}
            textAnchor="middle"
            fill={MUTED}
            fontSize={11}
          >
            {pick(d.name, locale)}
          </text>
        ) : null,
      )}
    </ChartSvg>
  );
}

function ColumnMark({ locale }: { locale: Locale }) {
  const pad = { l: 8, r: 8, t: 18, b: 28 };
  const W = 360;
  const H = 200;
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const max = Math.max(...COLUMN_DATA.map((d) => d.value), 1) * 1.12;
  const slot = innerW / COLUMN_DATA.length;
  const barW = slot * 0.55;

  return (
    <ChartSvg label={locale === "en" ? "Units by category" : "品类销量"} width={W} height={H}>
      {hGrid(pad.l, W - pad.r, pad.t, pad.t + innerH)}
      {COLUMN_DATA.map((d, i) => {
        const h = (d.value / max) * innerH;
        const x = pad.l + i * slot + (slot - barW) / 2;
        const y = pad.t + innerH - h;
        return (
          <g key={d.name.zh}>
            <path d={roundTop(x, y, barW, h, 4)} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            <text x={x + barW / 2} y={H - 8} textAnchor="middle" fill={MUTED} fontSize={11}>
              {pick(d.name, locale)}
            </text>
            <text x={x + barW / 2} y={y - 5} textAnchor="middle" fill={FG} fontSize={10}>
              {d.value}
            </text>
          </g>
        );
      })}
    </ChartSvg>
  );
}

function BarMark({ locale }: { locale: Locale }) {
  const pad = { l: 124, r: 28, t: 8, b: 8 };
  const W = 360;
  const H = 200;
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const max = Math.max(...BAR_DATA.map((d) => d.value), 1);
  const slot = innerH / BAR_DATA.length;
  const barH = slot * 0.46;

  return (
    <ChartSvg label={locale === "en" ? "City ranking" : "城市订单榜"} width={W} height={H}>
      {BAR_DATA.map((d, i) => {
        const w = (d.value / max) * innerW;
        const y = pad.t + i * slot + (slot - barH) / 2;
        return (
          <g key={d.name.zh}>
            <text
              x={pad.l - 8}
              y={y + barH / 2 + 4}
              textAnchor="end"
              fill={FG}
              fontSize={11}
            >
              {pick(d.name, locale)}
            </text>
            <path d={roundRight(pad.l, y, w, barH, 5)} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            <text x={pad.l + w + 6} y={y + barH / 2 + 4} fill={MUTED} fontSize={10}>
              {d.value}
            </text>
          </g>
        );
      })}
    </ChartSvg>
  );
}

function polar(cx: number, cy: number, r: number, a: number) {
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function donutSlice(
  cx: number,
  cy: number,
  rIn: number,
  rOut: number,
  a0: number,
  a1: number,
): string {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const p0 = polar(cx, cy, rOut, a0);
  const p1 = polar(cx, cy, rOut, a1);
  const p2 = polar(cx, cy, rIn, a1);
  const p3 = polar(cx, cy, rIn, a0);
  return `M ${p0.x} ${p0.y} A ${rOut} ${rOut} 0 ${large} 1 ${p1.x} ${p1.y} L ${p2.x} ${p2.y} A ${rIn} ${rIn} 0 ${large} 0 ${p3.x} ${p3.y} Z`;
}

function PieMark({ locale }: { locale: Locale }) {
  const total = PIE_DATA.reduce((s, d) => s + d.value, 0);
  const cx = 90;
  const cy = 90;
  const rOut = 78;
  const rIn = 48;
  const gap = 0.045;
  let cursor = -Math.PI / 2;
  const slices = PIE_DATA.map((d, i) => {
    const sweep = (d.value / total) * Math.PI * 2 - gap;
    const a0 = cursor;
    const a1 = cursor + Math.max(sweep, 0.02);
    cursor += sweep + gap;
    return { d, i, a0, a1 };
  });

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-4">
      <div className="chart-pie mx-auto shrink-0">
        <svg
          viewBox="0 0 180 180"
          role="img"
          aria-label={locale === "en" ? "Budget mix" : "预算构成"}
          className="chart-svg"
        >
          {slices.map((s) => (
            <path
              key={s.d.name.zh}
              d={donutSlice(cx, cy, rIn, rOut, s.a0, s.a1)}
              fill={CHART_COLORS[s.i % CHART_COLORS.length]}
            />
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" fill={ACCENT} fontSize={18} fontWeight={600}>
            {total}%
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" fill={MUTED} fontSize={10}>
            {locale === "en" ? "mix" : "构成"}
          </text>
        </svg>
      </div>
      <ul className="min-w-0 space-y-1.5">
        {PIE_DATA.map((d, i) => (
          <li key={d.name.zh} className="flex items-center gap-2 text-[12px]">
            <span
              className="chart-swatch shrink-0 rounded-sm"
              style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
            />
            <span className="min-w-0 truncate text-fg">{pick(d.name, locale)}</span>
            <span className="tabular-nums text-fg-subtle">{d.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScatterMark({ locale }: { locale: Locale }) {
  const pad = { l: 28, r: 12, t: 14, b: 28 };
  const W = 360;
  const H = 200;
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const xs = SCATTER_DATA.map((d) => d.x);
  const ys = SCATTER_DATA.map((d) => d.y);
  const xMin = Math.min(...xs) * 0.85;
  const xMax = Math.max(...xs) * 1.08;
  const yMin = Math.min(...ys) * 0.85;
  const yMax = Math.max(...ys) * 1.08;
  const px = (x: number) => pad.l + ((x - xMin) / (xMax - xMin)) * innerW;
  const py = (y: number) => pad.t + innerH - ((y - yMin) / (yMax - yMin)) * innerH;

  return (
    <ChartSvg label={locale === "en" ? "Spend vs sales" : "投放 vs 销量"} width={W} height={H}>
      {hGrid(pad.l, W - pad.r, pad.t, pad.t + innerH)}
      {SCATTER_DATA.map((d, i) => (
        <circle
          key={`${d.x}-${d.y}`}
          cx={px(d.x)}
          cy={py(d.y)}
          r={4.5}
          fill={i % 2 === 0 ? ACCENT : CHART_COLORS[1]}
        />
      ))}
      <text x={W / 2} y={H - 6} textAnchor="middle" fill={MUTED} fontSize={10}>
        {locale === "en" ? "spend" : "投放"}
      </text>
      <text
        x={12}
        y={H / 2}
        textAnchor="middle"
        fill={MUTED}
        fontSize={10}
        transform={`rotate(-90 12 ${H / 2})`}
      >
        {locale === "en" ? "sales" : "销量"}
      </text>
    </ChartSvg>
  );
}

function StackedMark({ locale }: { locale: Locale }) {
  const pad = { l: 8, r: 8, t: 18, b: 44 };
  const W = 360;
  const H = 210;
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const totals = STACKED_DATA.map((d) => d.core + d.plus + d.gift);
  const max = Math.max(...totals, 1) * 1.08;
  const slot = innerW / STACKED_DATA.length;
  const barW = slot * 0.5;

  return (
    <ChartSvg label={locale === "en" ? "Quarter mix" : "季度构成"} width={W} height={H}>
      {hGrid(pad.l, W - pad.r, pad.t, pad.t + innerH)}
      {STACKED_DATA.map((d, i) => {
        const x = pad.l + i * slot + (slot - barW) / 2;
        let y = pad.t + innerH;
        const layers = STACK_SERIES.map((s) => {
          const h = (d[s.key] / max) * innerH;
          y -= h;
          return { ...s, y, h };
        });
        return (
          <g key={d.name.zh}>
            {layers.map((layer) => (
              <rect
                key={layer.key}
                x={x}
                y={layer.y}
                width={barW}
                height={Math.max(0, layer.h)}
                fill={layer.color}
              />
            ))}
            <text x={x + barW / 2} y={pad.t + innerH + 16} textAnchor="middle" fill={MUTED} fontSize={11}>
              {pick(d.name, locale)}
            </text>
          </g>
        );
      })}
      {STACK_SERIES.map((s, i) => (
        <g key={s.key} transform={`translate(${80 + i * 70} ${H - 12})`}>
          <rect width={8} height={8} y={-8} rx={1} fill={s.color} />
          <text x={12} y={0} fill={FG} fontSize={10}>
            {pick(s.name, locale)}
          </text>
        </g>
      ))}
    </ChartSvg>
  );
}

function HeatmapMark({ locale }: { locale: Locale }) {
  const pad = { l: 22, r: 8, t: 18, b: 8 };
  const W = 360;
  const H = 200;
  const cols = HEAT_SLOTS.length;
  const rows = HEAT_DAYS.length;
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const cw = innerW / cols;
  const ch = innerH / rows;
  const max = Math.max(...HEAT_VALUES, 1);

  return (
    <ChartSvg label={locale === "en" ? "Week × hour" : "周 × 时段"} width={W} height={H}>
      {HEAT_SLOTS.map((slot, c) => (
        <text
          key={slot.zh}
          x={pad.l + c * cw + cw / 2}
          y={12}
          textAnchor="middle"
          fill={MUTED}
          fontSize={9}
        >
          {pick(slot, locale)}
        </text>
      ))}
      {HEAT_DAYS.map((day, r) => (
        <g key={day.zh}>
          <text
            x={pad.l - 6}
            y={pad.t + r * ch + ch / 2 + 3}
            textAnchor="end"
            fill={MUTED}
            fontSize={10}
          >
            {pick(day, locale)}
          </text>
          {HEAT_SLOTS.map((slot, c) => {
            const value = HEAT_VALUES[r * cols + c] ?? 0;
            const t = value / max;
            return (
              <rect
                key={`${day.zh}-${slot.zh}`}
                x={pad.l + c * cw + 1.5}
                y={pad.t + r * ch + 1.5}
                width={Math.max(0, cw - 3)}
                height={Math.max(0, ch - 3)}
                rx={2}
                fill={`color-mix(in srgb, ${ACCENT} ${Math.round(18 + t * 82)}%, var(--color-accent-soft))`}
              />
            );
          })}
        </g>
      ))}
    </ChartSvg>
  );
}

function FunnelMark({ locale }: { locale: Locale }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 overflow-x-hidden">
      {FUNNEL_DATA.map((d, i) => {
        const prev = i === 0 ? d.value : FUNNEL_DATA[i - 1]!.value;
        const rate = i === 0 ? 100 : Math.round((d.value / prev) * 100);
        const width = FUNNEL_WIDTHS[i] ?? 28;
        return (
          <div key={d.name.zh} className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 min-w-0 flex-1 items-center justify-center overflow-hidden">
              <div
                className="chart-funnel-band h-9"
                style={{
                  width: `${width}%`,
                  background: CHART_COLORS[i % CHART_COLORS.length],
                }}
              />
            </div>
            <div className="w-[4.8rem] shrink-0 leading-tight">
              <p className="truncate text-[11px] text-fg">{pick(d.name, locale)}</p>
              <p className="text-[11px] tabular-nums text-fg-subtle">
                {d.value.toLocaleString()}
                {i > 0 ? ` · ${rate}%` : ""}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RadarMark({ locale }: { locale: Locale }) {
  const W = 360;
  const H = 220;
  const cx = 180;
  const cy = 112;
  const r = 78;
  const n = RADAR_DATA.length;
  const rings = [0.25, 0.5, 0.75, 1];
  const angle = (i: number) => -Math.PI / 2 + (i / n) * Math.PI * 2;
  const pt = (i: number, t: number) => polar(cx, cy, r * t, angle(i));
  const ringPath = (t: number) =>
    RADAR_DATA.map((_, i) => {
      const p = pt(i, t);
      return `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`;
    }).join(" ") + " Z";
  const valuePath =
    RADAR_DATA.map((d, i) => {
      const p = pt(i, d.value / 100);
      return `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`;
    }).join(" ") + " Z";

  return (
    <ChartSvg label={locale === "en" ? "Product scores" : "产品评测"} width={W} height={H}>
      {rings.map((t) => (
        <path key={t} d={ringPath(t)} fill="none" stroke={GRID} strokeWidth={1} />
      ))}
      {RADAR_DATA.map((_, i) => {
        const p = pt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={GRID} strokeWidth={1} />;
      })}
      <path d={valuePath} fill={ACCENT} fillOpacity={0.22} stroke={ACCENT} strokeWidth={2} />
      {RADAR_DATA.map((d, i) => {
        const p = pt(i, 1.22);
        const anchor = p.x < cx - 8 ? "end" : p.x > cx + 8 ? "start" : "middle";
        return (
          <text key={d.name.zh} x={p.x} y={p.y + 4} textAnchor={anchor} fill={FG} fontSize={11}>
            {pick(d.name, locale)}
          </text>
        );
      })}
    </ChartSvg>
  );
}

export function ChartMark({ mark, locale }: { mark: Mark; locale: Locale }) {
  switch (mark) {
    case "line":
      return (
        <SeriesLine
          data={LINE_DATA}
          locale={locale}
          label={locale === "en" ? "Monthly sales" : "月销售额"}
        />
      );
    case "area":
      return (
        <SeriesLine
          data={AREA_DATA}
          locale={locale}
          label={locale === "en" ? "Cumulative sign-ups" : "累计注册"}
          fill
        />
      );
    case "column":
      return <ColumnMark locale={locale} />;
    case "bar":
      return <BarMark locale={locale} />;
    case "pie":
      return <PieMark locale={locale} />;
    case "stacked":
      return <StackedMark locale={locale} />;
    case "scatter":
      return <ScatterMark locale={locale} />;
    case "heatmap":
      return <HeatmapMark locale={locale} />;
    case "funnel":
      return <FunnelMark locale={locale} />;
    case "radar":
      return <RadarMark locale={locale} />;
  }
}
