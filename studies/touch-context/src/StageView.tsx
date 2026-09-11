import { Copy, CornerUpLeft, Forward, ChevronLeft, MoreHorizontal, Smile, Send } from "lucide-react";
import { readStageQuery } from "./lib/stage-query";
import { INITIAL_CHAT } from "./lib/kinds";
import { cn } from "./lib/utils";

export function StageView() {
  const { activeBubbleId } = readStageQuery();
  const activeMsg = INITIAL_CHAT.find((m) => m.id === activeBubbleId) ?? INITIAL_CHAT[1];
  const flipped = activeMsg.id === "c3";
  const menuStyle: Record<string, number | string> =
    activeMsg.id === "c1"
      ? { top: 84, left: 24, "--tc-ox": "36px", "--tc-oy": "0px", "--tc-from-y": "10px" }
      : activeMsg.id === "c3"
        ? { top: 248, left: 24, "--tc-ox": "36px", "--tc-oy": "126px", "--tc-from-y": "-10px" }
        : { top: 168, right: 24, "--tc-ox": "128px", "--tc-oy": "0px", "--tc-from-y": "10px" };

  return (
    <div data-stage="root" className="flex min-h-dvh items-center justify-center bg-bg p-4 sm:p-8">
      <div
        data-stage="fixture"
        className="relative flex h-[580px] w-full max-w-[340px] flex-col overflow-hidden rounded-[36px] border-4 border-fg/15 bg-surface shadow-card"
      >
        <div className="absolute top-3 left-1/2 z-30 h-3.5 w-24 -translate-x-1/2 rounded-full bg-fg/10" />

        <div className="flex items-center justify-between px-7 pt-4 pb-2 text-[11px] font-medium text-fg-muted">
          <span className="tabular-nums">9:41</span>
          <span className="text-[10px]">5G · 100%</span>
        </div>

        <div className="flex items-center justify-between border-b border-border/60 bg-surface px-4 py-2">
          <div className="flex items-center gap-2">
            <ChevronLeft className="size-4 text-accent" />
            <div>
              <h2 className="text-xs font-semibold text-fg">林工 (前端组)</h2>
              <span className="text-[10px] text-fg-subtle">在线</span>
            </div>
          </div>
          <MoreHorizontal className="size-4 text-fg-muted" />
        </div>

        <div className="relative flex-1 space-y-3 overflow-y-auto bg-surface-2/50 p-4">
          {INITIAL_CHAT.map((msg) => {
            const isMe = msg.sender === "me";
            const isActive = msg.id === activeMsg.id;

            return (
              <div
                key={msg.id}
                className={cn("flex flex-col", isMe ? "items-end" : "items-start", isActive && "relative z-30")}
              >
                <span className="mb-0.5 px-1 text-[10px] text-fg-subtle">{msg.senderName}</span>
                <div
                  className={cn(
                    "max-w-[82%] select-none rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed",
                    isMe
                      ? "rounded-br-xs bg-accent text-accent-fg shadow-xs"
                      : "rounded-bl-xs border border-border/70 bg-surface text-fg shadow-xs",
                    isActive && "relative z-35 scale-[0.98] shadow-menu ring-2 ring-accent/50",
                  )}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}

          <div className="tc-scrim absolute inset-0 z-20 bg-fg/15" />

          <div
            className="tc-menu absolute z-40 w-36 overflow-hidden rounded-2xl border border-border bg-surface shadow-menu"
            style={menuStyle}
          >
            {[
              { label: "复制内容", Icon: Copy },
              { label: "引用回复", Icon: CornerUpLeft },
              { label: "转发消息", Icon: Forward },
            ].map((row, i) => (
              <div
                key={row.label}
                style={{ ["--tc-i" as string]: i }}
                className="tc-item flex items-center justify-between border-b border-border/60 px-3 py-2 text-xs font-medium text-fg last:border-b-0"
              >
                <span>{row.label}</span>
                <row.Icon className="size-3.5 text-fg-muted" />
              </div>
            ))}
          </div>

          <span className="absolute top-3 right-3 z-40 rounded-full border border-border bg-surface/90 px-2 py-0.5 font-mono text-[10px] text-fg-muted">
            {flipped ? "flip ↑" : "attach ↓"} · {activeMsg.id}
          </span>
        </div>

        <div className="flex items-center gap-2 border-t border-border bg-surface p-3">
          <Smile className="size-4 text-fg-muted" />
          <div className="flex-1 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs text-fg-subtle">
            发消息...
          </div>
          <div className="flex size-7 items-center justify-center rounded-full bg-accent text-accent-fg">
            <Send className="size-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
