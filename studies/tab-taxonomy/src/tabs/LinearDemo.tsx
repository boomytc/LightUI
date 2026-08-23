import { useRef, useState } from "react";
import {
  LINEAR_ACTIVITY,
  LINEAR_FILES,
  LINEAR_TABS,
  LINEAR_TASKS,
} from "../lib/fixtures";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { TableHead, TableRow, Window } from "./Frame";
import { useBox } from "./useBox";

export function LinearDemo({
  defaultTab,
  fill = false,
}: { defaultTab?: string; fill?: boolean } = {}) {
  const locale = useLocale();
  const listRef = useRef<HTMLDivElement>(null);
  const allowed = new Set(LINEAR_TABS.map((t) => t.id));
  const initial = defaultTab && allowed.has(defaultTab) ? defaultTab : "overview";
  const [tab, setTab] = useState(initial);
  const { box, transition } = useBox(listRef, tab, "label");

  return (
    <Window title={locale === "en" ? "Orbit · site refresh" : "Orbit · 官网改版"} fill={fill}>
      <div className={fill ? "flex h-full min-h-0 flex-1 flex-col" : undefined}>
        <div className={fill ? "shrink-0 px-5 pt-4" : undefined}>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-fg-subtle">
            {locale === "en" ? "Orbit · project" : "Orbit · 项目"}
          </p>
          <h3 className="mt-1 text-[1.15rem] font-semibold tracking-tight">{linearHeading(tab, locale).title}</h3>
          <p className="mt-1 text-[13px] text-fg-muted">{linearHeading(tab, locale).sub}</p>
        </div>

        <div
          ref={listRef}
          role="tablist"
          aria-label={locale === "en" ? "Project sections" : "项目栏目"}
          className={cn(
            "relative grid grid-cols-4 border-b border-border",
            fill ? "mt-4 shrink-0 px-2 sm:px-5" : "mt-5",
          )}
        >
          {LINEAR_TABS.map((item) => {
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
                  "flex min-h-11 items-center justify-center px-2 py-3 text-[13px] transition-colors",
                  on ? "font-medium text-fg" : "text-fg-muted hover:text-fg",
                )}
              >
                <span data-tab-label>{pick(item.label, locale)}</span>
              </button>
            );
          })}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 h-0.5 bg-fg"
            style={{
              left: box.left,
              width: box.width,
              transition,
              transitionDuration: transition === "none" ? "0ms" : "200ms",
              transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </div>

        <div className={cn("tab-swap", fill ? "min-h-0 flex-1 overflow-auto px-5 py-4" : "mt-4")} key={tab}>
          {tab === "overview" ? <Overview locale={locale} /> : null}
          {tab === "tasks" ? <Tasks locale={locale} /> : null}
          {tab === "files" ? <Files locale={locale} /> : null}
          {tab === "activity" ? <Activity locale={locale} /> : null}
        </div>
      </div>
    </Window>
  );
}

function linearHeading(tab: string, locale: "zh" | "en"): { title: string; sub: string } {
  if (tab === "tasks") {
    return locale === "en"
      ? { title: "Tasks", sub: "12 open this week" }
      : { title: "任务", sub: "本周 12 项待办" };
  }
  if (tab === "files") {
    return locale === "en"
      ? { title: "Delivery files", sub: "Design files and the archive" }
      : { title: "交付文件", sub: "设计稿与交付归档" };
  }
  if (tab === "activity") {
    return locale === "en"
      ? { title: "Activity", sub: "Who changed what" }
      : { title: "动态", sub: "谁改了什么" };
  }
  return locale === "en"
    ? { title: "Overview", sub: "Status and the week ahead" }
    : { title: "项目概览", sub: "项目当前状态与近期进度" };
}

function Overview({ locale }: { locale: "zh" | "en" }) {
  const cells = [
    { n: "68%", l: locale === "en" ? "Overall" : "整体进度", s: locale === "en" ? "+12% this week" : "较上周 +12%" },
    { n: "12", l: locale === "en" ? "This week" : "本周待办", s: locale === "en" ? "3 need you" : "3 项需要关注" },
    { n: "14", l: locale === "en" ? "In collab" : "协作成员", s: locale === "en" ? "9 online today" : "今天 9 人在线" },
    { n: locale === "en" ? "Tue" : "周二", l: locale === "en" ? "Next review" : "下次评审", s: "14:30" },
  ];
  return (
    <div className="grid h-full grid-cols-2 content-start gap-2 sm:grid-cols-4">
      {cells.map((c) => (
        <div key={c.l} className="rounded-xl border border-border bg-surface-2 px-3 py-3">
          <p className="text-[1.35rem] font-semibold tabular-nums">{c.n}</p>
          <p className="mt-1 text-[12px] text-fg-muted">{c.l}</p>
          <p className="text-[11px] text-fg-subtle">{c.s}</p>
        </div>
      ))}
    </div>
  );
}

function Tasks({ locale }: { locale: "zh" | "en" }) {
  return (
    <ul className="space-y-3">
      {LINEAR_TASKS.map((task) => (
        <li key={task.title.zh}>
          <div className="flex items-center justify-between text-[13px]">
            <span className="font-medium">{pick(task.title, locale)}</span>
            <span className="text-fg-subtle">
              {pick(task.when, locale)} · {task.pct}%
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full bg-fg transition-[width] duration-500" style={{ width: `${task.pct}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Files({ locale }: { locale: "zh" | "en" }) {
  return (
    <div>
      <TableHead
        cells={
          locale === "en"
            ? ["File", "Type", "Owner", "Ver", "Updated"]
            : ["文件名", "类型", "负责人", "版本", "更新时间"]
        }
      />
      {LINEAR_FILES.map((row) => (
        <TableRow key={row.name} cells={[row.name, row.type, row.owner, row.ver, pick(row.when, locale)]} />
      ))}
      <p className="mt-3 text-[12px] text-fg-subtle">
        {locale === "en" ? "24 files · 1 / 2" : "共 24 个文件 · 上一页 1 / 2 下一页"}
      </p>
    </div>
  );
}

function Activity({ locale }: { locale: "zh" | "en" }) {
  return (
    <ul className="space-y-3">
      {LINEAR_ACTIVITY.map((row) => (
        <li key={row.what.zh} className="flex items-start justify-between gap-3 text-[13px]">
          <p>
            <span className="font-medium">{row.who}</span>{" "}
            <span className="text-fg-muted">{pick(row.what, locale)}</span>
          </p>
          <span className="shrink-0 text-[12px] text-fg-subtle">{pick(row.when, locale)}</span>
        </li>
      ))}
    </ul>
  );
}
