import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { KINDS, type KindId } from "../lib/kinds";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { ActivityForm } from "./ActivityForm";
import { Window } from "./Frame";

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("blur");
  const [formKey, setFormKey] = useState(0);
  const meta = KINDS.find((k) => k.id === active) ?? KINDS[0];

  function select(id: KindId) {
    setActive(id);
    setFormKey((n) => n + 1);
  }

  return (
    <div
      data-playground="validation"
      data-lesson={meta.id}
      className="grid min-w-0 gap-8 lg:grid-cols-[minmax(28rem,32rem)_minmax(0,1fr)] lg:items-start lg:gap-10"
    >
      <section data-pane="lesson" className="min-w-0 lg:order-2">
        <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.12em] text-fg-subtle">
          {locale === "en" ? "When to speak" : "何时开口"}
        </p>

        <nav
          aria-label={locale === "en" ? "Validation timings" : "校验时机"}
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:max-w-sm lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0"
        >
          {KINDS.map((kind, i) => {
            const on = kind.id === active;
            return (
              <div key={kind.id} className="relative min-w-44 shrink-0 lg:min-w-0">
                {i < KINDS.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-[1.75rem] top-[2.85rem] hidden h-[calc(100%-0.55rem)] w-px bg-border lg:block"
                  />
                ) : null}
                <button
                  type="button"
                  data-kind={kind.id}
                  onClick={() => select(kind.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                    on
                      ? "border-border-strong bg-surface shadow-card"
                      : "border-transparent bg-transparent hover:bg-surface-2",
                  )}
                >
                  <span
                    className={cn(
                      "relative z-[1] grid size-8 shrink-0 place-items-center rounded-full font-mono text-[11px] tabular-nums",
                      on ? "bg-accent text-accent-fg" : "bg-surface-2 text-fg-subtle",
                    )}
                  >
                    {kind.index}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium">{kind.name}</span>
                    <span className="block truncate text-[11px] text-fg-muted">{pick(kind.zh, locale)}</span>
                    <span className="mt-0.5 hidden text-[11px] leading-snug text-fg-subtle lg:block">
                      {pick(kind.tells, locale)}
                    </span>
                  </span>
                </button>
              </div>
            );
          })}
        </nav>

        <div className="mt-6">
          <div className="mb-4">
            <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 03</p>
            <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">{meta.name}</h2>
            <p className="mt-1 text-[14px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
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

          <p className="mb-4 text-[13px] leading-relaxed text-fg-muted">
            {locale === "en" ? "Try: " : "试一试："}
            {pick(meta.tryHint, locale)}
          </p>

          <ul className="flex flex-wrap gap-2">
            {meta.rules.map((rule) => (
              <li
                key={rule.zh}
                className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-fg-muted"
              >
                {pick(rule, locale)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div data-pane="form" className="min-w-0 w-full max-w-[32rem] lg:order-1">
        <KindDemo key={`${meta.id}-${formKey}`} id={meta.id} locale={locale} />
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

export function KindDemo({
  id,
  locale,
  state,
}: {
  id: KindId;
  locale: Locale;
  state?: string;
}) {
  const locked = state === "ok" || state === "error" ? state : undefined;
  return (
    <Window
      title={
        locale === "en"
          ? "Activity · when to speak"
          : "配置活动 · 校验时机"
      }
    >
      <ActivityForm lesson={id} locale={locale} locked={locked} />
    </Window>
  );
}
