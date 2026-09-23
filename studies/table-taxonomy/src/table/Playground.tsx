import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { KINDS, kindMeta, layerLabel, type KindMeta } from "../lib/kinds";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Desk } from "./Desk";

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindMeta["id"]>("filter");
  const [primeTick, setPrimeTick] = useState(1);
  const meta = kindMeta(active);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      const n = Number(event.key);
      if (n >= 1 && n <= KINDS.length) {
        event.preventDefault();
        const next = KINDS[n - 1]!.id;
        setActive(next);
        setPrimeTick((tick) => tick + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function pickKind(id: KindMeta["id"]) {
    setActive(id);
    setPrimeTick((tick) => tick + 1);
  }

  return (
    <div data-playground="table" data-lesson={active} className="min-w-0">
      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8">
        <nav
          aria-label={locale === "en" ? "Table layers" : "记录表的层"}
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0"
        >
          {KINDS.map((kind) => {
            const on = kind.id === active;
            return (
              <button
                key={kind.id}
                type="button"
                data-kind={kind.id}
                aria-pressed={on}
                onClick={() => pickKind(kind.id)}
                className={cn(
                  "flex min-w-52 shrink-0 items-start gap-3 rounded-2xl border px-3.5 py-3 text-left lg:min-w-0",
                  on ? "border-border-strong bg-surface shadow-card" : "border-border bg-surface hover:bg-surface-2",
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
                  <span className="flex items-baseline gap-2">
                    <span className="text-[14px] font-semibold tracking-tight">{pick(kind.zh, locale)}</span>
                    <span className="text-[11px] text-fg-subtle">{layerLabel(kind.layer, locale)}</span>
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-fg-muted">
                    {pick(kind.oneLiner, locale)}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        <Desk
          kind={active}
          mode="teach"
          primeTick={primeTick}
          onKindChange={setActive}
        />
      </div>

      <SpecCard meta={meta} locale={locale} />
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
    </div>
  );
}

function SpecCard({ meta, locale }: { meta: KindMeta; locale: Locale }) {
  const [copied, setCopied] = useState(false);
  const text = pick(meta.spec, locale);

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
          <span className="ml-2 font-mono tabular-nums text-surface/35">{meta.index} / 07</span>
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
