import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { MacWindow } from "../mac-window";

type AutomationRule = {
  id: string;
  tag: string;
  name: string;
  trigger: string;
};

const INITIAL_RULES: AutomationRule[] = [
  { id: "1", tag: "邮", name: "新注册线索发送欢迎邮件", trigger: "注册成功即刻触发" },
  { id: "2", tag: "分", name: "高意向客户自动分配销售", trigger: "线索评分 ≥ 85 分" },
  { id: "3", tag: "报", name: "周一早间自动生成数据简报", trigger: "每周一 09:00" },
  { id: "4", tag: "标", name: "长期静默客户自动打标", trigger: "连续 30 天无交互" },
];

export function PopconfirmDemo() {
  const [seed, setSeed] = useState(0);
  return <PopInner key={seed} onReset={() => setSeed((n) => n + 1)} />;
}

function PopInner({ onReset }: { onReset: () => void }) {
  const [rules, setRules] = useState(INITIAL_RULES);
  const [targetId, setTargetId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!targetId) return;
    const handleOutside = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setTargetId(null);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [targetId]);

  const targetRule = rules.find((r) => r.id === targetId);

  return (
    <MacWindow
      title="自动化中心 · 规则编排"
      eyebrow="Flowline Automations"
      badge={
        <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[10px] font-medium text-fg-muted border border-border">
          {rules.length} 条已启用规则
        </span>
      }
      onReset={onReset}
    >
      <div ref={rootRef} className="px-5 pt-4 pb-6">
        <h3 className="text-base font-semibold text-fg">自动化执行规则</h3>
        <p className="mt-0.5 text-xs text-fg-muted">
          中等风险单项操作：贴着触发按钮弹出气泡，无需蒙盖全屏
        </p>

        <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-surface shadow-sm">
          {rules.map((rule) => (
            <li key={rule.id} className="relative flex items-center gap-3 px-4 py-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft font-mono text-xs font-semibold text-accent">
                {rule.tag}
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-medium text-fg">{rule.name}</h4>
                <p className="mt-0.5 text-[11px] text-fg-subtle">{rule.trigger}</p>
              </div>

              {/* Popconfirm Trigger Button */}
              <button
                type="button"
                onClick={() => setTargetId(targetId === rule.id ? null : rule.id)}
                className="rounded-lg p-1.5 text-fg-subtle hover:bg-wrong-soft/60 hover:text-wrong transition-colors"
                aria-label={`移除规则 ${rule.name}`}
              >
                <Trash2 className="size-4" />
              </button>

              {/* Anchored Popconfirm Popover */}
              {targetId === rule.id && targetRule && (
                <div
                  role="dialog"
                  aria-label="确认移除规则"
                  className={cn(
                    "absolute right-4 z-20 w-60 rounded-xl border border-border bg-surface p-3.5 shadow-menu transition-all",
                    rules.indexOf(rule) >= 2 ? "bottom-12" : "top-12",
                  )}
                >
                  <h5 className="text-xs font-semibold text-fg">移除「{targetRule.name}」？</h5>
                  <p className="mt-1 text-[11px] leading-relaxed text-fg-muted">
                    移除后，对应触发条件的业务将立即停止自动处理。
                  </p>

                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetId(null)}
                      className="rounded-md border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-fg-muted hover:bg-surface-2"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRules((prev) => prev.filter((r) => r.id !== targetRule.id));
                        setTargetId(null);
                      }}
                      className="rounded-md bg-wrong px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-wrong/90"
                    >
                      确认移除
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        {rules.length === 0 && (
          <div className="py-12 text-center text-xs text-fg-muted">
            所有自动化规则已全部移除。
          </div>
        )}
      </div>
    </MacWindow>
  );
}
