import { Check, Lock } from "lucide-react";
import { useLayoutEffect, useState } from "react";
import { useLocatorCopy, useReportLocator } from "../../lib/feedback";
import { canNavigateStep } from "../../lib/machines";
import { cn } from "../../lib/utils";

const STEPS = [
  { id: 0, title: "基本配置", desc: "工作区名称与命名空间" },
  { id: 1, title: "权限矩阵", desc: "成员角色与访问规则" },
  { id: 2, title: "集成确认", desc: "Webhook 与通知" },
  { id: 3, title: "完成交付", desc: "初始化就绪" },
];

export function StepperDemo() {
  const report = useReportLocator();
  const { t } = useLocatorCopy();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("Sue's Knowledge Lab");
  const [role, setRole] = useState("admin");

  useLayoutEffect(() => {
    const current = STEPS[step];
    report({
      metric: t("阶段进度", "Stage index"),
      value: `${step + 1} / ${STEPS.length} · ${current.title}`,
      hint:
        step === 0
          ? t("还不能越级向前", "Cannot skip ahead")
          : step < STEPS.length - 1
            ? t("已完成步可回看", "Completed steps are reviewable")
            : t("流程已闭合", "Flow is closed"),
      ratio: (step + 1) / STEPS.length,
    });
  }, [report, step, t]);

  function next() {
    if (step < STEPS.length - 1) setStep((value) => value + 1);
  }

  function prev() {
    if (step > 0) setStep((value) => value - 1);
  }

  function go(idx: number) {
    if (canNavigateStep(idx, step, STEPS.length)) setStep(idx);
  }

  return (
    <div data-scroller="locator" className="h-full overflow-y-auto px-5 py-5 sm:px-6">
      <div>
        <h3 className="text-base font-semibold tracking-tight text-fg">创建工作区向导</h3>
        <p className="mt-1 text-[12px] text-fg-muted">
          步骤索引跟表单同步。回看可以，向前跳步不行。
        </p>
      </div>

      <nav aria-label="步骤条" className="mt-5">
        <ol className="flex items-start gap-2">
          {STEPS.map((item, idx) => {
            const isDone = idx < step;
            const isCurrent = idx === step;
            const canJump = canNavigateStep(idx, step, STEPS.length);

            return (
              <li key={item.id} className="min-w-0 flex-1">
                <button
                  type="button"
                  disabled={!canJump}
                  onClick={() => go(idx)}
                  className={cn(
                    "group flex w-full flex-col text-left",
                    canJump ? "cursor-pointer" : "cursor-not-allowed",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full text-[11px] font-semibold transition-colors",
                        isDone && "bg-intent text-accent-fg",
                        isCurrent && "bg-accent text-accent-fg ring-4 ring-accent/20",
                        !isDone && !isCurrent && "border border-border bg-surface-2 text-fg-subtle",
                      )}
                    >
                      {isDone ? (
                        <Check className="size-3.5" strokeWidth={3} />
                      ) : canJump ? (
                        idx + 1
                      ) : (
                        <Lock className="size-3" strokeWidth={2.4} />
                      )}
                    </span>
                    {idx < STEPS.length - 1 && (
                      <span
                        className={cn(
                          "h-1 flex-1 rounded-full transition-colors",
                          idx < step ? "bg-intent" : "bg-surface-2",
                        )}
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-[12px] font-medium",
                      isCurrent ? "text-fg" : "text-fg-subtle",
                    )}
                  >
                    {item.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="mt-6 rounded-xl border border-border bg-surface p-5 shadow-sm">
        <div key={step} className="locator-in">
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
                  onChange={(event) => setName(event.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-border bg-surface px-3 text-[13px] text-fg outline-none focus:border-accent focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-fg">第二步：默认权限角色</h4>
              <div className="space-y-2">
                {[
                  { key: "admin", label: "管理员", desc: "读写与成员配置" },
                  { key: "editor", label: "编辑者", desc: "可改文档，不能改账单" },
                  { key: "viewer", label: "只读成员", desc: "浏览与导出" },
                ].map((item) => (
                  <label
                    key={item.key}
                    className={cn(
                      "flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                      role === item.key
                        ? "border-accent bg-accent-soft/50"
                        : "border-border bg-surface hover:bg-surface-2",
                    )}
                  >
                    <input
                      type="radio"
                      name="role"
                      checked={role === item.key}
                      onChange={() => setRole(item.key)}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-[13px] font-medium text-fg">{item.label}</p>
                      <p className="text-[11px] text-fg-muted">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-fg">第三步：集成与推送确认</h4>
              <p className="text-[13px] leading-relaxed text-fg-muted">
                将为「{name}」绑定默认通知通道。高危操作会进审计，不会在这一步偷偷提交。
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3 py-3 text-center">
              <span className="inline-flex size-11 items-center justify-center rounded-full bg-intent-soft text-intent">
                <Check className="size-5" strokeWidth={3} />
              </span>
              <h4 className="text-sm font-semibold text-fg">工作区已就绪</h4>
              <p className="text-[12px] text-fg-muted">阶段闭合。这不是一条 toast，是流程的最后一格。</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4">
          <button
            type="button"
            disabled={step === 0}
            onClick={prev}
            className="inline-flex min-h-10 items-center rounded-lg border border-border bg-surface px-3.5 text-[12px] font-medium text-fg-muted hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            上一步
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="inline-flex min-h-10 items-center rounded-lg bg-accent px-4 text-[12px] font-medium text-accent-fg hover:bg-accent/90"
            >
              下一步
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep(0)}
              className="inline-flex min-h-10 items-center rounded-lg bg-intent px-4 text-[12px] font-medium text-accent-fg hover:bg-intent/90"
            >
              重新配置
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
