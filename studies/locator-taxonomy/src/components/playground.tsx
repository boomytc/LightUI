import { useEffect, useState } from "react";
import { LocatorSignalProvider } from "../lib/feedback";
import {
  INTENTS,
  PATTERNS,
  intentOf,
  patternBySlug,
  type IntentKey,
  type PatternSlug,
} from "../lib/kinds";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { BrowserFrame } from "./browser-frame";
import { AccordionDemo } from "./demos/accordion";
import { AnchorNavDemo } from "./demos/anchor-nav";
import { BackToTopDemo } from "./demos/back-to-top";
import { ReadingProgressDemo } from "./demos/reading-progress";
import { SearchDemo } from "./demos/search";
import { StatusFilterDemo } from "./demos/status-filter";
import { StepperDemo } from "./demos/stepper";

function renderDemo(slug: PatternSlug) {
  switch (slug) {
    case "progress":
      return <ReadingProgressDemo />;
    case "back-to-top":
      return <BackToTopDemo />;
    case "anchor":
      return <AnchorNavDemo />;
    case "stepper":
      return <StepperDemo />;
    case "accordion":
      return <AccordionDemo />;
    case "search":
      return <SearchDemo />;
    case "status-filter":
      return <StatusFilterDemo />;
    default:
      return null;
  }
}

export function Playground() {
  const locale = useLocale();
  const [selected, setSelected] = useState<PatternSlug>("progress");
  const [seed, setSeed] = useState(0);

  const current = patternBySlug(selected);
  const activeIntent = intentOf(selected);

  function selectIntent(key: IntentKey) {
    const intent = INTENTS.find((item) => item.key === key);
    if (!intent) return;
    if (!intent.slugs.includes(selected)) {
      setSelected(intent.slugs[0]);
    }
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (event.key >= "1" && event.key <= "7") {
        const next = PATTERNS[Number(event.key) - 1];
        if (next) {
          event.preventDefault();
          setSelected(next.slug);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div data-playground="locator" data-kind={selected} className="space-y-5">
      <div>
        <p className="mb-3 text-[12px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
          {locale === "en" ? "First name the intent" : "先定意图"}
        </p>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {INTENTS.map((intent) => {
            const on = intent.key === activeIntent.key;
            return (
              <button
                key={intent.key}
                type="button"
                data-intent={intent.key}
                onClick={() => selectIntent(intent.key)}
                className={cn(
                  "min-h-[5.5rem] rounded-2xl border px-3.5 py-3 text-left transition-colors",
                  on
                    ? "border-border-strong bg-play-glow shadow-card"
                    : "border-border bg-surface hover:bg-surface-2",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-[10px] tracking-[0.14em]",
                    on ? "text-accent" : "text-fg-subtle",
                  )}
                >
                  {intent.index}
                </span>
                <span className="mt-1 block text-[14px] font-semibold tracking-tight text-fg">
                  {pick(intent.title, locale)}
                </span>
                <span className="mt-1 block text-[11px] leading-snug text-fg-muted">
                  {pick(intent.ask, locale)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label={locale === "en" ? "Locator models" : "定位器模型"} className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {INTENTS.map((intent, index) => (
              <div key={intent.key} className="flex items-center gap-1.5">
                {index > 0 && (
                  <span aria-hidden="true" className="mr-1 hidden h-4 w-px bg-border sm:block" />
                )}
                {intent.slugs.map((slug) => {
                  const pat = patternBySlug(slug);
                  const on = selected === slug;
                  return (
                    <button
                      key={slug}
                      type="button"
                      data-kind={slug}
                      onClick={() => setSelected(slug)}
                      className={cn(
                        "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium transition-colors",
                        on
                          ? "bg-fg text-surface shadow-sm"
                          : "border border-border bg-surface text-fg-muted hover:bg-surface-2 hover:text-fg",
                      )}
                    >
                      <span className={cn("font-mono text-[10px]", on ? "text-surface/60" : "text-accent")}>
                        {pat.id}
                      </span>
                      {pick(pat.name, locale)}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </nav>
        <p className="hidden text-[11px] text-fg-subtle sm:block">
          <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px]">
            1
          </kbd>
          –
          <kbd className="ml-0.5 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px]">
            7
          </kbd>
          <span className="ml-1.5">{locale === "en" ? "switch model" : "切换模型"}</span>
        </p>
      </div>

      <LocatorSignalProvider
        key={`${selected}-${seed}`}
        initial={{
          metric: pick(current.metric, locale),
          value: "—",
          ratio: 0,
        }}
      >
        <BrowserFrame
          title={pick(current.name, locale)}
          eyebrow={`${locale === "en" ? "Locator" : "定位器"} ${current.id} · ${pick(activeIntent.title, locale)}`}
          showSignal
          badge={
            <span className="hidden rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-medium text-accent sm:inline">
              {pick(current.eyebrow, locale)}
            </span>
          }
          onReset={() => setSeed((n) => n + 1)}
        >
          <div key={`${selected}-${seed}`} className="locator-in h-full">
            {renderDemo(selected)}
          </div>
        </BrowserFrame>
      </LocatorSignalProvider>

      <div className="grid gap-3 rounded-2xl border border-border bg-surface px-4 py-4 sm:grid-cols-3 sm:px-5">
        <div className="min-w-0">
          <p className="text-[10px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
            {locale === "en" ? "Job" : "目的"}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-fg">{pick(current.purpose, locale)}</p>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
            {locale === "en" ? "Rule" : "规则"}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">{pick(current.coreRule, locale)}</p>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
            {locale === "en" ? "Try" : "去试"}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">{pick(current.hint, locale)}</p>
        </div>
      </div>
    </div>
  );
}
