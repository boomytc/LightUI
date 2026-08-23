import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Send, X } from "lucide-react";
import { FLOAT_DOC } from "../lib/fixtures";
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
      <div ref={hostRef} data-float-host className="relative h-full min-w-0 overflow-hidden">
        <article data-float-doc className="chrome-doc h-full overflow-auto overflow-x-hidden px-5 py-5">
          <div className="max-w-2xl">
            <h2 className="text-[1.2rem] font-semibold tracking-tight">{pick(FLOAT_DOC.title, locale)}</h2>
            <p className="mt-0.5 text-[11px] text-fg-subtle">{pick(FLOAT_DOC.meta, locale)}</p>
            <hr className="my-3 border-border" />
            <div className="space-y-4 text-[13px] leading-7 text-fg">
              {FLOAT_DOC.sections.map((section) => (
                <section key={section.heading.zh}>
                  <h3 className="text-[13px] font-semibold">{pick(section.heading, locale)}</h3>
                  <p className="mt-1 text-fg-muted">{pick(section.body, locale)}</p>
                </section>
              ))}
            </div>
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
