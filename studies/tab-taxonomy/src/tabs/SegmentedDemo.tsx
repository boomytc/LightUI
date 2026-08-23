import { useRef, useState } from "react";
import { SALES, SEGMENTED_TABS } from "../lib/fixtures";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Window } from "./Frame";
import { useBox } from "./useBox";

export function SegmentedDemo({
  defaultTab,
  fill = false,
}: { defaultTab?: string; fill?: boolean } = {}) {
  const locale = useLocale();
  const listRef = useRef<HTMLDivElement>(null);
  const allowed = new Set(SEGMENTED_TABS.map((t) => t.id));
  const initial = defaultTab && allowed.has(defaultTab) ? defaultTab : "today";
  const [tab, setTab] = useState(initial);
  const { box, transition } = useBox(listRef, tab, "button");
  const slice = SALES[tab] ?? SALES.today;

  const range =
    tab === "month"
      ? locale === "en"
        ? "This month"
        : "本月"
      : tab === "year"
        ? locale === "en"
          ? "This year"
          : "全年"
        : locale === "en"
          ? "Today"
          : "今日";
  const stats = [
    {
      n: slice.revenue,
      l: locale === "en" ? `${range} · revenue` : `${range}收入`,
      d: slice.revenueDelta,
    },
    { n: slice.orders, l: locale === "en" ? "Orders" : "支付订单", d: slice.ordersDelta },
    { n: slice.pending, l: locale === "en" ? "To ship" : "待发货", d: slice.pendingDelta },
    { n: slice.conv, l: locale === "en" ? "Conv." : "转化率", d: slice.convDelta },
  ];

  const track = (
    <div
      ref={listRef}
      role="tablist"
      aria-label={locale === "en" ? "Range" : "时间范围"}
      className={cn("relative flex rounded-full bg-surface-2 p-1", fill && "w-full")}
    >
      <span
        aria-hidden="true"
        className="absolute top-1 bottom-1 rounded-full bg-surface shadow-card"
        style={{
          left: box.left,
          width: box.width,
          transition,
          transitionDuration: transition === "none" ? "0ms" : "200ms",
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
      {SEGMENTED_TABS.map((item) => {
        const on = item.id === tab;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            data-tab={item.id}
            aria-selected={on}
            onClick={() => setTab(item.id)}
            className={cn(
              "relative z-[1] rounded-full px-3 py-1.5 text-[12px] transition-colors",
              fill ? "min-w-0 flex-1" : "min-w-12",
              on ? "font-medium text-fg" : "text-fg-muted hover:text-fg",
            )}
          >
            {pick(item.label, locale)}
          </button>
        );
      })}
    </div>
  );

  return (
    <Window title={locale === "en" ? "North Shop · metrics" : "North Shop · 经营数据"} fill={fill}>
      <div className={fill ? "flex h-full min-h-0 flex-1 flex-col" : undefined}>
        {fill ? (
          <div className="shrink-0 px-5 pt-4">
            <h3 className="text-[1.15rem] font-semibold tracking-tight">
              {locale === "en" ? "Sales" : "销售表现"}
            </h3>
            <p className="mt-1 text-[13px] text-fg-muted">
              {locale === "en" ? "The same metrics, sliced" : "实时经营数据总览"}
            </p>
            <div className="mt-4">{track}</div>
          </div>
        ) : (
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-[1.15rem] font-semibold tracking-tight">
                {locale === "en" ? "Sales" : "销售表现"}
              </h3>
              <p className="mt-1 text-[13px] text-fg-muted">
                {locale === "en" ? "The same metrics, sliced" : "实时经营数据总览"}
              </p>
            </div>
            {track}
          </div>
        )}

        <div className={cn("tab-swap", fill ? "min-h-0 flex-1 overflow-auto px-5 py-4" : "mt-4")} key={tab}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.l} className="rounded-xl border border-border bg-surface-2 px-3 py-3">
                <p className="text-[11px] text-fg-subtle">{s.l}</p>
                <p className="mt-1 text-[1.2rem] font-semibold tabular-nums">{s.n}</p>
                <p className="text-[11px] text-fg-muted">
                  {s.d} {locale === "en" ? "vs last" : "较上期"}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-[1.4fr_0.8fr]">
            <div>
              <p className="text-[12px] text-fg-muted">
                {locale === "en" ? `${range} by hour` : `${range}分时销售`}
              </p>
              <div className="mt-2 flex h-24 items-end gap-1">
                {slice.bars.map((h, i) => (
                  <span
                    key={i}
                    className={cn("flex-1 rounded-sm", i === 6 ? "bg-fg" : "bg-border-strong")}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-fg-subtle">
                <span>00:00</span>
                <span>12:00</span>
                <span>24:00</span>
              </div>
            </div>
            <div>
              <p className="text-[12px] text-fg-muted">{locale === "en" ? "Channels" : "渠道贡献"}</p>
              <ul className="mt-2 space-y-1.5 text-[12px]">
                {slice.channels.map((c) => (
                  <li key={c.name.zh} className="flex justify-between gap-2">
                    <span className="text-fg-muted">{pick(c.name, locale)}</span>
                    <span className="tabular-nums">{c.n}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Window>
  );
}
