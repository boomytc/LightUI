import {
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
  type Ref,
} from "react";
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
import { cn } from "../lib/utils";

const ACCENT = "var(--color-accent)";
const GRID = "var(--color-border)";
const MUTED = "var(--color-fg-subtle)";
const FG = "var(--color-fg-muted)";

const FUNNEL_WIDTHS = [100, 82, 64, 46, 30];

/** viewBox tracks the pane in CSS pixels so a wide work page is not a scaled-up 360 fixture. */
function useChartBox(ratio: number, minWidth = 160) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 360, height: Math.round(360 * ratio) });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const apply = (width: number) => {
      if (width <= 0) return;
      const w = Math.max(minWidth, Math.round(width));
      const h = Math.max(120, Math.round(w * ratio));
      setBox((prev) => (prev.width === w && prev.height === h ? prev : { width: w, height: h }));
    };

    apply(el.getBoundingClientRect().width);
    const ro = new ResizeObserver((entries) => apply(entries[0]?.contentRect.width ?? 0));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ratio, minWidth]);

  return [ref, box] as const;
}

function pointerX(e: PointerEvent<SVGSVGElement>, width: number): number {
  const rect = e.currentTarget.getBoundingClientRect();
  return ((e.clientX - rect.left) / Math.max(rect.width, 1)) * width;
}

function nearestI(xs: number[], px: number): number {
  let best = 0;
  let dist = Infinity;
  xs.forEach((x, i) => {
    const d = Math.abs(x - px);
    if (d < dist) {
      dist = d;
      best = i;
    }
  });
  return best;
}

function ChartTip({
  on,
  x,
  y,
  width,
  height,
  title,
  value,
}: {
  on: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  value: string;
}) {
  return (
    <div
      className={cn("chart-tip", on && "is-on")}
      style={{
        left: `${(x / width) * 100}%`,
        top: `${(y / height) * 100}%`,
        transform: x > width * 0.62 ? "translate(-108%, -12px)" : "translate(8px, -12px)",
      }}
    >
      <p className="text-[11px] text-fg-subtle">{title}</p>
      <p className="mt-0.5 text-[13px] font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function ChartSvg({
  boxRef,
  label,
  width,
  height,
  live = false,
  onPointerMove,
  onPointerLeave,
  overlay,
  children,
}: {
  boxRef: Ref<HTMLDivElement>;
  label: string;
  width: number;
  height: number;
  live?: boolean;
  onPointerMove?: (e: PointerEvent<SVGSVGElement>) => void;
  onPointerLeave?: () => void;
  overlay?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div ref={boxRef} className="chart-frame">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={label}
        className={cn("chart-svg", live && "is-live")}
        preserveAspectRatio="xMidYMid meet"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        {children}
      </svg>
      {overlay}
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
  const [boxRef, box] = useChartBox(0.55);
  const [hot, setHot] = useState<number | null>(null);
  const pad = { l: 8, r: 12, t: 14, b: 28 };
  const W = box.width;
  const H = box.height;
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const max = Math.max(...data.map((d) => d.value), 1) * 1.12;
  const xs = data.map((_, i) => xAt(i, data.length, pad.l, innerW));
  const ys = data.map((d) => yAt(d.value, max, pad.t, innerH));
  const line = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${ys[i]}`).join(" ");
  const area = `${line} L ${xs[xs.length - 1]} ${pad.t + innerH} L ${xs[0]} ${pad.t + innerH} Z`;
  const tip = hot !== null ? data[hot] : null;

  return (
    <ChartSvg
      boxRef={boxRef}
      label={label}
      width={W}
      height={H}
      live
      onPointerMove={(e) => setHot(nearestI(xs, pointerX(e, W)))}
      onPointerLeave={() => setHot(null)}
      overlay={
        <ChartTip
          on={tip !== null}
          x={hot !== null ? xs[hot]! : 0}
          y={hot !== null ? ys[hot]! : 0}
          width={W}
          height={H}
          title={tip ? pick(tip.name, locale) : ""}
          value={tip ? String(tip.value) : ""}
        />
      }
    >
      {hGrid(pad.l, W - pad.r, pad.t, pad.t + innerH)}
      {fill ? <path className="chart-area-in" d={area} fill={ACCENT} fillOpacity={0.22} /> : null}
      <path
        d={line}
        fill="none"
        stroke={ACCENT}
        strokeWidth={2}
        strokeLinejoin="round"
        pathLength={1}
        className="chart-line-draw"
      />
      {xs.map((x, i) => (
        <circle
          key={data[i]!.name.zh}
          className="chart-dot"
          cx={x}
          cy={ys[i]}
          r={hot === i ? 5 : 3}
          fill={ACCENT}
          opacity={hot !== null && hot !== i ? 0.35 : 1}
        />
      ))}
      {data.map((d, i) => {
        const last = i === data.length - 1;
        const show = i === 0 || last || (i % 2 === 0 && i < data.length - 2);
        if (!show) return null;
        return (
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
        );
      })}
    </ChartSvg>
  );
}

function ColumnMark({ locale }: { locale: Locale }) {
  const [boxRef, box] = useChartBox(0.55);
  const [hot, setHot] = useState<number | null>(null);
  const pad = { l: 8, r: 8, t: 18, b: 28 };
  const W = box.width;
  const H = box.height;
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const max = Math.max(...COLUMN_DATA.map((d) => d.value), 1) * 1.12;
  const slot = innerW / COLUMN_DATA.length;
  const barW = slot * 0.55;
  const tip = hot !== null ? COLUMN_DATA[hot] : null;
  const tipX = hot !== null ? pad.l + hot * slot + slot / 2 : 0;
  const tipY =
    hot !== null ? pad.t + innerH - (COLUMN_DATA[hot]!.value / max) * innerH : 0;

  return (
    <ChartSvg
      boxRef={boxRef}
      label={locale === "en" ? "Units by category" : "品类销量"}
      width={W}
      height={H}
      live
      onPointerLeave={() => setHot(null)}
      overlay={
        <ChartTip
          on={tip !== null}
          x={tipX}
          y={tipY}
          width={W}
          height={H}
          title={tip ? pick(tip.name, locale) : ""}
          value={tip ? String(tip.value) : ""}
        />
      }
    >
      {hGrid(pad.l, W - pad.r, pad.t, pad.t + innerH)}
      {COLUMN_DATA.map((d, i) => {
        const h = (d.value / max) * innerH;
        const x = pad.l + i * slot + (slot - barW) / 2;
        const y = pad.t + innerH - h;
        return (
          <g key={d.name.zh} onPointerEnter={() => setHot(i)}>
            <path
              d={roundTop(x, y, barW, h, 4)}
              fill={CHART_COLORS[i % CHART_COLORS.length]}
              className={cn("chart-grow chart-mark", hot !== null && (hot === i ? "is-hot" : "is-dim"))}
              style={{ animationDelay: `${i * 40}ms` }}
            />
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
  const [boxRef, box] = useChartBox(0.58);
  const [hot, setHot] = useState<number | null>(null);
  const W = box.width;
  const H = box.height;
  const pad = { l: Math.min(132, Math.max(104, Math.round(W * 0.28))), r: 36, t: 8, b: 8 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const max = Math.max(...BAR_DATA.map((d) => d.value), 1);
  const slot = innerH / BAR_DATA.length;
  const barH = slot * 0.46;
  const tip = hot !== null ? BAR_DATA[hot] : null;
  const tipX = hot !== null ? pad.l + (BAR_DATA[hot]!.value / max) * innerW : 0;
  const tipY = hot !== null ? pad.t + hot * slot + slot / 2 : 0;

  return (
    <ChartSvg
      boxRef={boxRef}
      label={locale === "en" ? "City ranking" : "城市订单榜"}
      width={W}
      height={H}
      live
      onPointerLeave={() => setHot(null)}
      overlay={
        <ChartTip
          on={tip !== null}
          x={tipX}
          y={tipY}
          width={W}
          height={H}
          title={tip ? pick(tip.name, locale) : ""}
          value={tip ? String(tip.value) : ""}
        />
      }
    >
      {BAR_DATA.map((d, i) => {
        const w = (d.value / max) * innerW;
        const y = pad.t + i * slot + (slot - barH) / 2;
        return (
          <g key={d.name.zh} onPointerEnter={() => setHot(i)}>
            <text
              x={pad.l - 8}
              y={y + barH / 2 + 4}
              textAnchor="end"
              fill={FG}
              fontSize={11}
            >
              {pick(d.name, locale)}
            </text>
            <path
              d={roundRight(pad.l, y, w, barH, 5)}
              fill={CHART_COLORS[i % CHART_COLORS.length]}
              className={cn("chart-grow-x chart-mark", hot !== null && (hot === i ? "is-hot" : "is-dim"))}
              style={{ animationDelay: `${i * 40}ms` }}
            />
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
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(220);
  const [hot, setHot] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const apply = (width: number) => {
      if (width <= 0) return;
      const next = Math.max(120, Math.round(width));
      setSize((prev) => (prev === next ? prev : next));
    };

    apply(el.getBoundingClientRect().width);
    const ro = new ResizeObserver((entries) => apply(entries[0]?.contentRect.width ?? 0));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const total = PIE_DATA.reduce((s, d) => s + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const rOut = Math.max(48, size / 2 - 6);
  const rIn = rOut * 0.62;
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
    <div className="chart-pie-layout">
      <div ref={ref} className="chart-pie">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={locale === "en" ? "Budget mix" : "预算构成"}
          className="chart-svg is-live"
          onPointerLeave={() => setHot(null)}
        >
          {slices.map((s) => (
            <path
              key={s.d.name.zh}
              d={donutSlice(cx, cy, rIn, hot === s.i ? rOut + 4 : rOut, s.a0, s.a1)}
              fill={CHART_COLORS[s.i % CHART_COLORS.length]}
              className={cn("chart-mark", hot !== null && (hot === s.i ? "is-hot" : "is-dim"))}
              onPointerEnter={() => setHot(s.i)}
            />
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" fill={ACCENT} fontSize={18} fontWeight={600}>
            {hot !== null ? `${PIE_DATA[hot]!.value}%` : `${total}%`}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" fill={MUTED} fontSize={10}>
            {hot !== null ? pick(PIE_DATA[hot]!.name, locale) : locale === "en" ? "mix" : "构成"}
          </text>
        </svg>
      </div>
      <ul className="chart-legend">
        {PIE_DATA.map((d, i) => (
          <li
            key={d.name.zh}
            className={cn(hot === i && "is-hot", hot !== null && hot !== i && "is-dim")}
            onPointerEnter={() => setHot(i)}
            onPointerLeave={() => setHot(null)}
          >
            <span
              className="chart-swatch shrink-0 rounded-sm"
              style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
            />
            <span className="min-w-0 flex-1 truncate text-fg">{pick(d.name, locale)}</span>
            <span className="shrink-0 tabular-nums text-fg-subtle">{d.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScatterMark({ locale }: { locale: Locale }) {
  const [boxRef, box] = useChartBox(0.55);
  const [hot, setHot] = useState<number | null>(null);
  const pad = { l: 28, r: 12, t: 14, b: 28 };
  const W = box.width;
  const H = box.height;
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
  const tip = hot !== null ? SCATTER_DATA[hot] : null;

  return (
    <ChartSvg
      boxRef={boxRef}
      label={locale === "en" ? "Spend vs sales" : "投放 vs 销量"}
      width={W}
      height={H}
      live
      onPointerLeave={() => setHot(null)}
      overlay={
        <ChartTip
          on={tip !== null}
          x={tip ? px(tip.x) : 0}
          y={tip ? py(tip.y) : 0}
          width={W}
          height={H}
          title={locale === "en" ? "spend · sales" : "投放 · 销量"}
          value={tip ? `${tip.x} · ${tip.y}` : ""}
        />
      }
    >
      {hGrid(pad.l, W - pad.r, pad.t, pad.t + innerH)}
      {SCATTER_DATA.map((d, i) => (
        <circle
          key={`${d.x}-${d.y}`}
          className="chart-dot"
          cx={px(d.x)}
          cy={py(d.y)}
          r={hot === i ? 6.5 : 4.5}
          fill={i % 2 === 0 ? ACCENT : CHART_COLORS[1]}
          opacity={hot !== null && hot !== i ? 0.35 : 1}
          onPointerEnter={() => setHot(i)}
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
  const [boxRef, box] = useChartBox(0.58);
  const [hot, setHot] = useState<{ col: number; key: (typeof STACK_SERIES)[number]["key"] } | null>(
    null,
  );
  const pad = { l: 8, r: 8, t: 18, b: 56 };
  const W = box.width;
  const H = box.height;
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const totals = STACKED_DATA.map((d) => d.core + d.plus + d.gift);
  const max = Math.max(...totals, 1) * 1.08;
  const slot = innerW / STACKED_DATA.length;
  const barW = slot * 0.5;
  const legendSlot = 72;
  const legendX0 = Math.max(8, (W - STACK_SERIES.length * legendSlot) / 2);
  const hotCol = hot ? STACKED_DATA[hot.col] : null;
  const hotSeries = hot ? STACK_SERIES.find((s) => s.key === hot.key) : null;

  return (
    <ChartSvg
      boxRef={boxRef}
      label={locale === "en" ? "Quarter mix" : "季度构成"}
      width={W}
      height={H}
      live
      onPointerLeave={() => setHot(null)}
      overlay={
        <ChartTip
          on={hot !== null}
          x={hot ? pad.l + hot.col * slot + slot / 2 : 0}
          y={pad.t + 18}
          width={W}
          height={H}
          title={hotCol && hotSeries ? `${pick(hotCol.name, locale)} · ${pick(hotSeries.name, locale)}` : ""}
          value={hotCol && hot ? String(hotCol[hot.key]) : ""}
        />
      }
    >
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
                className={cn(
                  "chart-grow chart-mark",
                  hot !== null && (hot.col === i && hot.key === layer.key ? "is-hot" : "is-dim"),
                )}
                onPointerEnter={() => setHot({ col: i, key: layer.key })}
              />
            ))}
            <text x={x + barW / 2} y={pad.t + innerH + 16} textAnchor="middle" fill={MUTED} fontSize={11}>
              {pick(d.name, locale)}
            </text>
          </g>
        );
      })}
      {STACK_SERIES.map((s, i) => (
        <g key={s.key} transform={`translate(${legendX0 + i * legendSlot} ${H - 14})`}>
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
  const [boxRef, box] = useChartBox(0.55);
  const [hot, setHot] = useState<{ r: number; c: number } | null>(null);
  const pad = { l: 22, r: 8, t: 18, b: 8 };
  const W = box.width;
  const H = box.height;
  const cols = HEAT_SLOTS.length;
  const rows = HEAT_DAYS.length;
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const cw = innerW / cols;
  const ch = innerH / rows;
  const max = Math.max(...HEAT_VALUES, 1);
  const hotValue = hot ? (HEAT_VALUES[hot.r * cols + hot.c] ?? 0) : 0;

  return (
    <ChartSvg
      boxRef={boxRef}
      label={locale === "en" ? "Week × hour" : "周 × 时段"}
      width={W}
      height={H}
      live
      onPointerLeave={() => setHot(null)}
      overlay={
        <ChartTip
          on={hot !== null}
          x={hot ? pad.l + hot.c * cw + cw / 2 : 0}
          y={hot ? pad.t + hot.r * ch : 0}
          width={W}
          height={H}
          title={
            hot
              ? `${pick(HEAT_DAYS[hot.r]!, locale)} · ${pick(HEAT_SLOTS[hot.c]!, locale)}`
              : ""
          }
          value={String(hotValue)}
        />
      }
    >
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
            const on = hot?.r === r && hot?.c === c;
            return (
              <rect
                key={`${day.zh}-${slot.zh}`}
                className={cn("chart-heat", on && "is-hot", hot !== null && !on && "is-dim")}
                x={pad.l + c * cw + 1.5}
                y={pad.t + r * ch + 1.5}
                width={Math.max(0, cw - 3)}
                height={Math.max(0, ch - 3)}
                rx={2}
                fill={`color-mix(in srgb, ${ACCENT} ${Math.round(18 + t * 82)}%, var(--color-accent-soft))`}
                onPointerEnter={() => setHot({ r, c })}
              />
            );
          })}
        </g>
      ))}
    </ChartSvg>
  );
}

function FunnelMark({ locale }: { locale: Locale }) {
  const [hot, setHot] = useState<number | null>(null);

  return (
    <div className="chart-funnel">
      {FUNNEL_DATA.map((d, i) => {
        const prev = i === 0 ? d.value : FUNNEL_DATA[i - 1]!.value;
        const rate = i === 0 ? 100 : Math.round((d.value / prev) * 100);
        const width = FUNNEL_WIDTHS[i] ?? 28;
        return (
          <div
            key={d.name.zh}
            className={cn(
              "chart-funnel-row",
              hot === i && "is-hot",
              hot !== null && hot !== i && "is-dim",
            )}
            onPointerEnter={() => setHot(i)}
            onPointerLeave={() => setHot(null)}
          >
            <div className="chart-funnel-track">
              <div
                className="chart-funnel-band"
                style={{
                  width: `${width}%`,
                  background: CHART_COLORS[i % CHART_COLORS.length],
                  animationDelay: `${i * 50}ms`,
                }}
              />
            </div>
            <div className="chart-funnel-meta">
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
  const [boxRef, box] = useChartBox(0.78);
  const [hot, setHot] = useState<number | null>(null);
  const W = box.width;
  const H = box.height;
  const cx = W / 2;
  const cy = H / 2 + 2;
  const labelR = Math.min(cx, cy) - 12;
  const r = labelR / 1.14;
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
  const tip = hot !== null ? RADAR_DATA[hot] : null;
  const tipPt = hot !== null ? pt(hot, RADAR_DATA[hot]!.value / 100) : { x: 0, y: 0 };

  return (
    <ChartSvg
      boxRef={boxRef}
      label={locale === "en" ? "Product scores" : "产品评测"}
      width={W}
      height={H}
      live
      onPointerLeave={() => setHot(null)}
      overlay={
        <ChartTip
          on={tip !== null}
          x={tipPt.x}
          y={tipPt.y}
          width={W}
          height={H}
          title={tip ? pick(tip.name, locale) : ""}
          value={tip ? String(tip.value) : ""}
        />
      }
    >
      {rings.map((t) => (
        <path key={t} d={ringPath(t)} fill="none" stroke={GRID} strokeWidth={1} />
      ))}
      {RADAR_DATA.map((_, i) => {
        const p = pt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={GRID} strokeWidth={1} />;
      })}
      <path
        className="chart-area-in"
        d={valuePath}
        fill={ACCENT}
        fillOpacity={0.22}
        stroke={ACCENT}
        strokeWidth={2}
      />
      {RADAR_DATA.map((d, i) => {
        const p = polar(cx, cy, labelR, angle(i));
        const v = pt(i, d.value / 100);
        const anchor = p.x < cx - 8 ? "end" : p.x > cx + 8 ? "start" : "middle";
        return (
          <g key={d.name.zh} onPointerEnter={() => setHot(i)}>
            <circle
              className="chart-dot"
              cx={v.x}
              cy={v.y}
              r={hot === i ? 5 : 3}
              fill={ACCENT}
              opacity={hot !== null && hot !== i ? 0.35 : 1}
            />
            <text x={p.x} y={p.y + 4} textAnchor={anchor} fill={FG} fontSize={11}>
              {pick(d.name, locale)}
            </text>
          </g>
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
