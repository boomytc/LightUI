import { CheckCheck, Trash2 } from "lucide-react";
import { readStageQuery } from "./lib/stage-query";
import { DEFAULT_ACTIONS_WIDTH, DEFAULT_COMMIT_THRESHOLD } from "./lib/machines";
import { INITIAL_MESSAGES } from "./lib/kinds";
import { cn } from "./lib/utils";

export function StageView() {
  const { openRowId, overswipe } = readStageQuery();
  const offset = overswipe ? -DEFAULT_COMMIT_THRESHOLD : -DEFAULT_ACTIONS_WIDTH;

  return (
    <div
      data-stage="root"
      className="flex min-h-dvh items-center justify-center bg-bg p-4 sm:p-8"
    >
      <div
        data-stage="fixture"
        className="relative flex h-[580px] w-full max-w-[340px] flex-col overflow-hidden rounded-[36px] border border-border bg-surface shadow-2xl"
      >
        {/* Phone Notch */}
        <div className="absolute top-3 left-1/2 z-30 h-4 w-28 -translate-x-1/2 rounded-full bg-border/40" />

        {/* Status bar */}
        <div className="flex items-center justify-between px-7 pt-4 pb-2 text-xs font-medium text-fg-muted">
          <span>9:41</span>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* Header */}
        <div className="px-5 pt-3 pb-2 border-b border-border/60">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-fg">收件箱</h2>
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">
              2 未读
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-fg-muted">向左滑动列表行露出快捷处理动作</p>
        </div>

        {/* Message List Rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/60 bg-surface">
          {INITIAL_MESSAGES.map((msg) => {
            const isOpen = msg.id === openRowId;

            return (
              <div key={msg.id} className="relative overflow-hidden bg-surface">
                {/* Underlay Action Buttons */}
                <div
                  className="absolute inset-y-0 right-0 flex"
                  style={{ width: overswipe ? "100%" : DEFAULT_ACTIONS_WIDTH }}
                >
                  {!overswipe && (
                    <div className="flex flex-1 items-center justify-center bg-accent text-accent-contrast text-xs font-medium gap-1">
                      <CheckCheck className="size-3.5" />
                      <span>已读</span>
                    </div>
                  )}
                  <div className="flex flex-1 items-center justify-center bg-wrong text-white text-xs font-medium gap-1">
                    <Trash2 className="size-3.5" />
                    <span>{overswipe ? "松手直接删除" : "删除"}</span>
                  </div>
                </div>

                {/* Sliding Front Row Card */}
                <div
                  className={cn(
                    "relative z-10 flex items-start gap-3 bg-surface px-4 py-3.5 select-none transition-transform",
                  )}
                  style={{
                    transform: `translate3d(${isOpen ? offset : 0}px, 0, 0)`,
                  }}
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-2 border border-border/80 font-bold text-xs text-accent">
                    {msg.avatarText}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-xs font-semibold text-fg">{msg.sender}</p>
                      <span className="text-[10px] text-fg-subtle">{msg.time}</span>
                    </div>
                    <p className="truncate text-xs font-medium text-fg/90 mt-0.5">{msg.subject}</p>
                    <p className="truncate text-[11px] text-fg-muted mt-0.5">{msg.preview}</p>
                  </div>
                  {msg.unread && (
                    <div className="mt-1 size-1.5 shrink-0 rounded-full bg-accent" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom tab bar simulation */}
        <div className="border-t border-border bg-surface px-6 py-2 flex items-center justify-around text-xs text-fg-muted">
          <span className="text-accent font-semibold">消息</span>
          <span>通讯录</span>
          <span>我的</span>
        </div>

        {/* Stage locked indicator */}
        <div className="absolute top-14 right-4 z-20 rounded-full border border-border/60 bg-surface/90 px-2 py-0.5 text-[10px] font-mono text-fg-muted shadow-sm backdrop-blur-sm">
          locked: row {openRowId} ({offset}px)
        </div>
      </div>
    </div>
  );
}
