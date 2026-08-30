import { Check } from "lucide-react";
import { useState } from "react";
import { canNavigateStep } from "../../lib/machines";
import { cn } from "../../lib/utils";

const STEPS = [
  { id: 0, title: "基本配置", desc: "设置工作区名称与命名空间" },
  { id: 1, title: "权限矩阵", desc: "分配成员角色与访问规则" },
  { id: 2, title: "集成确认", desc: "配置 Webhook 与通知" },
  { id: 3, title: "完成交付", desc: "初始化就绪" },
];

export function StepperDemo() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("Sue's Knowledge Lab");
  const [role, setRole] = useState("admin");

  function next() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    }
  }

  function prev() {
    if (step > 0) {
      setStep((s) => s - 1);
    }
  }

  function go(idx: number) {
    if (canNavigateStep(idx, step, STEPS.length)) {
      setStep(idx);
    }
  }

  return (
    <div className="h-full overflow-y-auto px-5 py-5 sm:px-6">
      <div>
        <h3 className="text-base font-semibold text-fg">创建工作区向导</h3>
        <p className="mt-0.5 text-xs text-fg-muted">步骤索引与任务表单强同步，允许回看但禁止越级跳步</p>
      </div>

      {/* Stepper Bar */}
      <nav aria-label="步骤条" className="mt-5">
        <ol className="flex items-center justify-between gap-2">
          {STEPS.map((s, idx) => {
            const isDone = idx < step;
            const isCurrent = idx === step;
            const canJump = canNavigateStep(idx, step, STEPS.length);

            return (
              <li key={s.id} className="flex-1">
                <button
                  type="button"
                  disabled={!canJump}
                  onClick={() => go(idx)}
                  className={cn(
                    "group flex w-full flex-col gap-1 text-left transition-all",
                    canJump ? "cursor-pointer" : "cursor-not-allowed opacity-50",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full text-xs font-semibold transition-all",
                        isDone
                          ? "bg-intent text-accent-fg"
                          : isCurrent
                            ? "bg-accent text-accent-fg ring-4 ring-accent/20"
                            : "bg-surface-2 text-fg-subtle border border-border",
                      )}
                    >
                      {isDone ? <Check className="size-3.5" strokeWidth={3} /> : idx + 1}
                    </span>
                    <div
                      className={cn(
                        "h-1 flex-1 rounded-full",
                        isDone ? "bg-intent" : "bg-surface-2",
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "mt-1 text-xs font-medium",
                      isCurrent ? "text-fg" : "text-fg-subtle",
                    )}
                  >
                    {s.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Step Content Form */}
      <div className="mt-6 rounded-xl border border-border bg-surface p-5 shadow-sm">
        {step === 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-fg">第一步：工作区基本信息</h4>
            <div>
              <label className="block text-xs font-medium text-fg-muted" htmlFor="ws-name">
                工作区名称
              </label>
              <input
                id="ws-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs text-fg outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-fg">第二步：默认权限角色</h4>
            <div className="space-y-2">
              {[
                { key: "admin", label: "管理员 (Admin)", desc: "具备所有读写与成员配置权限" },
                { key: "editor", label: "编辑者 (Editor)", desc: "可创建与修改文档，无法修改账单" },
                { key: "viewer", label: "只读成员 (Viewer)", desc: "仅具备浏览与导出权限" },
              ].map((r) => (
                <label
                  key={r.key}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all",
                    role === r.key
                      ? "border-accent bg-accent-soft/40"
                      : "border-border bg-surface hover:bg-surface-2",
                  )}
                >
                  <input
                    type="radio"
                    name="role"
                    checked={role === r.key}
                    onChange={() => setRole(r.key)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-xs font-medium text-fg">{r.label}</p>
                    <p className="text-[11px] text-fg-muted">{r.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-fg">第三步：集成与推送确认</h4>
            <p className="text-xs text-fg-muted leading-relaxed">
              将为「{name}」绑定默认通知 Webhook，所有高危操作将发送至安全审计通道。
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 text-center py-4">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-intent-soft text-intent">
              <Check className="size-5" strokeWidth={3} />
            </span>
            <h4 className="text-sm font-semibold text-fg">工作区已就绪</h4>
            <p className="text-xs text-fg-muted">已根据配置完成所有环境与权限初始化。</p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
          <button
            type="button"
            disabled={step === 0}
            onClick={prev}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-fg-muted hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            上一步
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="rounded-lg bg-accent px-4 py-1.5 text-xs font-medium text-accent-fg hover:bg-accent/90"
            >
              下一步
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep(0)}
              className="rounded-lg bg-intent px-4 py-1.5 text-xs font-medium text-accent-fg hover:bg-intent/90"
            >
              重新配置
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
