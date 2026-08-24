import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { FORMULA, KINDS, type KindId } from "../lib/kinds";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Pane } from "./Pane";

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("track");
  const meta = KINDS.find((k) => k.id === active) ?? KINDS[0]!;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "BUTTON"].includes(target.tagName)) return;
      const n = Number(e.key);
      if (n >= 1 && n <= KINDS.length) {
        e.preventDefault();
        setActive(KINDS[n - 1]!.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-w-0 overflow-x-hidden">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 03</p>
          <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">{pick(meta.zh, locale)}</h2>
          <p className="mt-1 text-[14px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
        </div>
        <p className="max-w-xs text-right text-[12px] leading-relaxed text-fg-subtle">{pick(meta.tells, locale)}</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {KINDS.map((kind) => (
          <button
            key={kind.id}
            type="button"
            onClick={() => setActive(kind.id)}
            className={cn(
              "rounded-full px-3 py-1 text-[12px] font-medium",
              kind.id === active
                ? "bg-fg text-surface"
                : "border border-border bg-surface text-fg-muted hover:text-fg",
            )}
          >
            {pick(kind.zh, locale)}
          </button>
        ))}
      </div>

      <Pane key={meta.id} kind={meta.id} locale={locale} />

      <div className="mt-5 flex flex-wrap gap-1.5">
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

      <div className="mt-5">
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

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        {FORMULA.map((item) => (
          <div key={item.n} className="flex gap-3 rounded-xl border border-border bg-surface px-3 py-3">
            <span className="inline-grid size-5 shrink-0 place-items-center rounded-md bg-fg text-[10px] font-semibold text-surface">
              {item.n}
            </span>
            <div className="min-w-0">
              <h3 className="text-[13px] font-semibold">{pick(item.title, locale)}</h3>
              <p className="mt-0.5 text-[12px] text-fg-muted">{pick(item.example, locale)}</p>
            </div>
          </div>
        ))}
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
      <p className="mt-2 text-[13px] leading-relaxed text-surface/85">{text}</p>
    </div>
  );
}
