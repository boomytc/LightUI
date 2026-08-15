import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { KINDS, type KindId } from "../lib/kinds";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { CascaderDemo } from "./CascaderDemo";
import { DatePickerDemo } from "./DatePickerDemo";
import { GroupedSelectDemo } from "./GroupedSelectDemo";
import { MegaMenuDemo } from "./MegaMenuDemo";
import { MultiSelectDemo } from "./MultiSelectDemo";
import { SelectDemo } from "./SelectDemo";
import { SplitButtonDemo } from "./SplitButtonDemo";

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("select");
  const meta = KINDS.find((k) => k.id === active) ?? KINDS[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav
        aria-label={locale === "en" ? "Overlay kinds" : "下拉种类"}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0"
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
                "flex min-w-44 shrink-0 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors lg:min-w-0 lg:w-full",
                on
                  ? "border-border-strong bg-surface shadow-card"
                  : "border-transparent bg-transparent hover:bg-surface-2",
              )}
            >
              <span
                className={cn(
                  "font-mono text-[11px] tabular-nums",
                  on ? "text-accent" : "text-fg-subtle",
                )}
              >
                {kind.index}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium">{kind.name}</span>
                <span className="block truncate text-[11px] text-fg-muted">{pick(kind.zh, locale)}</span>
              </span>
            </button>
          );
        })}
      </nav>

      <section className="min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 07</p>
            <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">{meta.name}</h2>
            <p className="mt-1 text-[14px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
          </div>
          <p className="max-w-xs text-right text-[12px] leading-relaxed text-fg-subtle">
            {pick(meta.commits, locale)}
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

        <div data-film="play">
          <Demo id={meta.id} />
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
          {copied
            ? locale === "en"
              ? "Copied"
              : "已复制"
            : locale === "en"
              ? "Copy"
              : "复制"}
        </button>
      </div>
      <p className="mt-1.5 text-[14px] leading-relaxed text-surface/90">{text}</p>
    </div>
  );
}

function Demo({ id }: { id: KindId }) {
  switch (id) {
    case "select":
      return <SelectDemo />;
    case "multi":
      return <MultiSelectDemo />;
    case "grouped":
      return <GroupedSelectDemo />;
    case "cascader":
      return <CascaderDemo />;
    case "split":
      return <SplitButtonDemo />;
    case "mega":
      return <MegaMenuDemo />;
    case "date":
      return <DatePickerDemo />;
  }
}
