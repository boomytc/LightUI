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
}: {
  view: KindId;
  selection: Selection;
  locale: Locale;
  locked?: boolean;
  onSelectKpi?: (id: string) => void;
  onSelectDim?: (id: string) => void;
}) {
  const layer = layerOf(view, selection);
  const kpi = findKpi(selection.kpi);
  const interactive = !locked;

  return (
    <div
      data-kind={view}
      data-layer={layer}
      className="flex min-w-0 flex-col gap-3 overflow-x-hidden"
    >
      <header className="min-w-0">
        <p className="text-[11px] tracking-[0.14em] text-fg-subtle uppercase">
          {pick(BOARD.name, locale)}
        </p>
        <h3 className="mt-0.5 text-[1.05rem] font-semibold tracking-tight">
          {locale === "en"
            ? `For ${pick(BOARD.role, locale)}`
            : `给${pick(BOARD.role, locale)}`}
        </h3>
        <LayerStrip view={view} layer={layer} locale={locale} />
      </header>

      <KpiGrid
        selection={selection}
        locale={locale}
        interactive={interactive && canExpand(view)}
        onSelect={onSelectKpi}
      />

      {showsChart(view) ? <MiniChart kpi={kpi} locale={locale} /> : null}

      {showsDimTable(view, selection) ? (
        <DimTable
          selection={selection}
          locale={locale}
          interactive={interactive && canExpand(view)}
          onSelect={onSelectDim}
        />
      ) : (
        <p className="rounded-xl border border-dashed border-border px-3 py-3 text-[12px] leading-relaxed text-fg-muted">
          {locale === "en"
            ? "Click a KPI. The channel table waits."
            : "点一张 KPI。渠道表还没上场。"}
        </p>
      )}

      {showsDetail(view, selection) ? (
        <DetailCard id={selection.dim} locale={locale} />
      ) : null}
    </div>
  );
}

function LayerStrip({
  view,
  layer,
  locale,
}: {
  view: KindId;
  layer: string;
  locale: Locale;
}) {
  if (view === "platter") {
    return (
      <p className="mt-1 text-[12px] text-fg-muted">
        {locale === "en" ? "All in view · no drill" : "全部在场 · 不钻"}
      </p>
    );
  }
  const steps =
    locale === "en"
      ? [
          { id: "kpi", label: "Result" },
          { id: "dim", label: "Dimension" },
          { id: "detail", label: "Detail" },
        ]
      : [
          { id: "kpi", label: "结果" },
          { id: "dim", label: "维度" },
          { id: "detail", label: "明细" },
        ];
  return (
    <ol className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5 text-[11px]">
      {steps.map((step, i) => {
        const on = step.id === layer;
        const passed =
          (layer === "dim" && step.id === "kpi") ||
          (layer === "detail" && step.id !== "detail");
        return (
          <li key={step.id} className="flex items-center gap-1.5">
            {i > 0 ? <span className="text-fg-subtle">→</span> : null}
            <span
              className={cn(
                "rounded-full px-2 py-0.5",
                on && "bg-fg text-surface",
                passed && "bg-accent-soft text-accent",
                !on && !passed && "bg-surface-2 text-fg-subtle",
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function KpiGrid({
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
    <div className="board-kpis">
      {BOARD.kpis.map((kpi) => {
        const on = selection.kpi === kpi.id;
        return (
          <button
            key={kpi.id}
            type="button"
            data-kpi={kpi.id}
            onClick={interactive ? () => onSelect?.(kpi.id) : undefined}
            className={cn(
              "min-w-0 rounded-xl border bg-surface p-3 text-left",
              on ? "border-accent ring-1 ring-accent" : "border-border",
              interactive && "hover:border-border-strong",
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
            <p className="mt-1 flex flex-wrap gap-x-2 text-[11px] text-fg-subtle">
              <Delta value={kpi.mom} />
            </p>
          </button>
        );
      })}
    </div>
  );
}

function MiniChart({ kpi, locale }: { kpi: KpiRow; locale: Locale }) {
  const max = Math.max(...kpi.spark);
  return (
    <section className="min-w-0 rounded-xl border border-border p-3">
      <p className="text-[12px] font-medium">
        {locale === "en"
          ? `7-day ${pick(kpi.label, locale)}`
          : `近 7 天${pick(kpi.label, locale)}`}
      </p>
      <div className="board-bars mt-3">
        {kpi.spark.map((n, i) => (
          <span
            key={i}
            style={{ height: `${Math.max(8, (n / max) * 100)}%` }}
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
    <section className="min-w-0 overflow-x-hidden rounded-xl border border-border">
      <div className="board-table border-b border-border bg-surface-2 px-3 py-1.5 text-[11px] text-fg-subtle">
        <span className="truncate">{pick(BOARD.dimension, locale)}</span>
        <span className="truncate text-right">{pick(BOARD.primaryLabel, locale)}</span>
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
        "board-table grid w-full items-center border-b border-border px-3 py-2 text-left text-[12px] last:border-b-0",
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
  const up = (data[data.length - 1] ?? 0) >= (data[0] ?? 0);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="shrink-0" aria-hidden>
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
