import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { KINDS, type KindId } from "../lib/kinds";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { KindDemo } from "./Pages";
import "./layout.css";

export { KindDemo };

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("single");
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
      <p className="mb-3 text-[12px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
        {locale === "en" ? "Page skeleton" : "这一页怎么铺"}
      </p>

      <div className="layout-scan">
        <div className="layout-scan-head" aria-hidden="true">
          <span className="font-mono">#</span>
          <span>{locale === "en" ? "Skeleton" : "骨架"}</span>
          <span>{locale === "en" ? "When" : "何时"}</span>
          <span>{locale === "en" ? "Machine" : "机器"}</span>
        </div>
        <nav
          aria-label={locale === "en" ? "Layout kinds" : "布局种类"}
          className="flex flex-col"
        >
          {KINDS.map((kind) => {
            const on = kind.id === active;
            return (
              <button
                key={kind.id}
                type="button"
                data-kind={kind.id}
                aria-pressed={on}
                onClick={() => setActive(kind.id)}
                className={cn("layout-scan-row", on && "is-on")}
              >
                <span className={cn("font-mono text-[11px] tabular-nums", on ? "text-accent" : "text-fg-subtle")}>
                  {kind.index}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold tracking-tight">
                    {pick(kind.zh, locale)}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-fg-muted md:hidden">
                    {pick(kind.when, locale)}
                  </span>
                </span>
                <span className="hidden min-w-0 truncate text-[13px] font-medium text-fg md:block">
                  {pick(kind.when, locale)}
                </span>
                <span className="hidden min-w-0 truncate text-[12px] text-fg-muted md:block">
                  {pick(kind.machine, locale)}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <section className="mt-6 min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 07</p>
            <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">{pick(meta.zh, locale)}</h2>
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

        <div key={meta.id} className="layout-enter">
          <KindDemo id={meta.id} />
        </div>

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
