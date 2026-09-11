import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { KINDS, type KindId } from "../lib/kinds";
import { coversPage, exclusiveOpen } from "../lib/machines";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { AccordionDemo } from "./AccordionDemo";
import { CardDemo } from "./CardDemo";
import { CollapseDemo } from "./CollapseDemo";
import { ReadMoreDemo } from "./ReadMoreDemo";
import { RowDemo } from "./RowDemo";
import { TreeDemo } from "./TreeDemo";
import "./expand.css";

const EXCLUSIVE = KINDS.filter((kind) => exclusiveOpen(kind.id));
const INDEPENDENT = KINDS.filter((kind) => !exclusiveOpen(kind.id));

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("accordion");
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
    <div data-playground="expand" className="min-w-0 overflow-x-hidden">
      <FlowAsk locale={locale} />

      <div className="mt-5 grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start">
        <KindGroup
          locale={locale}
          label={locale === "en" ? "Exclusive" : "互斥"}
          hint={locale === "en" ? "Open B closes A" : "开 B 必须关 A"}
          kinds={EXCLUSIVE}
          active={active}
          onPick={setActive}
        />
        <KindGroup
          locale={locale}
          label={locale === "en" ? "Independent" : "独立"}
          hint={locale === "en" ? "Several can stay open" : "几块可以同时开着"}
          kinds={INDEPENDENT}
          active={active}
          onPick={setActive}
        />
      </div>

      <section className="mt-6 min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 06</p>
            <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">{meta.name}</h2>
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

        <FlowRule locale={locale} id={meta.id} />

        <KindDemo key={meta.id} id={meta.id} />

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

function FlowAsk({ locale }: { locale: Locale }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <aside className="rounded-2xl border border-border bg-surface px-3.5 py-3">
        <p className="text-[10px] font-medium tracking-[0.12em] text-wrong uppercase">
          {locale === "en" ? "Cover · not this study" : "盖一层 · 不做"}
        </p>
        <div className="expand-ask-stack mt-2.5" aria-hidden="true">
          <span className="expand-ask-sheet is-back">
            {locale === "en" ? "Later copy" : "后文"}
          </span>
          <span className="expand-ask-sheet is-overlay">
            {locale === "en" ? "Extra block" : "多出来的块"}
          </span>
        </div>
        <p className="mt-2.5 text-[12px] leading-relaxed text-fg-muted">
          {locale === "en"
            ? "The later block stays put and is hidden. That is a layer, not flow."
            : "后文原地不动、被挡住。那是盖一层，不是撑开。"}
        </p>
      </aside>
      <aside className="rounded-2xl border border-intent/25 bg-intent-soft/50 px-3.5 py-3">
        <p className="text-[10px] font-medium tracking-[0.12em] text-intent uppercase">
          {locale === "en" ? "In flow · these six" : "撑开流 · 本则六片"}
        </p>
        <div className="expand-ask-stack is-flow mt-2.5" aria-hidden="true">
          <span className="expand-ask-sheet">
            {locale === "en" ? "Extra block takes space" : "多出来的块占位子"}
          </span>
          <span className="expand-ask-sheet is-after">
            {locale === "en" ? "Later copy moves down" : "后文往下让"}
          </span>
        </div>
        <p className="mt-2.5 text-[12px] leading-relaxed text-fg-muted">
          {locale === "en"
            ? "coversPage is false. Height moves on 0fr → 1fr. No drawer."
            : "coversPage 一律 false。高度走 0fr → 1fr。没有抽屉。"}
        </p>
      </aside>
    </div>
  );
}

function KindGroup({
  locale,
  label,
  hint,
  kinds,
  active,
  onPick,
}: {
  locale: Locale;
  label: string;
  hint: string;
  kinds: typeof KINDS;
  active: KindId;
  onPick: (id: KindId) => void;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium tracking-[0.12em] text-fg-subtle uppercase">{label}</p>
      <p className="mt-0.5 text-[11px] text-fg-muted">{hint}</p>
      <nav
        aria-label={label}
        className="mt-2 flex flex-wrap gap-2"
      >
        {kinds.map((kind) => {
          const on = kind.id === active;
          return (
            <button
              key={kind.id}
              type="button"
              data-kind={kind.id}
              aria-pressed={on}
              onClick={() => onPick(kind.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-left transition-colors",
                on
                  ? "border-fg bg-fg text-surface"
                  : "border-border bg-surface text-fg-muted hover:bg-surface-2 hover:text-fg",
              )}
            >
              <span className={cn("font-mono text-[11px] tabular-nums", on ? "text-surface/70" : "text-fg-subtle")}>
                {kind.index}
              </span>
              <span className="text-[13px] font-medium">{pick(kind.zh, locale)}</span>
              <span className={cn("text-[11px]", on ? "text-surface/70" : "text-fg-subtle")}>
                {pick(kind.chip, locale)}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function FlowRule({ locale, id }: { locale: Locale; id: KindId }) {
  const exclusive = exclusiveOpen(id);
  return (
    <dl className="expand-rule mb-4 grid grid-cols-3 gap-2 rounded-2xl border border-border bg-surface px-3 py-2.5 sm:px-4">
      <div>
        <dt className="font-mono text-[10px] tracking-wide text-fg-subtle uppercase">coversPage</dt>
        <dd className="mt-0.5 text-[13px] font-medium text-intent">{String(coversPage(id))}</dd>
      </div>
      <div>
        <dt className="font-mono text-[10px] tracking-wide text-fg-subtle uppercase">exclusive</dt>
        <dd className={cn("mt-0.5 text-[13px] font-medium", exclusive ? "text-accent" : "text-fg")}>
          {String(exclusive)}
        </dd>
      </div>
      <div>
        <dt className="font-mono text-[10px] tracking-wide text-fg-subtle uppercase">height</dt>
        <dd className="mt-0.5 text-[13px] font-medium text-fg">0fr → 1fr</dd>
      </div>
      <p className="col-span-3 text-[11px] leading-relaxed text-fg-subtle">
        {locale === "en"
          ? exclusive
            ? "Opening B must close A. Both heights move together, and the rest of the page is pushed down."
            : "Panels do not evict each other. Extra content still sits in flow — never as a cover."
          : exclusive
            ? "开 B 必须关 A。两块高度一起走，后面的段被撑下去。"
            : "开一块不必关另一块。多出来的内容仍在流里，不会盖一层。"}
      </p>
    </dl>
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

export function KindDemo({
  id,
  state,
  compact = false,
}: {
  id: KindId;
  state?: string;
  compact?: boolean;
}) {
  switch (id) {
    case "accordion":
      return <AccordionDemo state={state} compact={compact} />;
    case "collapse":
      return <CollapseDemo state={state} compact={compact} />;
    case "tree":
      return <TreeDemo state={state} compact={compact} />;
    case "row":
      return <RowDemo state={state} compact={compact} />;
    case "readmore":
      return <ReadMoreDemo state={state} compact={compact} />;
    case "card":
      return <CardDemo state={state} compact={compact} />;
  }
}
