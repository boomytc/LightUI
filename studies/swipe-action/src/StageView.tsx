import { CheckCheck, Trash2 } from "lucide-react";
import { readStageQuery } from "./lib/stage-query";
import { DEFAULT_ACTIONS_WIDTH, DEFAULT_COMMIT_THRESHOLD } from "./lib/machines";
import { INITIAL_MESSAGES } from "./lib/kinds";
import { cn } from "./lib/utils";

export function StageView() {
  const { openRowId, overswipe } = readStageQuery();
  const offset = overswipe ? -DEFAULT_COMMIT_THRESHOLD : -DEFAULT_ACTIONS_WIDTH;
  const tray = overswipe ? "100%" : DEFAULT_ACTIONS_WIDTH;

  return (
    <div data-stage="root" className="flex min-h-dvh w-full items-center justify-center bg-bg p-6 sm:p-8">
      <div
        data-stage="fixture"
        className="relative w-full max-w-[320px] overflow-hidden rounded-[32px] border-4 border-fg/20 bg-surface p-3 shadow-2xl"
      >
        <div className="flex items-center justify-between px-2 pb-3 pt-1">
          <div>
            <p className="text-[10px] font-medium tracking-wider text-fg-subtle uppercase">Inbox</p>
            <h2 className="text-[14px] font-semibold text-fg">消息中心</h2>
          </div>
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent">
            2 未读
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/70 bg-surface-2/40">
          {INITIAL_MESSAGES.slice(0, 4).map((msg) => {
            const isOpen = msg.id === openRowId;

            return (
              <div key={msg.id} className="relative overflow-hidden border-b border-border/70 last:border-b-0">
                <div className="absolute inset-y-0 right-0 flex" style={{ width: isOpen ? tray : DEFAULT_ACTIONS_WIDTH }}>
                  {!(overswipe && isOpen) && (
                    <div className="flex flex-1 flex-col items-center justify-center gap-0.5 bg-accent text-[10px] font-medium text-accent-fg">
                      <CheckCheck className="size-3.5" />
                      <span>已读</span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "flex items-center justify-center gap-1 bg-wrong font-medium text-white",
                      overswipe && isOpen ? "w-full text-[12px] font-semibold" : "flex-1 flex-col text-[10px]",
                    )}
                  >
                    <Trash2 className="size-3.5" />
                    <span>{overswipe && isOpen ? "松手直接删除" : "删除"}</span>
                  </div>
                </div>

                <div
                  className={cn(
                    "relative z-10 flex items-start gap-3 bg-surface px-3.5 py-3",
                    overswipe && isOpen && "shadow-[inset_-8px_0_16px_-8px_rgb(225_29_72_/_0.35)]",
                  )}
                  style={{ transform: `translate3d(${isOpen ? offset : 0}px, 0, 0)` }}
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border/80 bg-surface-2 text-[11px] font-bold text-accent">
                    {msg.avatarText}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[12px] font-semibold text-fg">{msg.sender}</p>
                      <span className="shrink-0 text-[10px] text-fg-subtle">{msg.time}</span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] font-medium text-fg/90">{msg.subject}</p>
                    <p className="mt-0.5 truncate text-[10px] text-fg-muted">{msg.preview}</p>
                  </div>
                  {msg.unread && <div className="mt-1 size-1.5 shrink-0 rounded-full bg-accent" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
