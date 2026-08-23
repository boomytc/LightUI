import { useState } from "react";
import { Archive, CheckCircle2, FileText, Inbox, LayoutGrid, Map } from "lucide-react";
import { loc, pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Frame } from "./Frame";

const NAV = [
  { id: "inbox", label: loc("收件箱", "Inbox"), icon: Inbox, badge: 4 },
  { id: "tasks", label: loc("我的任务", "My tasks"), icon: CheckCircle2 },
  { id: "roadmap", label: loc("路线图", "Roadmap"), icon: Map },
  { id: "docs", label: loc("文档", "Docs"), icon: FileText },
  { id: "board", label: loc("看板", "Board"), icon: LayoutGrid },
  { id: "archive", label: loc("归档", "Archive"), icon: Archive },
] as const;

const ROWS = [
  [loc("确认首页信息架构", "Confirm the home IA"), loc("进行中", "Doing")],
  [loc("完成移动端适配", "Finish the mobile pass"), loc("待开始", "Todo")],
  [loc("检查按钮交互状态", "Check button states"), loc("进行中", "Doing")],
  [loc("整理交付文档", "Pack the handoff"), loc("已完成", "Done")],
] as const;

export function FloatingDemo() {
  const locale = useLocale();
  const [page, setPage] = useState<(typeof NAV)[number]["id"]>("tasks");
  const current = NAV.find((item) => item.id === page) ?? NAV[1];

  return (
    <Frame title={locale === "en" ? "Morrow · workspace" : "Morrow · 工作台"}>
      <div className="flex min-h-[22rem] min-w-0 gap-3 bg-surface-2 p-3">
        <aside className="flex w-[13.5rem] shrink-0 flex-col rounded-xl bg-fg p-3 text-surface shadow-card">
          <div className="mb-3 flex items-center gap-2 px-1">
            <span className="grid size-7 place-items-center rounded-md bg-accent text-[11px] font-semibold text-accent-fg">
              M
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium">Morrow</p>
              <p className="truncate text-[11px] text-white/45">
                {locale === "en" ? "Site redesign" : "网站改版"}
              </p>
            </div>
          </div>
          <nav className="flex flex-1 flex-col gap-0.5" aria-label={locale === "en" ? "Workspace" : "工作区"}>
            {NAV.map((item) => {
              const Icon = item.icon;
              const on = page === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPage(item.id)}
                  className={cn(
                    "flex h-9 items-center gap-2.5 rounded-md px-2.5 text-left text-[13px]",
                    on ? "bg-white/10 text-surface" : "text-white/55 hover:bg-white/5 hover:text-surface",
                  )}
                >
                  <Icon className="size-3.5 shrink-0" strokeWidth={1.8} />
                  <span className="min-w-0 flex-1 truncate">{pick(item.label, locale)}</span>
                  {"badge" in item && item.badge ? (
                    <span className="text-[11px] text-white/45 tabular-nums">{item.badge}</span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0 flex-1 rounded-xl bg-surface px-4 py-4">
          <p className="truncate text-[12px] text-fg-subtle">
            {locale === "en" ? "Site redesign / " : "网站改版 / "}
            {pick(current.label, locale)}
          </p>
          <h3 className="mt-2 truncate text-[1.2rem] font-semibold tracking-tight">
            {pick(current.label, locale)}
          </h3>
          <ul className="mt-4 space-y-0">
            {ROWS.map((row) => (
              <li key={row[0].zh} className="min-w-0 border-t border-border py-2.5 text-[13px]">
                <p className="truncate">{pick(row[0], locale)}</p>
                <p className="mt-0.5 truncate text-fg-muted">{pick(row[1], locale)}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Frame>
  );
}
