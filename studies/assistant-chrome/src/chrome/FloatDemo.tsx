import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Send, X } from "lucide-react";
import { KINDS } from "../lib/kinds";
import { shouldSendOnEnter } from "../lib/machines";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Window } from "./Frame";

export function FloatDemo() {
  const locale = useLocale();
  const meta = KINDS[3]!;
  const hostRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(locale === "en" ? "Summarize this doc" : "帮我总结这份文档");
  const [answer, setAnswer] = useState<string | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const composing = useRef(false);
  const drag = useRef<{ dx: number; dy: number; moved: boolean } | null>(null);

  function ask() {
    const prompt = draft.trim();
    if (!prompt) return;
    setAnswer(
      locale === "en"
        ? "Weekly ship held. Recap moves to Friday. Checklist 12 → 6. P0 same day."
        : "周更稳定；复盘改周五；清单 12→6；P0 当天闭环。",
    );
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key !== "Enter") return;
    const ne = e.nativeEvent;
    if (!shouldSendOnEnter(composing.current || ne.isComposing, ne.keyCode)) return;
    e.preventDefault();
    ask();
  }

  function onPointerDown(e: PointerEvent<HTMLButtonElement>) {
    const host = hostRef.current;
    if (!host) return;
    const rect = host.getBoundingClientRect();
    drag.current = {
      dx: e.clientX - rect.left - (rect.width - 52 + pos.x),
      dy: e.clientY - rect.top - (rect.height - 52 + pos.y),
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent<HTMLButtonElement>) {
    if (!drag.current) return;
    const host = hostRef.current;
    if (!host) return;
    drag.current.moved = true;
    const rect = host.getBoundingClientRect();
    const nx = e.clientX - rect.left - drag.current.dx - (rect.width - 52);
    const ny = e.clientY - rect.top - drag.current.dy - (rect.height - 52);
    setPos({
      x: Math.min(0, Math.max(nx, 56 - rect.width)),
      y: Math.min(0, Math.max(ny, 56 - rect.height)),
    });
  }

  return (
    <Window title={pick(meta.window, locale)}>
      <div ref={hostRef} className="relative h-full min-w-0 overflow-hidden">
        <article className="h-full overflow-auto overflow-x-hidden px-4 py-4">
          <h2 className="text-[1.05rem] font-semibold tracking-tight">
            {locale === "en" ? "Q3 product recap" : "Q3 产品复盘纪要"}
          </h2>
          <p className="mt-0.5 text-[11px] text-fg-subtle">
            {locale === "en" ? "18 Aug · Room B · Lin" : "8 月 18 日 14:00 · 会议室 B"}
          </p>
          <hr className="my-3 border-border" />
          <div className="space-y-1.5 text-[13px] leading-6 text-fg">
            <p>{locale === "en" ? "1. Weekly ship held; two early releases." : "一、周更节奏整体稳定，两次提前发布。"}</p>
            <p>{locale === "en" ? "2. Recap moves to Friday afternoon." : "二、复盘会改成每周五下午，全员参加。"}</p>
            <p>{locale === "en" ? "3. Checklist 12 → 6 items." : "三、发布清单从 12 项精简到 6 项。"}</p>
            <p>{locale === "en" ? "4. P0 feedback closes the same day." : "四、用户反馈分级，P0 当天闭环。"}</p>
          </div>
        </article>

        {open ? (
          <div className="chrome-float-composer min-w-0 rounded-2xl border border-border bg-surface p-2.5 shadow-card">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[11px] font-medium text-accent">{locale === "en" ? "Ask one thing" : "问一句"}</p>
              <button
                type="button"
                aria-label={locale === "en" ? "Close" : "关闭"}
                className="rounded-md p-1 text-fg-muted hover:text-fg"
                onClick={() => setOpen(false)}
              >
                <X className="size-3.5" />
              </button>
            </div>
            <div className="flex min-w-0 gap-1.5">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onCompositionStart={() => {
                  composing.current = true;
                }}
                onCompositionEnd={() => {
                  composing.current = false;
                }}
                onKeyDown={onKeyDown}
                className="h-8 min-w-0 flex-1 rounded-lg border border-border bg-surface px-2 text-[12px] outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={ask}
                className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-accent-fg"
                aria-label={locale === "en" ? "Send" : "发送"}
              >
                <Send className="size-3.5" />
              </button>
            </div>
            {answer ? <p className="mt-2 text-[12px] leading-relaxed text-fg">{answer}</p> : null}
          </div>
        ) : null}

        <button
          type="button"
          aria-label={locale === "en" ? "Open assistant" : "唤起助手"}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={() => {
            const moved = drag.current?.moved;
            drag.current = null;
            if (!moved) {
              setOpen((v) => !v);
              setAnswer(null);
            }
          }}
          style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
          className={cn(
            "chrome-float-ball grid place-items-center rounded-full bg-accent text-[12px] font-semibold text-accent-fg shadow-card",
            open && "opacity-90",
          )}
        >
          AI
        </button>
      </div>
    </Window>
  );
}
