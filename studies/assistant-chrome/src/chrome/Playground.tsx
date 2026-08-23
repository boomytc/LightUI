import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { KINDS, type KindId } from "../lib/kinds";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { CanvasDemo } from "./CanvasDemo";
import { ChatDemo } from "./ChatDemo";
import { FloatDemo } from "./FloatDemo";
import { InvisibleDemo } from "./InvisibleDemo";
import { PanelDemo } from "./PanelDemo";
import { PluginDemo } from "./PluginDemo";
import "./chrome.css";

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("chat");
  const meta = KINDS.find((k) => k.id === active) ?? KINDS[0]!;

  return (
    <div className="min-w-0">
      <nav
        data-kind-nav
        aria-label={locale === "en" ? "Where the assistant lives" : "助手住哪"}
        className="mb-5 flex flex-wrap gap-2"
      >
        {KINDS.map((kind) => {
          const on = kind.id === active;
          return (
            <button
              key={kind.id}
              type="button"
              data-kind={kind.id}
              onClick={() => setActive(kind.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
                on
                  ? "border-fg bg-fg text-surface"
                  : "border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg",
              )}
            >
              {pick(kind.zh, locale)}
            </button>
          );
        })}
      </nav>

      <section className="min-w-0 overflow-x-hidden">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 06</p>
            <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">{meta.name}</h2>
            <p className="mt-1 text-[14px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
          </div>
          <p className="max-w-xs text-right text-[12px] leading-relaxed text-fg-subtle">
            {pick(meta.tells, locale)}
          </p>
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

        <div data-playground="pane" className="chrome-play min-w-0 w-full">
          <KindDemo key={meta.id} id={meta.id} />
        </div>

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
