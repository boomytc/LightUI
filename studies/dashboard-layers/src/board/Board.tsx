import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import {
  BOARD,
  findDim,
  findKpi,
  type DimRow,
  type KpiRow,
} from "../lib/dashboard-data";
import { formatDelta, formatValue } from "../lib/format";
import {
  canExpand,
  layerOf,
  showsChart,
  showsDetail,
  showsDimTable,
  type KindId,
  type Layer,
  type Selection,
} from "../lib/machines";
import { pick, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";

export function Board({
  view,
  selection,
  locale,
  locked = false,
  onSelectKpi,
  onSelectDim,
  onRetreat,
}: {
  view: KindId;
  selection: Selection;
  locale: Locale;
  locked?: boolean;
  onSelectKpi?: (id: string) => void;
  onSelectDim?: (id: string) => void;
  onRetreat?: (to: "kpi" | "dim") => void;
}) {
  const layer = layerOf(view, selection);
  const kpi = findKpi(selection.kpi);
  const interactive = !locked;

  return (
    <div
      data-kind={view}
      data-layer={layer}
      className="board-pane overflow-x-hidden"
    >
      <header className="board-head">
        <p className="text-[11px] tracking-[0.14em] text-fg-subtle uppercase">
          {pick(BOARD.name, locale)}
        </p>
        <h3 className="mt-0.5 text-[1.05rem] font-semibold tracking-tight">
          {locale === "en"
            ? `For ${pick(BOARD.role, locale)}`
            : `给${pick(BOARD.role, locale)}`}
        </h3>
        <LayerStrip
          view={view}
          layer={layer}
          locale={locale}
          interactive={interactive}
          onRetreat={onRetreat}
        />
      </header>

      <div className="board-kpi-col">
        <KpiGrid
          view={view}
          selection={selection}
          locale={locale}
          interactive={interactive}
          onSelect={onSelectKpi}
        />
      </div>

      <div className="board-grain">
        {showsChart(view) ? <MiniChart key={kpi.id} kpi={kpi} locale={locale} /> : null}

        <div className="board-dim-slot">
          {canExpand(view) ? (
            <Reveal open={layer === "kpi"}>
              <WaitCue locale={locale} />
            </Reveal>
          ) : null}
          <Reveal open={showsDimTable(view, selection)}>
            <DimTable
              selection={selection}
              locale={locale}
              interactive={interactive}
              onSelect={onSelectDim}
            />
          </Reveal>
        </div>

        {canExpand(view) ? (
          <Reveal open={showsDetail(view, selection)} late>
            <DetailCard id={selection.dim} locale={locale} />
          </Reveal>
        ) : null}
      </div>
    </div>
  );
}

function Reveal({
  open,
  late = false,
  children,
}: {
  open: boolean;
  late?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("board-reveal", late && "board-reveal-late")}
      data-open={open || undefined}
      aria-hidden={!open}
      {...(!open ? { inert: true } : {})}
    >
      <div className="board-reveal-inner">{children}</div>
    </div>
  );
}

function LayerStrip({
  view,
  layer,
  locale,
  interactive,
  onRetreat,
}: {
  view: KindId;
  layer: Layer;
  locale: Locale;
  interactive: boolean;
  onRetreat?: (to: "kpi" | "dim") => void;
}) {
  if (view === "platter") {
    const pips =
      locale === "en"
        ? [
            { id: "kpi", label: "KPI" },
            { id: "chart", label: "Chart" },
            { id: "table", label: "Table" },
          ]
        : [
            { id: "kpi", label: "KPI" },
            { id: "chart", label: "图" },
            { id: "table", label: "表" },
          ];
    return (
      <div className="board-presence">
        {pips.map((pip) => (
          <span key={pip.id} className="board-presence-pip">
            <i aria-hidden="true" />
            {pip.label}
          </span>
        ))}
        <p className="text-[12px] text-fg-muted">
          {locale === "en" ? "All in view · no drill" : "全部在场 · 不钻"}
        </p>
      </div>
    );
  }

  const steps =
    locale === "en"
      ? [
          { id: "kpi" as const, label: "Result" },
          { id: "dim" as const, label: "Dimension" },
          { id: "detail" as const, label: "Detail" },
        ]
      : [
          { id: "kpi" as const, label: "结果" },
          { id: "dim" as const, label: "维度" },
          { id: "detail" as const, label: "明细" },
        ];

  return (
    <ol className="board-track" aria-label={locale === "en" ? "Drill depth" : "下钻深度"}>
      {steps.map((step, i) => {
        const on = step.id === layer;
        const passed =
          (layer === "dim" && step.id === "kpi") ||
          (layer === "detail" && step.id !== "detail");
        const retreatTo = step.id === "kpi" || step.id === "dim" ? step.id : null;
        const live =
          Boolean(interactive && retreatTo && onRetreat) &&
          ((step.id === "kpi" && layer !== "kpi") || (step.id === "dim" && layer === "detail"));

        return (
          <li key={step.id} className="flex items-center">
            {i > 0 ? (
              <span className="board-track-rail" data-filled={passed || on || undefined} aria-hidden="true">
                <i />
              </span>
            ) : null}
            <button
              type="button"
              className="board-track-step"
              data-on={on}
              data-passed={passed}
              data-live={live}
              aria-current={on ? "step" : undefined}
              disabled={!live}
              onClick={live && retreatTo ? () => onRetreat?.(retreatTo) : undefined}
            >
              <span className="board-track-dot" aria-hidden="true" />
              <span className="board-track-label">{step.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function WaitCue({ locale }: { locale: Locale }) {
  return (
    <div className="board-wait" data-wait="dim">
      <p className="board-wait-kicker">
        {locale === "en" ? "Next layer waits" : "下一层在等"}
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">
        {locale === "en"
          ? "Click a KPI. The channel table waits."
          : "点一张 KPI。渠道表还没上场。"}
      </p>
      <div className="board-wait-ghost" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

function KpiGrid({
  view,
  selection,
  locale,
  interactive,
  onSelect,
}: {
  view: KindId;
  selection: Selection;
  locale: Locale;
  interactive: boolean;
  onSelect?: (id: string) => void;
}) {
  const drill = canExpand(view);
  return (
    <div className="board-kpis">
      {BOARD.kpis.map((kpi) => {
        const on = selection.kpi === kpi.id;
        const muted = drill && Boolean(selection.kpi) && !on;
        return (
          <button
            key={kpi.id}
            type="button"
            data-kpi={kpi.id}
            onClick={interactive ? () => onSelect?.(kpi.id) : undefined}
            className={cn(
              "board-kpi",
              on && "board-kpi-on",
              muted && "board-kpi-dim",
              interactive && "board-kpi-live",
              !interactive && "cursor-default",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] text-fg-muted">{pick(kpi.label, locale)}</p>
              <Spark data={kpi.spark} />
            </div>
            <p className="mt-1 text-[1.2rem] font-semibold tabular-nums tracking-tight">
              {formatValue(kpi.value, kpi.unit)}
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-fg-subtle">
              <Delta value={kpi.mom} />
              {on ? (
                <span className="truncate">{pick(kpi.hint, locale)}</span>
              ) : null}
            </p>
            {drill && interactive && !selection.kpi ? (
              <span className="board-kpi-go">
                {locale === "en" ? "Open grain" : "展开下一层"}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function MiniChart({ kpi, locale }: { kpi: KpiRow; locale: Locale }) {
  const max = Math.max(...kpi.spark);
  return (
    <section className="min-w-0 rounded-xl border border-border bg-surface p-3">
      <p className="text-[12px] font-medium">
        {locale === "en"
          ? `7-day ${pick(kpi.label, locale)}`
          : `近 7 天${pick(kpi.label, locale)}`}
      </p>
      <div className="board-bars mt-3">
        {kpi.spark.map((n, i) => (
          <span
            key={i}
            style={{
              height: `${Math.max(8, (n / max) * 100)}%`,
              animationDelay: `${i * 42}ms`,
            }}
          />
        ))}
      </div>
    </section>
  );
}

function DimTable({
  selection,
  locale,
  interactive,
  onSelect,
}: {
  selection: Selection;
  locale: Locale;
  interactive: boolean;
  onSelect?: (id: string) => void;
}) {
  return (
    <section className="min-w-0 overflow-x-hidden rounded-xl border border-border bg-surface">
      <div className="board-table border-b border-border bg-surface-2 px-3 py-1.5 text-[11px] text-fg-subtle">
        <span className="truncate">{pick(BOARD.dimension, locale)}</span>
        <span className="truncate text-right">{pick(BOARD.primaryLabel, locale)}</span>
        <span className="board-table-extra truncate text-right">
          {locale === "en" ? "Share" : "占比"}
        </span>
        <span className="truncate text-right">
          {locale === "en" ? "MoM" : "环比"}
        </span>
      </div>
      {BOARD.dimensions.map((row) => (
        <DimLine
          key={row.id}
          row={row}
          active={selection.dim === row.id}
          locale={locale}
          interactive={interactive}
          onSelect={onSelect}
        />
      ))}
    </section>
  );
}

function DimLine({
  row,
  active,
  locale,
  interactive,
  onSelect,
}: {
  row: DimRow;
  active: boolean;
  locale: Locale;
  interactive: boolean;
  onSelect?: (id: string) => void;
}) {
  const culprit = row.id === BOARD.insight.culpritId;
  return (
    <button
      type="button"
      data-dim={row.id}
      onClick={interactive ? () => onSelect?.(row.id) : undefined}
      className={cn(
        "board-table board-table-line grid w-full items-center border-b border-border px-3 text-left text-[12px] last:border-b-0",
        culprit && "bg-accent-soft/60",
        active && "bg-accent-soft",
        interactive && !active && "hover:bg-surface-2",
        !interactive && "cursor-default",
      )}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <span className="truncate font-medium">{pick(row.name, locale)}</span>
        {culprit ? (
          <span className="shrink-0 rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-medium text-accent">
            {locale === "en" ? "Cause" : "主因"}
          </span>
        ) : null}
      </span>
      <span className="truncate text-right tabular-nums">
        {formatValue(row.primary, "number")}
      </span>
      <span className="board-table-extra truncate text-right tabular-nums text-fg-muted">
        {row.share.toFixed(1)}%
      </span>
      <span className="justify-self-end">
        <Delta value={row.mom} />
      </span>
    </button>
  );
}

function DetailCard({ id, locale }: { id: string | null; locale: Locale }) {
  const row = findDim(id);
  if (!row) return null;
  const culprit = row.id === BOARD.insight.culpritId || row.flag === "drop";
  return (
    <section
      data-detail={row.id}
      className="min-w-0 rounded-xl border border-border bg-surface-2 p-3"
    >
      <p className="text-[11px] font-medium tracking-wide text-accent">
        {locale === "en" ? "Detail" : "短明细"}
      </p>
      <p className="mt-0.5 text-[14px] font-semibold">{pick(row.name, locale)}</p>
      <p className="mt-1 flex flex-wrap gap-x-3 text-[12px] text-fg-muted">
        <span className="tabular-nums">
          {pick(BOARD.primaryLabel, locale)} {formatValue(row.primary, "number")}
        </span>
        <Delta value={row.mom} />
        <span className="tabular-nums">{row.share.toFixed(1)}%</span>
      </p>
      {row.children?.length ? (
        <ul className="mt-2 space-y-1">
          {row.children.map((child) => (
            <li
              key={child.id}
              className="flex items-center justify-between gap-2 text-[12px]"
            >
              <span className="min-w-0 truncate">
                {pick(child.name, locale)}
                {child.flag === "drop" ? (
                  <span className="ml-1 text-[10px] text-accent">
                    {locale === "en" ? "drag" : "拖累"}
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 tabular-nums text-fg-muted">
                {formatValue(child.primary, "number")}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {culprit ? (
        <p className="mt-2 text-[12px] leading-relaxed text-fg-muted">
          {pick(BOARD.insight.body, locale)}
        </p>
      ) : null}
    </section>
  );
}

function Spark({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const w = 56;
  const h = 22;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const first = data[0] ?? 0;
  const last = data[data.length - 1] ?? 0;
  const up = last >= first;
  const area = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="shrink-0" aria-hidden>
      <polygon
        points={area}
        fill={up ? "var(--color-intent)" : "var(--color-fg-muted)"}
        opacity="0.16"
      />
      <polyline
        points={pts}
        fill="none"
        stroke={up ? "var(--color-intent)" : "var(--color-fg-muted)"}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Delta({ value }: { value: number }) {
  const up = value > 0;
  const down = value < 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 tabular-nums font-medium",
        up && "text-intent",
        down && "text-fg",
        !up && !down && "text-fg-muted",
      )}
    >
      {value !== 0 ? <Icon className="size-3" strokeWidth={2.2} /> : null}
      {formatDelta(value)}
    </span>
  );
}
