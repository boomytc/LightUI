import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { KINDS, SHAPE_ASKS, type KindId } from "../lib/kinds";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { KindDemo } from "./KindDemo";
import "./pickers.css";

export { KindDemo };

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("ruler");
  const meta = KINDS.find((kind) => kind.id === active) ?? KINDS[0]!;
  const ask = SHAPE_ASKS.find((item) => item.id === active) ?? SHAPE_ASKS[0]!;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      const n = Number(event.key);
      if (n >= 1 && n <= KINDS.length) {
        event.preventDefault();
        setActive(KINDS[n - 1]!.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      data-playground="picker"
      data-lesson={meta.id}
      className="grid min-w-0 gap-8 lg:grid-cols-[minmax(22rem,26rem)_minmax(0,1fr)] lg:items-start lg:gap-10"
    >
      <section data-pane="demo" className="min-w-0">
        <div className="picker-enter">
          <KindDemo key={meta.id} id={meta.id} />
        </div>
      </section>

      <section data-pane="lesson" className="min-w-0 lg:pt-1">
        <p className="mb-3 text-[12px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
          {locale === "en" ? "What is being picked?" : "选什么"}
        </p>

        <nav
          aria-label={locale === "en" ? "Picker kinds" : "选择器"}
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0"
        >
          {KINDS.map((kind) => {
            const on = kind.id === active;
            const kindAsk = SHAPE_ASKS.find((item) => item.id === kind.id);
            return (
              <button
                key={kind.id}
                type="button"
                data-kind={kind.id}
                aria-pressed={on}
                onClick={() => setActive(kind.id)}
                className={cn(
                  "picker-ask flex min-w-52 shrink-0 items-start gap-3 rounded-2xl border px-3.5 py-3 text-left lg:min-w-0",
                  on
                    ? "border-border-strong bg-surface shadow-card"
                    : "border-border bg-surface hover:bg-surface-2",
                )}
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full font-mono text-[11px] tabular-nums",
                    on ? "bg-accent text-accent-fg" : "bg-surface-2 text-fg-subtle",
                  )}
                >
                  {kind.index}
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold tracking-tight">
                    {pick(kind.zh, locale)}
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-fg-muted">
                    {kindAsk ? pick(kindAsk.ask, locale) : pick(kind.oneLiner, locale)}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="mt-6 min-w-0">
          <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 05</p>
          <h2 className="mt-1 text-[1.45rem] font-semibold tracking-tight">{meta.name}</h2>
          <p className="mt-1 text-[14px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
          <p className="mt-2 text-[12px] leading-relaxed text-fg-subtle">
            {pick(ask.ask, locale)}
            <span className="mx-1.5 text-border-strong">·</span>
            {pick(meta.tells, locale)}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {meta.scenes.map((scene) => (
            <span
              key={scene.zh}
              className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent"
            >
              {pick(scene, locale)}
            </span>
          ))}
        </div>

        {meta.note ? <p className="mt-4 text-[13px] text-accent">{pick(meta.note, locale)}</p> : null}

        <div className="mt-4">
          <SpecCard text={pick(meta.spec, locale)} locale={locale} />
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
    <div className="rounded-2xl border border-fg bg-fg px-4 py-3.5 text-surface">
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
