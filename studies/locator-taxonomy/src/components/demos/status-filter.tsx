import { useLayoutEffect, useMemo, useState } from "react";
import { useLocatorCopy, useReportLocator } from "../../lib/feedback";
import { countByStatus } from "../../lib/machines";
import { cn } from "../../lib/utils";

type TaskItem = {
  id: string;
  title: string;
  category: string;
  status: "doing" | "pending" | "done" | "blocked";
  statusText: string;
};

const INITIAL_TASKS: TaskItem[] = [
  { id: "1", title: "梳理设计令牌色彩语义", category: "设计系统", status: "done", statusText: "已完成" },
  { id: "2", title: "大纲目录与视口联动", category: "定位器", status: "doing", statusText: "进行中" },
  { id: "3", title: "二次确认阶梯用例", category: "安全机制", status: "doing", statusText: "进行中" },
  { id: "4", title: "折叠面板网格行过渡", category: "动效", status: "done", statusText: "已完成" },
  { id: "5", title: "阅读进度分母容错", category: "算法", status: "pending", statusText: "待排期" },
  { id: "6", title: "减少动效偏好适配", category: "无障碍", status: "pending", statusText: "待排期" },
];

const TABS = [
  { key: "all", label: "全部" },
  { key: "doing", label: "进行中" },
  { key: "pending", label: "待排期" },
  { key: "done", label: "已完成" },
  { key: "blocked", label: "已阻塞" },
] as const;

export function StatusFilterDemo() {
  const report = useReportLocator();
  const { t } = useLocatorCopy();
  const [filter, setFilter] = useState<string>("all");

  const counts = useMemo(() => countByStatus(INITIAL_TASKS), []);

  const filteredTasks = useMemo(() => {
    if (filter === "all") return INITIAL_TASKS;
    return INITIAL_TASKS.filter((task) => task.status === filter);
  }, [filter]);

  const activeTab = TABS.find((tab) => tab.key === filter) ?? TABS[0];

  useLayoutEffect(() => {
    report({
      metric: t("可见范围", "Visible slice"),
      value: `${filteredTasks.length} / ${INITIAL_TASKS.length}`,
      hint:
        filter === "all"
          ? t("未切片", "No facet")
          : `${activeTab.label} · ${counts[filter] ?? 0}`,
      ratio: INITIAL_TASKS.length === 0 ? 0 : filteredTasks.length / INITIAL_TASKS.length,
    });
  }, [activeTab.label, counts, filter, filteredTasks.length, report, t]);

  return (
    <div data-scroller="locator" className="h-full overflow-y-auto px-5 py-5 sm:px-6">
      <div>
        <h3 className="text-base font-semibold tracking-tight text-fg">工程任务</h3>
        <p className="mt-1 text-[12px] text-fg-muted">分面带着计数。切空了就给重置，不假装还有行。</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const count = tab.key === "all" ? counts.all : (counts[tab.key] ?? 0);
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium transition-colors",
                active
                  ? "bg-fg text-surface"
                  : "border border-border bg-surface text-fg-muted hover:bg-surface-2 hover:text-fg",
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 font-mono text-[10px]",
                  active ? "bg-surface/15 text-surface" : "bg-surface-2 text-fg-subtle",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="mt-10 text-center">
          <p className="text-[13px] font-medium text-fg">「{activeTab.label}」里没有任务</p>
          <p className="mt-1 text-[12px] text-fg-muted">切片是空的。计数是 0，不是把旧列表留在那儿。</p>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="mt-4 inline-flex min-h-9 items-center rounded-full bg-fg px-3 text-[12px] font-medium text-surface"
          >
            看全部任务
          </button>
        </div>
      ) : (
        <ul className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface">
          {filteredTasks.map((task, index) => (
            <li
              key={task.id}
              className={cn(
                "flex items-center justify-between gap-3 px-4 py-3",
                index > 0 && "border-t border-border",
              )}
            >
              <div className="min-w-0 flex-1">
                <h4 className="text-[13px] font-medium text-fg">{task.title}</h4>
                <p className="mt-0.5 text-[11px] text-fg-subtle">{task.category}</p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                  task.status === "done" && "border-intent/25 bg-intent-soft text-intent",
                  task.status === "doing" && "border-accent/25 bg-accent-soft text-accent",
                  task.status === "pending" && "border-border bg-surface-2 text-fg-subtle",
                  task.status === "blocked" && "border-wrong/25 bg-wrong-soft text-wrong",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-1.5 rounded-full",
                    task.status === "done" && "bg-intent",
                    task.status === "doing" && "bg-accent",
                    task.status === "pending" && "bg-fg-subtle",
                    task.status === "blocked" && "bg-wrong",
                  )}
                />
                {task.statusText}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
