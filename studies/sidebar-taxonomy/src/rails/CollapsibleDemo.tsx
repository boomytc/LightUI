import { useState } from "react";
import { Activity, BarChart3, ChevronLeft, Filter, Gauge, LayoutDashboard } from "lucide-react";
import { loc, pick, useLocale } from "../lib/site-locale";
import { occupyPx } from "../lib/space";
import { cn } from "../lib/utils";
import { Frame } from "./Frame";

const NAV = [
  { id: "home", label: loc("总览", "Overview"), icon: LayoutDashboard },
  { id: "live", label: loc("实时", "Live"), icon: Activity },
  { id: "traffic", label: loc("流量", "Traffic"), icon: BarChart3 },
  { id: "funnel", label: loc("漏斗", "Funnel"), icon: Filter },
  { id: "report", label: loc("报告", "Reports"), icon: Gauge },
] as const;

const KPIS = [
  { label: loc("访问用户", "Visitors"), value: "48,209", delta: "+12.4%" },
  { label: loc("新访", "New"), value: "31,804", delta: "+8.1%" },
  { label: loc("停留", "Stay"), value: "4m 12s", delta: "+22s" },
  { label: loc("转化", "Conv."), value: "6.48%", delta: "+0.7%" },
];

const TREND = [18, 22, 20, 28, 26, 34, 31, 38, 42];

export function CollapsibleDemo() {
  const locale = useLocale();
  const [open, setOpen] = useState(true);
  const [page, setPage] = useState<(typeof NAV)[number]["id"]>("traffic");
  const current = NAV.find((item) => item.id === page) ?? NAV[2];
  const width = occupyPx("collapsible", open);

  return (
    <Frame title={locale === "en" ? "Northstar · analytics" : "Northstar · 分析"}>
      <div className="flex min-h-[22rem] bg-surface-2">
        <aside
          className="flex shrink-0 flex-col bg-fg text-surface"
          style={{
            width,
            transition: "width 250ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <div
            className={cn(
              "flex items-center",
              open ? "h-12 gap-2 px-3" : "flex-col gap-1 px-2 pt-3",
            )}
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-md bg-white/10 text-[11px] font-semibold">
              N
            </span>
            {open ? (
              <span className="min-w-0 flex-1 overflow-hidden text-[13px] font-medium whitespace-nowrap">
                Northstar
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={
                open
                  ? locale === "en"
                    ? "Collapse sidebar"
                    : "收起侧栏"
                  : locale === "en"
                    ? "Expand sidebar"
                    : "展开侧栏"
              }
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-md text-white/45 hover:bg-white/10 hover:text-surface",
                open && "ml-auto",
              )}
            >
              <ChevronLeft
                className={cn("size-3.5 transition-transform duration-200", open ? "" : "rotate-180")}
              />
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 px-2 pb-3" aria-label={locale === "en" ? "Analytics" : "分析导航"}>
            {NAV.map((item) => {
              const Icon = item.icon;
              const on = page === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  title={open ? undefined : pick(item.label, locale)}
                  onClick={() => setPage(item.id)}
                  className={cn(
                    "flex h-9 items-center gap-2.5 rounded-md px-2 text-left text-[13px]",
                    on ? "bg-white/10 text-surface" : "text-white/55 hover:bg-white/5 hover:text-surface",
                  )}
                >
                  <Icon className="size-3.5 shrink-0" strokeWidth={1.8} />
                  <span
                    className={cn(
                      "overflow-hidden whitespace-nowrap",
                      open ? "max-w-40 opacity-100" : "max-w-0 opacity-0",
                    )}
                    style={{
                      transition:
                        "opacity 180ms cubic-bezier(0.22, 1, 0.36, 1), max-width 250ms cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                  >
                    {pick(item.label, locale)}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0 flex-1 px-4 py-4">
          <p className="text-[12px] text-fg-subtle">
            {locale === "en"
              ? `Width ${width}px · the chart eats the rest`
              : `宽度 ${width}px · 主区吃回剩下的`}
          </p>
          <h3 className="mt-1 text-[1.2rem] font-semibold tracking-tight">{pick(current.label, locale)}</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {KPIS.map((kpi) => (
              <div key={kpi.label.zh} className="rounded-lg border border-border bg-surface px-3 py-2.5">
                <p className="text-[11px] text-fg-subtle">{pick(kpi.label, locale)}</p>
                <p className="mt-0.5 text-[1.05rem] font-semibold tabular-nums">{kpi.value}</p>
                <p className="text-[11px] text-accent tabular-nums">{kpi.delta}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg border border-border bg-surface px-3 py-3">
            <p className="mb-2 text-[12px] text-fg-muted">{locale === "en" ? "Visits" : "访问趋势"}</p>
            <div className="flex h-16 items-end gap-1">
              {TREND.map((value, index) => (
                <div
                  key={index}
                  className="min-w-0 flex-1 rounded-sm bg-accent/80"
                  style={{ height: `${Math.round((value / 42) * 100)}%` }}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </Frame>
  );
}
