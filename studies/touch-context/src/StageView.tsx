import { Copy, CornerUpLeft, Forward, ChevronLeft, MoreHorizontal, Smile, Send } from "lucide-react";
import { readStageQuery } from "./lib/stage-query";
import { INITIAL_CHAT } from "./lib/kinds";
import { cn } from "./lib/utils";

export function StageView() {
  const { activeBubbleId } = readStageQuery();
  const activeMsg = INITIAL_CHAT.find((m) => m.id === activeBubbleId) ?? INITIAL_CHAT[1];

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

        {/* Chat App Header */}
        <div className="px-4 py-2 border-b border-border/60 bg-surface flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChevronLeft className="size-4 text-accent" />
            <div>
              <h2 className="text-xs font-semibold text-fg">林工 (前端组)</h2>
              <span className="text-[10px] text-fg-subtle">在线</span>
            </div>
          </div>
          <MoreHorizontal className="size-4 text-fg-muted" />
        </div>

        {/* Chat Feed */}
        <div className="relative flex-1 overflow-y-auto p-4 space-y-3 bg-surface-2/40">
          {INITIAL_CHAT.map((msg) => {
            const isMe = msg.sender === "me";
            const isActive = msg.id === activeMsg.id;

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col",
                  isMe ? "items-end" : "items-start",
                  isActive && "relative z-30",
                )}
              >
                <span className="text-[10px] text-fg-subtle px-1 mb-0.5">{msg.senderName}</span>
                <div
                  className={cn(
                    "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed transition-transform select-none",
                    isMe
                      ? "bg-accent text-accent-contrast rounded-br-xs shadow-xs"
                      : "bg-surface text-fg rounded-bl-xs border border-border/70 shadow-xs",
                    isActive && "relative z-35 ring-2 ring-accent/60 scale-[0.98] shadow-lg",
                  )}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}

          {/* Context Scrim Backdrop */}
          <div className="absolute inset-0 z-20 bg-black/15 backdrop-blur-[0.5px]" />

          {/* Locked Floating Context Menu */}
          <div
            className="absolute z-40 w-36 rounded-2xl border border-border bg-surface shadow-xl divide-y divide-border/60 overflow-hidden animate-fade-in"
            style={
              activeMsg.id === "c1"
                ? { top: "84px", left: "24px" }
                : activeMsg.id === "c3"
                  ? { top: "248px", left: "24px" }
                  : { top: "168px", right: "24px" }
            }
          >
            <div className="flex items-center justify-between px-3 py-2 text-xs font-medium text-fg hover:bg-surface-2">
              <span>复制内容</span>
              <Copy className="size-3.5 text-fg-muted" />
            </div>
            <div className="flex items-center justify-between px-3 py-2 text-xs font-medium text-fg hover:bg-surface-2">
              <span>引用回复</span>
              <CornerUpLeft className="size-3.5 text-fg-muted" />
            </div>
            <div className="flex items-center justify-between px-3 py-2 text-xs font-medium text-fg hover:bg-surface-2">
              <span>转发消息</span>
              <Forward className="size-3.5 text-fg-muted" />
            </div>
          </div>
        </div>

        {/* Chat Input Bar Simulation */}
        <div className="p-3 border-t border-border bg-surface flex items-center gap-2">
          <Smile className="size-4 text-fg-muted" />
          <div className="flex-1 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs text-fg-subtle">
            发消息...
          </div>
          <div className="flex size-7 items-center justify-center rounded-full bg-accent text-accent-contrast">
            <Send className="size-3.5" />
          </div>
        </div>

        {/* Stage locked indicator */}
        <div className="absolute top-14 right-4 z-40 rounded-full border border-border/60 bg-surface/90 px-2 py-0.5 text-[10px] font-mono text-fg-muted shadow-sm backdrop-blur-sm">
          locked: bubble {activeMsg.id}
        </div>
      </div>
    </div>
  );
}
