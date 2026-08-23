import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { CHAT_SEED } from "../lib/fixtures";
import { KINDS } from "../lib/kinds";
import { shouldSendOnEnter } from "../lib/machines";
import { pick, readLocale, useLocale, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Window } from "./Frame";

type Msg = { id: string; role: "user" | "assistant"; content: string };

function seedMessages(locale: Locale): Msg[] {
  return CHAT_SEED.map((item, i) => ({
    id: `seed-${i}`,
    role: item.role,
    content: pick(item.text, locale),
  }));
}

function fakeReply(prompt: string, locale: Locale): string {
  const short = /清单|list|check/i.test(prompt);
  if (locale === "en") {
    return short
      ? "Six items is enough. Keep P0 closed the same day."
      : "Tease three days early. Ship the main film Friday. Recap Sunday night.";
  }
  return short ? "收到 6 项就够。P0 当天闭环。" : "预热提前三天。周五发主片，周日晚上复盘。";
}

export function ChatDemo() {
  const locale = useLocale();
  const meta = KINDS[0]!;
  const [messages, setMessages] = useState<Msg[]>(() => seedMessages(readLocale()));
  const [draft, setDraft] = useState("");
  const composing = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  function send(text: string) {
    const prompt = text.trim();
    if (!prompt) return;
    setDraft("");
    setMessages((prev) => [
      ...prev,
      { id: `u-${prev.length}`, role: "user", content: prompt },
      { id: `a-${prev.length}`, role: "assistant", content: fakeReply(prompt, locale) },
    ]);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(draft);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Enter" || e.shiftKey) return;
    const ne = e.nativeEvent;
    if (!shouldSendOnEnter(composing.current || ne.isComposing, ne.keyCode)) return;
    e.preventDefault();
    send(draft);
  }

  return (
    <Window title={pick(meta.window, locale)}>
      <div data-chat className="flex h-full min-w-0 flex-col overflow-x-hidden">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <span className="grid size-7 place-items-center rounded-full bg-accent text-[11px] font-semibold text-accent-fg">
            {locale === "en" ? "A" : "助"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium">{locale === "en" ? "Assistant" : "助手"}</p>
            <p className="text-[11px] text-fg-subtle">{locale === "en" ? "Online" : "在线 · 秒回"}</p>
          </div>
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden px-3 py-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[min(82%,40rem)] whitespace-pre-wrap rounded-2xl px-3 py-2 text-[13px] leading-relaxed",
                m.role === "user"
                  ? "ml-auto rounded-tr-md bg-accent text-accent-fg"
                  : "rounded-tl-md bg-surface-2 text-fg",
              )}
            >
              {m.content}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <form className="flex items-end gap-2 border-t border-border p-2.5" onSubmit={onSubmit}>
          <textarea
            value={draft}
            rows={1}
            placeholder={locale === "en" ? "Ask another" : "继续问点别的"}
            onChange={(e) => setDraft(e.target.value)}
            onCompositionStart={() => {
              composing.current = true;
            }}
            onCompositionEnd={() => {
              composing.current = false;
            }}
            onKeyDown={onKeyDown}
            className="min-h-9 min-w-0 flex-1 resize-none rounded-xl border border-border bg-surface px-3 py-2 text-[13px] outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label={locale === "en" ? "Send" : "发送"}
            className="grid size-9 shrink-0 place-items-center rounded-xl bg-fg text-surface disabled:opacity-40"
          >
            <Send className="size-3.5" />
          </button>
        </form>
      </div>
    </Window>
  );
}
