import { useState } from "react";
import { Check, Copy } from "lucide-react";
import "../align.css";
import { KINDS, type KindId } from "../lib/kinds";
import { aligns, type StageState } from "../lib/machines";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { ComparePane } from "./Frame";
import { SpellFigure } from "./SpellDemo";

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("baseline");
  const meta = KINDS.find((k) => k.id === active) ?? KINDS[0]!;

  return (
    <div className="grid min-w-0 gap-5">
      <nav
        aria-label={locale === "en" ? "Alignment spells" : "对齐咒语"}
        className="flex flex-wrap gap-2"
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
                "inline-flex min-w-0 items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-colors sm:px-3",
                on
                  ? "border-border-strong bg-surface shadow-card"
                  : "border-transparent bg-transparent hover:bg-surface-2",
              )}
            >
              <span className={cn("font-mono text-[11px] tabular-nums", on ? "text-accent" : "text-fg-subtle")}>
                {kind.index}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-medium">{kind.name}</span>
                <span className="block text-[11px] text-fg-muted">{pick(kind.zh, locale)}</span>
              </span>
              <span
                className={cn(
                  "hidden font-mono text-[10px] sm:inline",
                  on ? "text-accent" : "text-fg-subtle",
                )}
              >
                {aligns(kind.id)}
              </span>
            </button>
          );
        })}
      </nav>

      <section className="min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 07</p>
            <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">{meta.name}</h2>
            <p className="mt-1 text-[14px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
          </div>
          <p className="max-w-xs text-[12px] leading-relaxed text-fg-subtle sm:text-right">
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

        <KindDemo id={meta.id} />

        <SpecCard text={pick(meta.spec, locale)} locale={locale} />

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
    <div className="mt-5 rounded-2xl border border-fg bg-fg px-4 py-3.5 text-surface">
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

export function KindDemo({
  id,
  state,
}: {
  id: KindId;
  state?: StageState;
}) {
  const both = state == null;
  return (
    <div
      data-align-kind={id}
      data-align-pair={both ? "pair" : "single"}
      className={both ? "align-pair" : "grid w-full min-w-0"}
    >
      {(both || state === "wrong") && (
        <ComparePane state="wrong">
          <SpellFigure id={id} state="wrong" />
        </ComparePane>
      )}
      {(both || state === "right") && (
        <ComparePane state="right">
          <SpellFigure id={id} state="right" />
        </ComparePane>
      )}
    </div>
  );
}
