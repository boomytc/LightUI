import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { NAIVE } from "../lib/commit";
import { KINDS, type KindId } from "../lib/kinds";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { CascaderDemo } from "./CascaderDemo";
import { AxisReadout, CommitRail } from "./CommitRail";
import { DatePickerDemo } from "./DatePickerDemo";
import { GroupedSelectDemo } from "./GroupedSelectDemo";
import { MegaMenuDemo } from "./MegaMenuDemo";
import { MultiSelectDemo } from "./MultiSelectDemo";
import { SelectDemo } from "./SelectDemo";
import { SplitButtonDemo } from "./SplitButtonDemo";
import "./dropdown.css";

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("select");
  const meta = KINDS.find((k) => k.id === active) ?? KINDS[0];

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
    <div data-playground="dropdown" data-kind={active} className="min-w-0">
      <CommitRail active={active} locale={locale} onPick={setActive} />

      <section className="mt-7 min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 07</p>
            <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">{meta.name}</h2>
            <div className="mt-1.5">
              <AxisReadout id={meta.id} locale={locale} />
            </div>
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

        <Contrast
          locale={locale}
          naive={pick(NAIVE[meta.id], locale)}
          matched={pick(meta.commits, locale)}
        />

        {meta.note ? <p className="mt-4 text-[13px] text-accent">{pick(meta.note, locale)}</p> : null}

        <div className="mt-5 grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,36rem)_minmax(0,1fr)] lg:gap-8">
          <div key={meta.id} data-form-well className="dropdown-kind-in w-full min-w-0 max-w-[36rem]">
            <KindDemo id={meta.id} />
          </div>
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

function Contrast({
  locale,
  naive,
  matched,
}: {
  locale: Locale;
  naive: string;
  matched: string;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <aside className="rounded-xl border border-border bg-surface-2/70 px-3.5 py-3">
        <p className="text-[10px] font-medium tracking-wide text-fg-subtle uppercase">
          {locale === "en" ? "Always a Select" : "一律当 Select"}
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{naive}</p>
      </aside>
      <aside className="rounded-xl border border-intent/30 bg-intent-soft px-3.5 py-3">
        <p className="text-[10px] font-medium tracking-wide text-intent uppercase">
          {locale === "en" ? "This commit" : "这一档提交"}
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-fg">{matched}</p>
      </aside>
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
    <aside className="min-w-0 rounded-2xl border border-fg bg-fg px-4 py-3.5 text-surface lg:sticky lg:top-24">
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
