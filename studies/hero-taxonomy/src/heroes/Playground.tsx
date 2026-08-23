import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { KINDS, type KindId } from "../lib/kinds";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { KindDemo } from "./Heroes";

export { KindDemo };

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("product");
  const meta = KINDS.find((k) => k.id === active) ?? KINDS[0];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
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
      <nav
        data-kind-nav=""
        aria-label={locale === "en" ? "Hero kinds" : "首屏种类"}
        className="flex min-w-0 flex-wrap gap-1 rounded-2xl border border-border bg-surface-2/80 p-1"
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
                "inline-flex min-w-0 items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-left text-[12px] font-medium transition-colors",
                on ? "bg-surface text-fg shadow-card" : "text-fg-muted hover:bg-surface/70 hover:text-fg",
              )}
            >
              <span className={cn("font-mono text-[10px] tabular-nums", on ? "text-accent" : "text-fg-subtle")}>
                {kind.index}
              </span>
              <span className="min-w-0 truncate">{pick(kind.zh, locale)}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-5 mb-4 min-w-0">
        <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 08</p>
        <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">{meta.name}</h2>
        <p className="mt-1 text-[14px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
      </div>

      {meta.note ? <p className="mb-3 text-[13px] text-accent">{pick(meta.note, locale)}</p> : null}

      <div className="min-w-0 overflow-x-hidden">
        <KindDemo key={meta.id} id={meta.id} />
      </div>

      <SpecCaption text={pick(meta.spec, locale)} locale={locale} />

      <p className="mt-2 text-[12px] leading-relaxed text-fg-subtle">{pick(meta.tells, locale)}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {meta.scenes.map((scene) => (
          <span
            key={scene.zh}
            className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent"
          >
            {pick(scene, locale)}
          </span>
        ))}
      </div>

      <ul className="mt-2 flex flex-wrap gap-2">
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

function SpecCaption({ text, locale }: { text: string; locale: Locale }) {
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
    <div className="mt-4 flex min-w-0 items-start gap-3">
      <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-fg-muted">
        <span className="font-medium text-fg">{locale === "en" ? "Say it this way" : "说清楚"}</span>
        <span className="mx-2 text-fg-subtle">·</span>
        {text}
      </p>
      <button
        type="button"
        onClick={copy}
        className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-fg-subtle transition-colors hover:text-fg"
      >
        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
        {copied ? (locale === "en" ? "Copied" : "已复制") : locale === "en" ? "Copy" : "复制"}
      </button>
    </div>
  );
}
