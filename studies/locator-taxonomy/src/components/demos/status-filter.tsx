import { useMemo, useState } from "react";
import { countByStatus } from "../../lib/machines";
import { cn } from "../../lib/utils";

type TaskItem = {
  id: string;
  title: string;
  category: string;
  status: "doing" | "pending" | "done";
  statusText: string;
};

const INITIAL_TASKS: TaskItem[] = [
  { id: "1", title: "梳理设计令牌色彩语义表", category: "设计系统", status: "done", statusText: "已完成" },
  { id: "2", title: "实现大纲目录 IntersectionObserver 联动", category: "定位器", status: "doing", statusText: "进行中" },
  { id: "3", title: "编写二次确认阶梯测试用例", category: "安全机制", status: "doing", statusText: "进行中" },
  { id: "4", title: "折叠面板 CSS Grid 动画调优", category: "动效", status: "done", statusText: "已完成" },
  { id: "5", title: "阅读进度指示器分母容错校验", category: "算法", status: "pending", statusText: "待排期" },
  { id: "6", title: "无障碍 reduced-motion 偏好适配", category: "无障碍", status: "pending", statusText: "待排期" },
];

export function StatusFilterDemo() {
  const [filter, setFilter] = useState<string>("all");

  const counts = useMemo(() => countByStatus(INITIAL_TASKS), []);

  const filteredTasks = useMemo(() => {
    if (filter === "all") return INITIAL_TASKS;
    return INITIAL_TASKS.filter((t) => t.status === filter);
  }, [filter]);

  const tabs = [
    { key: "all", label: "全部任务", count: counts.all },
    { key: "doing", label: "进行中", count: counts.doing ?? 0 },
    { key: "pending", label: "待排期", count: counts.pending ?? 0 },
    { key: "done", label: "已完成", count: counts.done ?? 0 },
  ];

  return (
    <div className="h-full overflow-y-auto px-5 py-5 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-fg">工程任务与交付看板</h3>
          <p className="mt-0.5 text-xs text-fg-muted">分面筛选带实时计数，让长列表范围收拢直观可见</p>
        </div>
      </div>

      {/* Status Segmented Chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all",
                active
                  ? "bg-accent text-accent-fg shadow-sm"
                  : "bg-surface-2 text-fg-muted hover:bg-surface-2/80 hover:text-fg border border-border",
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px] font-mono",
                  active ? "bg-accent-fg/20 text-accent-fg" : "bg-surface text-fg-subtle border border-border/40",
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-surface shadow-sm">
        {filteredTasks.map((task) => (
          <li key={task.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-medium text-fg">{task.title}</h4>
              <p className="mt-0.5 text-[11px] text-fg-subtle">{task.category}</p>
            </div>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium border",
                task.status === "done"
                  ? "bg-intent-soft text-intent border-intent/20"
                  : task.status === "doing"
                    ? "bg-accent-soft text-accent border-accent/20"
                    : "bg-surface-2 text-fg-subtle border-border",
              )}
            >
              {task.statusText}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
