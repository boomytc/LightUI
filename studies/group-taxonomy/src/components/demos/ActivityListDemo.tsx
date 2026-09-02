import { useState } from "react";
import type { GroupMode } from "../../lib/machines.js";

const ITEMS = [
  { id: 1, title: "产品原型已更新", meta: "项目工作台 · Atlas", time: "09:42", status: "刚刚", unread: true },
  { id: 2, title: "新增 12 条用户反馈", meta: "项目工作台 · Atlas", time: "昨天", status: "已读", unread: false },
  { id: 3, title: "季度报告已归档", meta: "项目工作台 · Atlas", time: "周一", status: "已读", unread: false },
  { id: 4, title: "成员权限已调整", meta: "项目工作台 · Atlas", time: "8 月 21 日", status: "已读", unread: false },
  { id: 5, title: "设计规范已发布", meta: "项目工作台 · Atlas", time: "8 月 18 日", status: "已读", unread: false },
];

function Cards() {
  return (
    <div className="p-5 sm:p-6 bg-surface-2/40">
      <h3 className="mb-3 text-sm font-semibold text-fg">最近活动（卡片网格）</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ITEMS.map((item) => (
          <article key={item.id} className="rounded-xl border border-border bg-surface p-3.5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-surface-2 font-mono text-[0.7rem] font-bold text-fg-muted border border-border">
                {item.id}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-fg">{item.title}</p>
                  <span className={`shrink-0 text-[0.65rem] font-medium ${item.unread ? "text-accent" : "text-fg-subtle"}`}>
                    {item.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-fg-muted">{item.meta}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Grouped() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const rows = filter === "unread" ? ITEMS.filter((i) => i.unread) : ITEMS;

  return (
    <div className="px-3 py-5 sm:px-5 sm:py-6 bg-surface">
      <div className="mb-2 flex items-center justify-between px-3">
        <h3 className="text-lg font-bold text-fg">最近活动</h3>
        <div className="flex rounded-full border border-border bg-surface-2 p-0.5 text-xs">
          <button
            type="button"
            className={`h-7 rounded-full px-3 transition-colors ${
              filter === "all" ? "bg-surface text-fg shadow-sm border border-border" : "text-fg-muted hover:text-fg"
            }`}
            onClick={() => setFilter("all")}
          >
            全部
          </button>
          <button
            type="button"
            className={`h-7 rounded-full px-3 transition-colors ${
              filter === "unread" ? "bg-surface text-fg shadow-sm border border-border" : "text-fg-muted hover:text-fg"
            }`}
            onClick={() => setFilter("unread")}
          >
            未读
          </button>
        </div>
      </div>
      <ul className="divide-y divide-border">
        {rows.map((item) => (
          <li
            key={item.id}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-3.5 px-3 py-3.5 transition-colors hover:bg-surface-2"
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-surface-2 font-mono text-[0.7rem] text-fg-muted border border-border">
              {item.id}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-fg">{item.title}</p>
              <p className="truncate text-xs text-fg-muted">{item.meta}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-xs text-fg-subtle tabular-nums">{item.time}</p>
              <p className={`text-[0.65rem] font-medium ${item.unread ? "text-accent" : "text-fg-subtle"}`}>
                {item.status}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ActivityListDemo({ mode }: { mode: GroupMode }) {
  return (
    <div className="relative min-h-[360px]">
      <div
        className={`transition-opacity duration-200 ${
          mode === "cards" ? "opacity-100" : "opacity-0 pointer-events-none absolute inset-0"
        }`}
      >
        <Cards />
      </div>
      <div
        className={`transition-opacity duration-200 ${
          mode === "grouped" ? "opacity-100" : "opacity-0 pointer-events-none absolute inset-0"
        }`}
      >
        <Grouped />
      </div>
    </div>
  );
}
