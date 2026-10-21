import { useState } from "react";
import type { KpiRow } from "../lib/dashboard-data";
import {
  historyFor,
  PERIODS,
  trendWindow,
  windowChange,
  type Period,
} from "../lib/trend";
import { pick, type Locale } from "../lib/site-locale";

export function MiniChart({
  kpi,
  locale,
  locked,
}: {
  kpi: KpiRow;
  locale: Locale;
  locked: boolean;
}) {
  const [period, setPeriod] = useState<Period>(7);
  const values = trendWindow(historyFor(kpi.spark), period);
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  const points = values
    .map(
      (value, i) =>
        `${8 + (i / (values.length - 1)) * 304},${100 - ((value - min) / span) * 84}`,
    )
    .join(" ");
  const change = windowChange(values);
  return (
    <section
      data-trend-samples={values.length}
      className="min-w-0 rounded-xl border border-border bg-surface p-3"
    >
      <p className="text-[12px] font-medium">
        {locale === "en"
          ? `${period}-day ${pick(kpi.label, locale)}`
          : `近 ${period} 天${pick(kpi.label, locale)}`}
      </p>
      {!locked && (
        <div
          className="mt-2 flex flex-wrap gap-2"
          role="group"
          aria-label={locale === "en" ? "Trend window" : "趋势窗口"}
        >
          {PERIODS.map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={period === n}
              onClick={() => setPeriod(n)}
              className={`rounded-full border border-border px-2 py-1 text-xs ${period === n ? "bg-fg text-surface" : "bg-surface-2"}`}
            >
              {locale === "en" ? `${n} days` : `近 ${n} 天`}
            </button>
          ))}
        </div>
      )}
      <svg
        role="img"
        aria-label={
          locale === "en"
            ? `${pick(kpi.label, locale)} illustrative trend`
            : `${pick(kpi.label, locale)}示例趋势`
        }
        viewBox="0 0 320 112"
        className="mt-3 w-full"
      >
        <polyline
          points={points}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2"
        />
      </svg>
      <p className="text-xs text-fg-muted" aria-live="polite">
        {locale === "en" ? "Window endpoint change: " : "窗口首尾变化："}
        {change === null
          ? "—"
          : `${change > 0 ? "+" : ""}${change.toFixed(1)}%`}
      </p>
      <p className="mt-1 text-[10px] text-fg-subtle">
        {locale === "en"
          ? "Illustrative data; window controls this trend only. KPI and channel table show the latest snapshot."
          : "示例数据；窗口仅改变这条趋势，KPI 与渠道表保持最新快照。"}
      </p>
    </section>
  );
}
