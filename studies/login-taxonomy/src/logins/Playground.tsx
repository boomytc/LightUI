import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { KINDS, type KindId } from "../lib/kinds";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { KindDemo } from "./Scenes";

export { KindDemo };

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("centered");
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
    <div className="min-w-0">
      <nav
        aria-label={locale === "en" ? "Login kinds" : "登录种类"}
        className="flex flex-wrap gap-1.5"
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
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] transition-colors",
                on
                  ? "border-fg bg-fg text-surface"
                  : "border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg",
              )}
            >
              <span className={cn("font-mono text-[10px] tabular-nums", on ? "text-surface/65" : "text-fg-subtle")}>
                {kind.index}
              </span>
              <span className="font-medium">{kind.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-4 mb-3 flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <p className="font-mono text-[11px] tabular-nums text-accent">{meta.index} / 05</p>
          <h2 className="mt-0.5 text-[1.25rem] font-semibold tracking-tight">{meta.name}</h2>
        </div>
        <p className="max-w-xl text-[13px] leading-snug text-fg-muted">
          {pick(meta.oneLiner, locale)}
          <span className="text-fg-subtle"> · {pick(meta.tells, locale)}</span>
        </p>
      </div>

      <div className="login-playground w-full min-w-0 overflow-x-hidden">
        <KindDemo key={meta.id} id={meta.id} />
      </div>

      <SpecCard text={pick(meta.spec, locale)} locale={locale} />

      {meta.note ? <p className="mt-2 text-[12px] text-accent">{pick(meta.note, locale)}</p> : null}

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {meta.scenes.map((scene) => (
          <li
            key={scene.zh}
            className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-medium text-accent"
          >
            {pick(scene, locale)}
          </li>
        ))}
        {meta.rules.map((rule) => (
          <li
            key={rule.zh}
            className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] text-fg-muted"
          >
            {pick(rule, locale)}
          </li>
        ))}
      </ul>
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
    <div className="mt-3 flex items-start gap-2 rounded-xl border border-border bg-surface px-3 py-2">
      <p className="shrink-0 pt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-fg-subtle">
        {locale === "en" ? "Say it this way" : "说清楚"}
      </p>
      <p className="min-w-0 flex-1 text-[13px] leading-snug text-fg-muted">{text}</p>
      <button
        type="button"
        onClick={copy}
        className="inline-flex shrink-0 items-center gap-1 rounded-md px-1 py-0.5 text-[11px] text-fg-subtle transition-colors hover:text-fg"
      >
        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
        {copied ? (locale === "en" ? "Copied" : "已复制") : locale === "en" ? "Copy" : "复制"}
      </button>
    </div>
  );
}
