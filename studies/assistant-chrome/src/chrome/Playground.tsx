import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { CONTRASTS, KINDS, type KindId } from "../lib/kinds";
import { chromeVisible, needsSelection, occupiesPage } from "../lib/machines";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { cn } from "../lib/utils";
import { CanvasDemo } from "./CanvasDemo";
import { ChatDemo } from "./ChatDemo";
import { FloatDemo } from "./FloatDemo";
import { HomeMark } from "./HomeMark";
import { InvisibleDemo } from "./InvisibleDemo";
import { PanelDemo } from "./PanelDemo";
import { PluginDemo } from "./PluginDemo";
import "./chrome.css";

const FLAGS = [
  {
    id: "occupiesPage" as const,
    test: occupiesPage,
    when: { zh: "对话、画布", en: "Chat, canvas" },
  },
  {
    id: "needsSelection" as const,
    test: needsSelection,
    when: { zh: "插件、面板", en: "Plugin, panel" },
  },
  {
    id: "chromeVisible" as const,
    test: chromeVisible,
    when: { zh: "看不见为假", en: "False when invisible" },
  },
];

function typingIn(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.isContentEditable
  );
}

export function Playground({
  active,
  onActive,
}: {
  active: KindId;
  onActive: (id: KindId) => void;
}) {
  const locale = useLocale();
  const meta = KINDS.find((k) => k.id === active) ?? KINDS[0]!;
  const contrast = CONTRASTS.find((row) => row.id === active) ?? CONTRASTS[0]!;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (typingIn(e.target)) return;
      const n = Number(e.key);
      if (n >= 1 && n <= KINDS.length) {
        e.preventDefault();
        onActive(KINDS[n - 1]!.id);
        return;
      }
      const i = KINDS.findIndex((k) => k.id === active);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        onActive(KINDS[(i + 1) % KINDS.length]!.id);
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        onActive(KINDS[(i - 1 + KINDS.length) % KINDS.length]!.id);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, onActive]);

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
          {locale === "en" ? "Where it lives" : "先定住哪"}
        </p>
        <p className="font-mono text-[11px] text-fg-subtle">1–6</p>
      </div>

      <nav
        data-kind-nav
        aria-label={locale === "en" ? "Where the assistant lives" : "助手住哪"}
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6"
      >
        {KINDS.map((kind) => {
          const on = kind.id === active;
          return (
            <button
              key={kind.id}
              type="button"
              data-kind={kind.id}
              aria-pressed={on}
              onClick={() => onActive(kind.id)}
              className={cn(
                "chrome-home flex min-h-[7.25rem] flex-col rounded-2xl border px-2.5 py-2.5 text-left transition-[border-color,background-color,color,box-shadow] duration-200",
                on
                  ? "border-fg bg-fg text-surface shadow-card"
                  : "border-border bg-surface text-fg hover:border-border-strong hover:text-fg",
              )}
            >
              <HomeMark id={kind.id} on={on} />
              <span
                className={cn(
                  "mt-2 font-mono text-[10px] tabular-nums",
                  on ? "text-surface/50" : "text-fg-subtle",
                )}
              >
                {kind.index}
              </span>
              <span className="mt-0.5 text-[13px] font-semibold tracking-tight">
                {pick(kind.zh, locale)}
              </span>
              <span
                className={cn(
                  "mt-0.5 line-clamp-2 text-[11px] leading-snug",
                  on ? "text-surface/55" : "text-fg-subtle",
                )}
              >
                {pick(kind.tells, locale)}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-3 flex flex-wrap gap-2">
        {FLAGS.map((flag) => {
          const on = flag.test(active);
          return (
            <p
              key={flag.id}
              data-flag={flag.id}
              data-on={on ? "true" : "false"}
              className={cn(
                "chrome-flag inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] transition-colors duration-200",
                on
                  ? "border-accent/30 bg-accent-soft text-accent"
                  : "border-border bg-surface text-fg-subtle",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "size-1.5 rounded-full transition-colors duration-200",
                  on ? "bg-accent" : "bg-border-strong",
                )}
              />
              <span className="font-mono">{flag.id}</span>
              <span className={on ? "text-accent/70" : "text-fg-subtle"}>
                {on ? "true" : "false"}
                <span className="mx-1 opacity-40">·</span>
                {pick(flag.when, locale)}
              </span>
            </p>
          );
        })}
      </div>

      <section className="mt-6 min-w-0 overflow-x-hidden">
        <div key={meta.id} className="chrome-copy-in mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 06</p>
            <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">{meta.name}</h2>
            <p className="mt-1 text-[14px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
          </div>
          <p className="max-w-xs text-right text-[12px] leading-relaxed text-fg-subtle">
            {pick(meta.tells, locale)}
          </p>
        </div>

        <div className="mb-4 grid gap-2 sm:grid-cols-2">
          <aside className="rounded-xl border border-border bg-surface-2/70 px-3.5 py-3">
            <p className="text-[10px] font-medium tracking-wide text-fg-subtle uppercase">
              {locale === "en" ? "Always a chat window" : "一律聊天窗"}
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">
              {pick(contrast.naive, locale)}
            </p>
          </aside>
          <aside className="rounded-xl border border-intent/30 bg-intent-soft px-3.5 py-3">
            <p className="text-[10px] font-medium tracking-wide text-intent uppercase">
              {locale === "en" ? "This home" : "按住处分"}
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-fg">
              {pick(contrast.matched, locale)}
            </p>
          </aside>
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {meta.scenes.map((scene) => (
            <span
              key={scene.zh}
              className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent"
            >
              {pick(scene, locale)}
            </span>
          ))}
        </div>

        {meta.note ? <p className="mb-4 text-[13px] text-accent">{pick(meta.note, locale)}</p> : null}

        <SpecCard text={pick(meta.spec, locale)} locale={locale} />

        <KindStage id={meta.id} />

        <ul className="mt-4 flex flex-wrap gap-2">
          {meta.rules.map((rule) => (
            <li
              key={rule.zh}
              className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-fg-muted"
            >
              {pick(rule, locale)}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function KindStage({ id }: { id: KindId }) {
  const reduce = useReducedMotion();
  const ready = useRef(false);

  useEffect(() => {
    ready.current = true;
  }, []);

  return (
    <div data-playground="pane" className="chrome-play chrome-stage min-w-0 w-full">
      <div key={id} className={cn("chrome-stage-pane", ready.current && !reduce && "is-enter")}>
        <KindDemo id={id} />
      </div>
    </div>
  );
}

function SpecCard({ text, locale }: { text: string; locale: Locale }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mb-5 rounded-2xl border border-fg bg-fg px-4 py-3.5 text-surface">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium tracking-wide text-surface/45">
          {locale === "en" ? "Say it this way" : "说清楚"}
        </p>
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-surface/45 transition-colors hover:text-surface"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? (locale === "en" ? "Copied" : "已复制") : locale === "en" ? "Copy" : "复制"}
        </button>
      </div>
      <p className="mt-1.5 text-[14px] leading-relaxed text-surface/90">{text}</p>
    </div>
  );
}

export function KindDemo({ id, state = "default" }: { id: KindId; state?: string }) {
  switch (id) {
    case "chat":
      return <ChatDemo />;
    case "panel":
      return <PanelDemo />;
    case "plugin":
      return <PluginDemo open={state === "open"} />;
    case "float":
      return <FloatDemo />;
    case "canvas":
      return <CanvasDemo />;
    case "invisible":
      return <InvisibleDemo />;
  }
}
