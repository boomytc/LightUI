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
    <div className="min-w-0">
      <nav
        aria-label={locale === "en" ? "Overlay kinds" : "下拉种类"}
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
                "rounded-full border px-3 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors",
                on
                  ? "border-fg bg-fg text-surface"
                  : "border-transparent bg-surface-2 text-fg-muted hover:bg-surface hover:text-fg",
              )}
            >
              {kind.name}
            </button>
          );
        })}
      </nav>

      <section className="mt-6 min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 07</p>
            <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">{meta.name}</h2>
            <p className="mt-1 text-[14px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
          </div>
          <p className="max-w-xs text-[12px] leading-relaxed text-fg-subtle sm:text-right">
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

        <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,36rem)_minmax(0,1fr)] lg:gap-8">
          <div data-form-well className="w-full min-w-0 max-w-[36rem]">
            <KindDemo id={meta.id} />
          </div>
          <SpecCaption text={pick(meta.spec, locale)} locale={locale} />
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

function SpecCaption({ text, locale }: { text: string; locale: "zh" | "en" }) {
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
    <aside className="min-w-0 max-w-prose lg:sticky lg:top-24">
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-medium tracking-wide text-fg-subtle">
          {locale === "en" ? "Say it this way" : "说清楚"}
        </p>
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-1 py-0.5 text-[11px] text-fg-subtle transition-colors hover:text-fg"
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
      <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{text}</p>
    </aside>
  );
}

export function KindDemo({ id, defaultOpen }: { id: KindId; defaultOpen?: boolean }) {
  switch (id) {
    case "select":
      return <SelectDemo defaultOpen={defaultOpen} />;
    case "multi":
      return <MultiSelectDemo defaultOpen={defaultOpen} />;
    case "grouped":
      return <GroupedSelectDemo defaultOpen={defaultOpen} />;
    case "cascader":
      return <CascaderDemo defaultOpen={defaultOpen} />;
    case "split":
      return <SplitButtonDemo defaultOpen={defaultOpen} />;
    case "mega":
      return <MegaMenuDemo defaultOpen={defaultOpen ?? true} />;
    case "date":
      return <DatePickerDemo defaultOpen={defaultOpen ?? true} />;
  }
}
