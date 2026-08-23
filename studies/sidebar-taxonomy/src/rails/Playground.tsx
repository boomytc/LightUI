import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { KINDS, type KindId } from "../lib/kinds";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { CollapsibleDemo } from "./CollapsibleDemo";
import { FloatingDemo } from "./FloatingDemo";
import { MultiLevelDemo } from "./MultiLevelDemo";
import { OffCanvasDemo } from "./OffCanvasDemo";
import { WheelDemo } from "./WheelDemo";

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("floating");
  const meta = KINDS.find((k) => k.id === active) ?? KINDS[0];

  return (
    <div className="min-w-0">
      <nav
        aria-label={locale === "en" ? "Sidebar kinds" : "侧栏种类"}
        className="mb-6 flex flex-wrap gap-1.5"
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
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] transition-colors",
                on
                  ? "border-border-strong bg-surface shadow-card"
                  : "border-border bg-transparent hover:bg-surface-2",
              )}
            >
              <span className={cn("font-mono text-[11px] tabular-nums", on ? "text-accent" : "text-fg-subtle")}>
                {kind.index}
              </span>
              <span className="font-medium">{pick(kind.zh, locale)}</span>
            </button>
          );
        })}
      </nav>

      <section className="min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 05</p>
            <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">{meta.name}</h2>
            <p className="mt-1 text-[14px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
          </div>
          <p className="max-w-xs text-[12px] leading-relaxed text-fg-subtle sm:text-right">
            {pick(meta.occupies, locale)}
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

        <div className="w-full min-w-0">
          <KindDemo id={meta.id} />
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

function SpecCard({ text, locale }: { text: string; locale: "zh" | "en" }) {
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

export function KindDemo({ id, defaultOpen }: { id: KindId; defaultOpen?: boolean }) {
  switch (id) {
    case "floating":
      return <FloatingDemo />;
    case "wheel":
      return <WheelDemo />;
    case "multilevel":
      return <MultiLevelDemo />;
    case "collapsible":
      return <CollapsibleDemo defaultOpen={defaultOpen} />;
    case "offcanvas":
      return <OffCanvasDemo defaultOpen={defaultOpen} />;
  }
}
