import { useEffect, useMemo, useRef, useState, type PointerEvent, type RefObject } from "react";
import {
  ANOMALY_INDEX,
  DAY_COUNT,
  DRILL,
  MAX_END,
  PEAK_INDEX,
  SERIES,
  SERIES_IDS,
  VISITS,
  dayLabel,
  drillAtPath,
  drillCrumbs,
  extremeIndex,
  toDrillTree,
} from "../lib/catalog";
import {
  brushPointerDown,
  brushPointerMove,
  brushPointerUp,
  drillPop,
  drillPush,
  gestureClass,
  legendToggle,
  nearestIndex,
  playgroundState,
  rangeStats,
  stageState,
  xAt,
  zoomWindow,
  type BrushState,
  type KindId,
} from "../lib/machines";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";

export const PLOT = { w: 600, h: 228, x0: 42, x1: 586, y0: 16, y1: 186 };

const GRID = "var(--color-border)";
const MUTED = "var(--color-fg-subtle)";
const FG = "var(--color-fg-muted)";
const ACCENT = "var(--color-accent)";

function yAt(value: number, max: number, y0: number, y1: number): number {
  if (max <= 0) return y1;
  return y1 - (value / max) * (y1 - y0);
}

function pointerPx(clientX: number, el: Element): number {
  const rect = el.getBoundingClientRect();
  return ((clientX - rect.left) / Math.max(rect.width, 1)) * PLOT.w;
}

function pointerAbsIndex(
  clientX: number,
  el: Element,
  winStart: number,
  winEnd: number,
): number {
  const count = Math.max(1, winEnd - winStart + 1);
  const local = nearestIndex(count, pointerPx(clientX, el), PLOT.x0, PLOT.x1);
  return winStart + local;
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function presetWindow(
  points: 30 | 7 | 3,
  cursor: number,
): { start: number; end: number } {
  if (points === 30) return { start: 0, end: MAX_END };
  return zoomWindow(0, MAX_END, (points - 1) / MAX_END, cursor, points - 1, MAX_END);
}

function roundTop(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.min(r, w / 2, Math.max(0, h));
  if (h <= 0) return "";
  return `M ${x} ${y + h} L ${x} ${y + rr} Q ${x} ${y} ${x + rr} ${y} L ${x + w - rr} ${y} Q ${x + w} ${y} ${x + w} ${y + rr} L ${x + w} ${y + h} Z`;
}

function initialBrush(snapshot: string): BrushState {
  if (snapshot === "frozen") return { origin: null, start: 12, end: 20, frozen: true };
  return { origin: null, start: 0, end: 0, frozen: false };
}

function initialHover(kind: KindId, snapshot: string): number | null {
  if (kind === "tooltip" && snapshot === "show") return PEAK_INDEX;
  if (kind === "crosshair" && snapshot === "snap") return 18;
  return null;
}

export function GestureChart({
  kind,
  locked = false,
  lockedState,
}: {
  kind: KindId;
  locked?: boolean;
  lockedState?: string;
}) {
  const locale = useLocale();
  const snapshot = locked ? stageState(kind, lockedState ?? "") : playgroundState(kind);
  const klass = gestureClass(kind);

  const [brush, setBrush] = useState<BrushState>(() => initialBrush(snapshot));
  const [hover, setHover] = useState<number | null>(() => initialHover(kind, snapshot));
  const [hiMode, setHiMode] = useState<"anomaly" | "peak">(
    snapshot === "anomaly" ? "anomaly" : "peak",
  );
  const [hidden, setHidden] = useState<Set<string>>(
    () => (snapshot === "filtered" ? new Set<string>(["mail"]) : new Set<string>()),
  );
  const [hint, setHint] = useState(false);
  const [cursor, setCursor] = useState(15);
  const [win, setWin] = useState(() => {
    if (kind !== "zoom") return { start: 0, end: MAX_END };
    if (snapshot === "7") return presetWindow(7, 15);
    if (snapshot === "3") return presetWindow(3, 15);
    return { start: 0, end: MAX_END };
  });
  const [path, setPath] = useState<string[]>(() => (snapshot === "l2" ? ["search"] : []));

  const svgRef = useRef<SVGSVGElement | null>(null);
  const cursorRef = useRef(cursor);
  const winRef = useRef(win);
  cursorRef.current = cursor;
  winRef.current = win;

  useEffect(() => {
    if (kind !== "zoom") return;
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.2 : 0.8;
      const cur = cursorRef.current;
      const w = winRef.current;
      setWin(zoomWindow(w.start, w.end, factor, cur, 2, MAX_END));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [kind]);

  const visibleSeries = useMemo(
    () => SERIES.filter((s) => !hidden.has(s.id)),
    [hidden],
  );

  const view = kind === "zoom" ? win : { start: 0, end: MAX_END };
  const count = view.end - view.start + 1;
  const sliceMax = Math.max(
    1,
    ...visibleSeries.flatMap((s) => s.values.slice(view.start, view.end + 1)),
  );
  const yMax = sliceMax * 1.12;

  const hiAbs = extremeIndex(VISITS, hiMode === "peak" ? "max" : "min");
  const tree = useMemo(() => toDrillTree(DRILL, locale), [locale]);
  const bars = drillAtPath(DRILL, path);
  const crumbs = drillCrumbs(DRILL, path, locale);
  const barMax = Math.max(1, ...bars.map((b) => b.value));

  const stats =
    kind === "brush" && (brush.frozen || brush.origin !== null)
      ? rangeStats(VISITS, brush.start, brush.end)
      : null;

  const liveIndex =
    kind === "highlight"
      ? hiAbs
      : kind === "brush" && brush.frozen
        ? brush.end
        : (hover ?? cursor);

  function onPointerDown(e: PointerEvent<SVGSVGElement>) {
    const i = pointerAbsIndex(e.clientX, e.currentTarget, view.start, view.end);
    setCursor(i);
    if (kind === "brush") {
      e.currentTarget.setPointerCapture(e.pointerId);
      setBrush(brushPointerDown(i));
    }
  }

  function onPointerMove(e: PointerEvent<SVGSVGElement>) {
    const i = pointerAbsIndex(e.clientX, e.currentTarget, view.start, view.end);
    setCursor(i);
    if (kind === "brush") setBrush((s) => brushPointerMove(s, i));
    if (kind === "crosshair" || kind === "tooltip") setHover(i);
  }

  function onPointerUp() {
    if (kind === "brush") setBrush((s) => brushPointerUp(s));
  }

  function onPointerLeave() {
    if (kind === "crosshair" || kind === "tooltip") setHover(null);
  }

  function toggleSeries(id: string) {
    setHidden((h) => {
      const next = legendToggle(h, id, SERIES_IDS);
      const blocked = !h.has(id) && !next.has(id);
      setHint(blocked);
      return next;
    });
  }

  const layer = CLASS_LABEL[klass];
  const depthLabel =
    path.length === 0
      ? locale === "en"
        ? "Channel"
        : "渠道"
      : path.length === 1
        ? locale === "en"
          ? "Category"
          : "分类"
        : locale === "en"
          ? "Page"
          : "页面";

  return (
    <div
      data-kind={kind}
      data-class={klass}
      data-state={
        kind === "brush"
          ? brush.frozen
            ? "frozen"
            : "idle"
          : kind === "legend"
            ? hidden.size > 0
              ? "filtered"
              : "all"
            : kind === "drill"
              ? path.length >= 1
                ? "l2"
                : "l1"
              : kind === "zoom"
                ? String(count)
                : kind === "highlight"
                  ? hiMode
                  : hover === null
                    ? "hide"
                    : kind === "tooltip"
                      ? "show"
                      : "snap"
      }
      className="min-w-0"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent">
          {pick(layer, locale)}
          <span className="ml-1.5 font-mono text-[10px] text-accent/70">{klass}</span>
        </span>
        {kind === "highlight" ? (
          <div className="flex rounded-lg bg-surface-2 p-0.5">
            {(["anomaly", "peak"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={hiMode === mode}
                onClick={() => setHiMode(mode)}
                className={cn(
                  "rounded-md px-2 py-1 text-[11px] font-medium",
                  hiMode === mode ? "bg-surface text-fg shadow-sm" : "text-fg-muted hover:text-fg",
                )}
              >
                {mode === "anomaly"
                  ? locale === "en"
                    ? "Anomaly dip"
                    : "异常低点"
                  : locale === "en"
                    ? "Peak"
                    : "峰值"}
              </button>
            ))}
          </div>
        ) : null}
        {kind === "zoom" ? (
          <div className="flex rounded-lg bg-surface-2 p-0.5">
            {([30, 7, 3] as const).map((n) => {
              const on = count === n || (n === 30 && view.start === 0 && view.end === MAX_END);
              return (
                <button
                  key={n}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setWin(presetWindow(n, cursor))}
                  className={cn(
                    "rounded-md px-2 py-1 font-mono text-[11px] font-medium",
                    on ? "bg-surface text-fg shadow-sm" : "text-fg-muted hover:text-fg",
                  )}
                >
                  {n}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {kind === "drill" ? (
        <div className="mb-3 flex flex-wrap items-center gap-1 text-[12px]">
          <button
            type="button"
            onClick={() => setPath((p) => drillPop(p, 0))}
            className="rounded-md px-1.5 py-0.5 text-fg-muted hover:bg-surface-2 hover:text-fg"
          >
            {locale === "en" ? "Channel" : "渠道"}
          </button>
          {crumbs.map((c, i) => (
            <span key={c.id} className="flex items-center gap-1">
              <span className="text-fg-subtle">/</span>
              <button
                type="button"
                onClick={() => setPath((p) => drillPop(p, i + 1))}
                className="rounded-md px-1.5 py-0.5 text-fg-muted hover:bg-surface-2 hover:text-fg"
              >
                {c.name}
              </button>
            </span>
          ))}
          <span className="ml-auto text-[11px] text-fg-subtle">{depthLabel}</span>
        </div>
      ) : null}

      <div className="chart-plot-lock">
        {kind === "drill" ? (
          <BarPlot
            locale={locale}
            items={bars.map((b) => ({
              id: b.id,
              name: pick(b.name, locale),
              value: b.value,
              hasChildren: Boolean(b.children && b.children.length > 0),
            }))}
            max={barMax * 1.12}
            onPick={(id) => setPath((p) => drillPush(p, id, tree))}
          />
        ) : (
          <LinePlot
            locale={locale}
            kind={kind}
            svgRef={svgRef}
            series={kind === "legend" ? visibleSeries : [SERIES[0]!]}
            view={view}
            count={count}
            yMax={yMax}
            brush={kind === "brush" && (brush.frozen || brush.origin !== null) ? brush : null}
            stats={stats}
            hair={kind === "crosshair" ? hover : null}
            highlight={kind === "highlight" ? hiAbs : null}
            tooltip={kind === "tooltip" ? hover : null}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerLeave}
          />
        )}
      </div>

      {kind === "legend" ? (
        <div className="chart-legend mt-3">
          {SERIES.map((s) => {
            const on = !hidden.has(s.id);
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggleSeries(s.id)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1 text-[12px] text-fg-muted hover:bg-surface-2"
              >
                <i className="size-2.5 rounded-full" style={{ background: s.color }} />
                {pick(s.name, locale)}
              </button>
            );
          })}
        </div>
      ) : null}

      {hint ? (
        <p className="mt-2 text-[12px] text-accent">
          {locale === "en" ? "The last visible series stays." : "最后一条可见系列留着。"}
        </p>
      ) : null}

      {kind === "brush" && stats && stats.count > 0 ? (
        <p className="mt-2 font-mono text-[12px] tabular-nums text-fg-muted">
          {locale === "en" ? "avg" : "均值"} {fmt(stats.avg)}
          <span className="mx-2 text-fg-subtle">·</span>
          {locale === "en" ? "peak" : "峰值"} {fmt(stats.peak)}
          <span className="mx-2 text-fg-subtle">·</span>n={stats.count}
          {brush.frozen ? (
            <span className="ml-2 text-accent">{locale === "en" ? "frozen" : "已冻结"}</span>
          ) : null}
        </p>
      ) : (
        <p className="mt-2 font-mono text-[12px] tabular-nums text-fg-subtle">
          {kind === "drill"
            ? `${path.length === 0 ? (locale === "en" ? "l1" : "一层") : locale === "en" ? "path" : "路径"} ${path.join(" / ") || "—"}`
            : `${dayLabel(Math.max(0, Math.min(DAY_COUNT - 1, liveIndex)), locale)} · ${VISITS[Math.max(0, Math.min(DAY_COUNT - 1, liveIndex))]}`}
        </p>
      )}
    </div>
  );
}

const CLASS_LABEL = {
  read: { zh: "读数", en: "Read" },
  filter: { zh: "过滤", en: "Filter" },
  range: { zh: "框选", en: "Range" },
  window: { zh: "窗口", en: "Window" },
  path: { zh: "路径", en: "Path" },
} as const;

function LinePlot({
  locale,
  kind,
  svgRef,
  series,
  view,
  count,
  yMax,
  brush,
  stats,
  hair,
  highlight,
  tooltip,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerLeave,
}: {
  locale: Locale;
  kind: KindId;
  svgRef: RefObject<SVGSVGElement | null>;
  series: readonly (typeof SERIES)[number][];
  view: { start: number; end: number };
  count: number;
  yMax: number;
  brush: BrushState | null;
  stats: { count: number; avg: number; peak: number } | null;
  hair: number | null;
  highlight: number | null;
  tooltip: number | null;
  onPointerDown: (e: PointerEvent<SVGSVGElement>) => void;
  onPointerMove: (e: PointerEvent<SVGSVGElement>) => void;
  onPointerUp: () => void;
  onPointerLeave: () => void;
}) {
  const ticks = [0, 0.5, 1].map((t) => Math.round(view.start + t * (count - 1)));
  const grid = [0, 1, 2, 3].map((i) => PLOT.y1 - ((PLOT.y1 - PLOT.y0) * i) / 3);

  const localOf = (abs: number) => abs - view.start;
  const inView = (abs: number) => abs >= view.start && abs <= view.end;

  const hairLocal = hair !== null && inView(hair) ? localOf(hair) : null;
  const hiLocal = highlight !== null && inView(highlight) ? localOf(highlight) : null;
  const tipLocal = tooltip !== null && inView(tooltip) ? localOf(tooltip) : null;

  const brushLocal =
    brush && brush.end >= view.start && brush.start <= view.end
      ? {
          start: Math.max(0, localOf(Math.max(brush.start, view.start))),
          end: Math.min(count - 1, localOf(Math.min(brush.end, view.end))),
        }
      : null;

  const tipAbs = tooltip;
  const tipX = tipLocal !== null ? xAt(tipLocal, count, PLOT.x0, PLOT.x1) : 0;
  const tipY =
    tipAbs !== null ? yAt(series[0]!.values[tipAbs] ?? 0, yMax, PLOT.y0, PLOT.y1) : 0;

  const label =
    kind === "crosshair"
      ? locale === "en"
        ? "Daily visits with crosshair"
        : "日访问 · 十字线"
      : locale === "en"
        ? "Daily visits"
        : "日访问";

  return (
    <div className="chart-frame">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${PLOT.w} ${PLOT.h}`}
        role="img"
        aria-label={label}
        className="chart-svg"
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
      >
        {grid.map((y, i) => (
          <line key={i} x1={PLOT.x0} x2={PLOT.x1} y1={y} y2={y} stroke={GRID} strokeWidth={1} />
        ))}

        {brushLocal ? (
          <rect
            x={xAt(brushLocal.start, count, PLOT.x0, PLOT.x1)}
            y={PLOT.y0}
            width={Math.max(
              2,
              xAt(brushLocal.end, count, PLOT.x0, PLOT.x1) -
                xAt(brushLocal.start, count, PLOT.x0, PLOT.x1),
            )}
            height={PLOT.y1 - PLOT.y0}
            fill={ACCENT}
            fillOpacity={brush?.frozen ? 0.16 : 0.1}
          />
        ) : null}

        {series.map((s) => {
          const slice = s.values.slice(view.start, view.end + 1);
          const d = slice
            .map((v, i) => {
              const x = xAt(i, count, PLOT.x0, PLOT.x1);
              const y = yAt(v, yMax, PLOT.y0, PLOT.y1);
              return `${i === 0 ? "M" : "L"} ${x} ${y}`;
            })
            .join(" ");
          const faded = highlight !== null;
          return (
            <path
              key={s.id}
              d={d}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={faded ? 0.28 : 1}
            />
          );
        })}

        {series.length === 1
          ? series[0]!.values.slice(view.start, view.end + 1).map((v, i) => {
              const abs = view.start + i;
              const x = xAt(i, count, PLOT.x0, PLOT.x1);
              const y = yAt(v, yMax, PLOT.y0, PLOT.y1);
              const onHi = hiLocal === i;
              const onHair = hairLocal === i || tipLocal === i;
              const dim = highlight !== null && !onHi;
              return (
                <circle
                  key={abs}
                  cx={x}
                  cy={y}
                  r={onHi ? 6 : onHair ? 4.5 : 3}
                  fill={onHi || onHair ? ACCENT : SERIES[0]!.color}
                  opacity={dim ? 0.22 : 1}
                />
              );
            })
          : null}

        {hairLocal !== null ? (
          <g>
            <line
              x1={xAt(hairLocal, count, PLOT.x0, PLOT.x1)}
              x2={xAt(hairLocal, count, PLOT.x0, PLOT.x1)}
              y1={PLOT.y0}
              y2={PLOT.y1}
              stroke={ACCENT}
              strokeWidth={1}
            />
            <line
              x1={PLOT.x0}
              x2={xAt(hairLocal, count, PLOT.x0, PLOT.x1)}
              y1={yAt(VISITS[hair!]!, yMax, PLOT.y0, PLOT.y1)}
              y2={yAt(VISITS[hair!]!, yMax, PLOT.y0, PLOT.y1)}
              stroke={ACCENT}
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          </g>
        ) : null}

        {hiLocal !== null ? (
          <text
            x={xAt(hiLocal, count, PLOT.x0, PLOT.x1)}
            y={yAt(VISITS[highlight!]!, yMax, PLOT.y0, PLOT.y1) - 10}
            textAnchor="middle"
            fill={FG}
            fontSize={11}
          >
            {highlight === ANOMALY_INDEX
              ? locale === "en"
                ? "dip"
                : "异常"
              : locale === "en"
                ? "peak"
                : "峰值"}{" "}
            {VISITS[highlight!]}
          </text>
        ) : null}

        {ticks.map((abs) => (
          <text
            key={abs}
            x={xAt(localOf(abs), count, PLOT.x0, PLOT.x1)}
            y={PLOT.h - 8}
            textAnchor="middle"
            fill={MUTED}
            fontSize={11}
          >
            {dayLabel(abs, locale)}
          </text>
        ))}
      </svg>

      {tipLocal !== null && tipAbs !== null ? (
        <div
          className="chart-card"
          style={{
            left: `${(tipX / PLOT.w) * 100}%`,
            top: `${(tipY / PLOT.h) * 100}%`,
            transform: tipX > PLOT.w * 0.62 ? "translate(-108%, -12px)" : "translate(8px, -12px)",
          }}
        >
          <p className="text-[11px] text-fg-subtle">{dayLabel(tipAbs, locale)}</p>
          <p className="mt-0.5 text-[13px] font-semibold tabular-nums">{VISITS[tipAbs]}</p>
        </div>
      ) : null}

      {brushLocal && stats && stats.count > 0 && brush?.frozen ? (
        <div
          className="chart-card"
          style={{
            left: `${(xAt(brushLocal.start, count, PLOT.x0, PLOT.x1) / PLOT.w) * 100}%`,
            top: "8px",
            transform: "translate(8px, 0)",
          }}
        >
          <p className="text-[11px] text-fg-subtle">{locale === "en" ? "frozen range" : "冻结区间"}</p>
          <p className="mt-0.5 font-mono text-[12px] tabular-nums">
            {fmt(stats.avg)} / {fmt(stats.peak)}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function BarPlot({
  locale,
  items,
  max,
  onPick,
}: {
  locale: Locale;
  items: { id: string; name: string; value: number; hasChildren: boolean }[];
  max: number;
  onPick: (id: string) => void;
}) {
  const n = Math.max(items.length, 1);
  const innerW = PLOT.x1 - PLOT.x0;
  const slot = innerW / n;
  const barW = slot * 0.55;

  return (
    <div className="chart-frame">
      <svg
        viewBox={`0 0 ${PLOT.w} ${PLOT.h}`}
        role="img"
        aria-label={locale === "en" ? "Source bars" : "来源柱"}
        className="chart-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {[0, 1, 2, 3].map((i) => {
          const y = PLOT.y1 - ((PLOT.y1 - PLOT.y0) * i) / 3;
          return <line key={i} x1={PLOT.x0} x2={PLOT.x1} y1={y} y2={y} stroke={GRID} strokeWidth={1} />;
        })}
        {items.map((item, i) => {
          const h = (item.value / max) * (PLOT.y1 - PLOT.y0);
          const x = PLOT.x0 + i * slot + (slot - barW) / 2;
          const y = PLOT.y1 - h;
          return (
            <g key={item.id}>
              <path
                d={roundTop(x, y, barW, h, 5)}
                fill={ACCENT}
                fillOpacity={item.hasChildren ? 1 : 0.7}
                className="cursor-pointer"
                onClick={() => onPick(item.id)}
              />
              <text x={x + barW / 2} y={y - 6} textAnchor="middle" fill={FG} fontSize={11}>
                {item.value}
              </text>
              <text x={x + barW / 2} y={PLOT.h - 8} textAnchor="middle" fill={MUTED} fontSize={11}>
                {item.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
