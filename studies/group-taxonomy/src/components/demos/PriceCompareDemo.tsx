import { useState } from "react";
import type { GroupMode } from "../../lib/machines.js";

const PLANS = [
  {
    name: "Starter",
    price: "¥49",
    per: "/月",
    features: ["8K 上下文窗口", "1 位团队成员", "标准格式导出", "社区技术支持"],
  },
  {
    name: "Pro",
    price: "¥99",
    per: "/月",
    features: ["32K 上下文窗口", "3 位团队成员", "高清无损导出", "工单优先支持"],
  },
  {
    name: "Team",
    price: "¥199",
    per: "/月",
    features: ["128K 上下文窗口", "10 位团队成员", "批量自动化导出", "专属客户成功支持"],
  },
];

function Cards({ selected, onSelect }: { selected: string; onSelect: (name: string) => void }) {
  return (
    <div className="p-5 sm:p-6 bg-surface-2/40">
      <h3 className="mb-3 text-sm font-semibold text-fg">产品方案对比（三张孤立卡片）</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {PLANS.map((plan) => {
          const isSelected = selected === plan.name;
          return (
            <button
              key={plan.name}
              type="button"
              onClick={() => onSelect(plan.name)}
              className={`rounded-xl border bg-surface p-4 text-left shadow-sm transition-all ${
                isSelected
                  ? "border-accent ring-2 ring-accent/30"
                  : "border-border hover:border-border-strong"
              }`}
            >
              <p className="text-sm font-semibold text-fg">{plan.name}</p>
              <p className="mt-2 text-2xl font-bold text-accent tabular-nums">
                {plan.price}
                <span className="ml-0.5 text-xs font-normal text-fg-muted">{plan.per}</span>
              </p>
              <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
                {plan.features.map((f) => (
                  <li key={f} className="text-xs text-fg-muted">
                    • {f}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Grouped({ selected, onSelect }: { selected: string; onSelect: (name: string) => void }) {
  return (
    <div className="px-2 py-5 sm:px-4 sm:py-6 bg-surface">
      <h3 className="mb-3 px-4 text-lg font-bold text-fg">产品方案对比</h3>
      <div className="grid grid-cols-1 divide-y sm:divide-y-0 sm:grid-cols-3 sm:divide-x divide-border rounded-xl border border-border bg-surface overflow-hidden">
        {PLANS.map((plan) => {
          const isSelected = selected === plan.name;
          return (
            <button
              key={plan.name}
              type="button"
              onClick={() => onSelect(plan.name)}
              className={`px-5 py-5 text-left transition-colors ${
                isSelected ? "bg-accent-soft/40 dark:bg-accent-soft/10" : "hover:bg-surface-2"
              }`}
            >
              <p className="text-sm font-semibold text-fg">{plan.name}</p>
              <p className="mt-3 text-3xl font-bold text-accent tabular-nums">
                {plan.price}
                <span className="ml-1 text-sm font-normal text-fg-muted">{plan.per}</span>
              </p>
              <ul className="mt-5 space-y-2 border-t border-border pt-4">
                {plan.features.map((f) => (
                  <li key={f} className="text-xs text-fg-muted">
                    • {f}
                  </li>
                ))}
              </ul>
              <span
                className={`mt-6 inline-flex h-8 items-center justify-center rounded-full px-4 text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-accent text-accent-fg shadow-sm"
                    : "border border-border bg-surface-2 text-fg-muted hover:text-fg"
                }`}
              >
                {isSelected ? "已选方案" : "选择方案"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PriceCompareDemo({ mode }: { mode: GroupMode }) {
  const [selected, setSelected] = useState("Pro");

  return (
    <div className="relative min-h-[360px]">
      <div
        className={`transition-opacity duration-200 ${
          mode === "cards" ? "opacity-100" : "opacity-0 pointer-events-none absolute inset-0"
        }`}
      >
        <Cards selected={selected} onSelect={setSelected} />
      </div>
      <div
        className={`transition-opacity duration-200 ${
          mode === "grouped" ? "opacity-100" : "opacity-0 pointer-events-none absolute inset-0"
        }`}
      >
        <Grouped selected={selected} onSelect={setSelected} />
      </div>
    </div>
  );
}
