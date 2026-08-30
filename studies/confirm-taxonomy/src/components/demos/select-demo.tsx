import { Check } from "lucide-react";
import { useState } from "react";
import { areAllChecklistItemsSelected } from "../../lib/machines";
import { cn } from "../../lib/utils";
import { MacWindow } from "../mac-window";

const CHECKLIST_ITEMS = [
  { id: "docs", title: "全部文档、附件与历史版本", detail: "共 1,842 篇文档 · 6.8 GB 附件数据" },
  { id: "members", title: "成员访问权限与公开外链", detail: "8 位团队成员 · 37 个对外公开分享链接" },
  { id: "keys", title: "自动化工作流与开放 API 密钥", detail: "24 条自动化规则 · 3 个生产 API Key" },
];

export function SelectDemo() {
  const [seed, setSeed] = useState(0);
  return <SelectInner key={seed} onReset={() => setSeed((n) => n + 1)} />;
}

function SelectInner({ onReset }: { onReset: () => void }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({
    docs: false,
    members: false,
    keys: false,
  });
  const [wiped, setWiped] = useState(false);

  const allReady = areAllChecklistItemsSelected(
    checked,
    CHECKLIST_ITEMS.map((i) => i.id),
  );

  return (
    <MacWindow
      title="团队控制台 · 空间注销"
      eyebrow="Workspace Offboarding"
      badge={
        <span className="rounded-full bg-wrong-soft px-2.5 py-0.5 text-[10px] font-medium text-wrong border border-wrong/20">
          最高风险 · 组织级注销
        </span>
      }
      onReset={onReset}
    >
      <div className="px-5 pt-4 pb-6">
        <h3 className="text-base font-semibold text-fg">注销「Sue 的 AI 知识工坊」</h3>
        <p className="mt-0.5 text-xs text-fg-muted">
          组织最高风险操作：全幅独立面板，逐项确认将被抹除的后果，禁止一键跳过
        </p>

        <div className="mt-4 grid overflow-hidden rounded-xl border border-border sm:grid-cols-[0.85fr_1.15fr] shadow-sm">
          {/* Left: Consequence Summary Sidebar */}
          <div className="bg-surface-2 p-4 flex flex-col justify-between border-b sm:border-b-0 sm:border-r border-border">
            <div>
              <span className="text-[10px] font-mono font-semibold tracking-wider text-fg-subtle uppercase">
                Summary of Impact
              </span>
              <h4 className="mt-2 text-sm font-semibold text-fg">组织注销影响概览</h4>
              <p className="mt-1 text-xs leading-relaxed text-fg-muted">
                注销后，所有绑定的自定义域名与访问权限将立即收回，数据将在 24 小时后物理抹除。
              </p>

              <div className="mt-6">
                <span className="font-mono text-3xl font-bold tracking-tight text-fg">
                  {wiped ? "0" : "1,842"}
                </span>
                <p className="text-[11px] text-fg-subtle">篇核心资产与笔记</p>
              </div>
            </div>

            <p className="text-[10px] text-fg-subtle">最后全量快照备份：今天 03:00</p>
          </div>

          {/* Right: Checklist Selection Matrix */}
          <div className="bg-surface p-4">
            <p className="text-xs font-semibold text-fg">请逐项确认下列将被永久清理的内容：</p>
            <p className="mt-0.5 text-[11px] text-fg-muted">需全部勾选后，底部注销按钮才会解锁。</p>

            <ul className="mt-3 space-y-2">
              {CHECKLIST_ITEMS.map((item) => {
                const isChecked = Boolean(checked[item.id]);

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      disabled={wiped}
                      onClick={() =>
                        setChecked((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                      }
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all",
                        isChecked
                          ? "border-wrong/40 bg-wrong-soft/30 shadow-xs"
                          : "border-border bg-surface-2/40 hover:bg-surface-2",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-md border text-white transition-all",
                          isChecked
                            ? "bg-wrong border-wrong"
                            : "border-border bg-surface",
                        )}
                      >
                        {isChecked && <Check className="size-3" strokeWidth={3} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-fg">{item.title}</p>
                        <p className="mt-0.5 text-[11px] text-fg-subtle">{item.detail}</p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              disabled={!allReady || wiped}
              onClick={() => setWiped(true)}
              className="mt-4 flex h-9 w-full items-center justify-center rounded-lg bg-wrong text-xs font-semibold text-white shadow-sm transition-all hover:bg-wrong/90 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {wiped ? "组织空间已成功注销" : "已确认全部影响 · 永久注销团队空间"}
            </button>
          </div>
        </div>
      </div>
    </MacWindow>
  );
}
