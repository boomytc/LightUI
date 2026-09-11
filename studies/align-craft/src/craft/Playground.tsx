import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import "../align.css";
import { KINDS, kindMeta, type KindId } from "../lib/kinds";
import { aligns, type AlignTarget, type StageState } from "../lib/machines";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { ComparePane } from "./Frame";
import { SpellFigure } from "./SpellDemo";

const TARGETS: { id: AlignTarget; zh: string; en: string }[] = [
  { id: "baseline", zh: "基线", en: "Baseline" },
  { id: "focus", zh: "焦点", en: "Focus" },
  { id: "box", zh: "盒子", en: "Box" },
  { id: "gap", zh: "缝", en: "Gap" },
  { id: "edge", zh: "边", en: "Edge" },
];

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("baseline");
  const meta = KINDS.find((k) => k.id === active) ?? KINDS[0]!;
  const target = aligns(meta.id);

  function select(id: KindId) {
    setActive(id);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) return;
      const n = Number(e.key);
      if (n >= 1 && n <= KINDS.length) {
        e.preventDefault();
        select(KINDS[n - 1]!.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="grid min-w-0 gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[11px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
          {locale === "en" ? "What it aligns" : "对齐的是"}
        </p>
        {TARGETS.map((item) => {
          const on = item.id === target;
          return (
            <span
              key={item.id}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium",
                on ? "bg-fg text-surface" : "bg-surface-2 text-fg-subtle",
              )}
            >
              {locale === "en" ? item.en : item.zh}
            </span>
          );
        })}
      </div>

      <nav
        aria-label={locale === "en" ? "Alignment spells" : "对齐咒语"}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
      >
        {KINDS.map((kind) => {
          const on = kind.id === active;
          return (
            <button
              key={kind.id}
              type="button"
              data-kind={kind.id}
              aria-pressed={on}
              onClick={() => select(kind.id)}
              className={cn(
                "inline-flex min-w-40 shrink-0 items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-colors sm:min-w-0 sm:px-3",
                on
                  ? "border-border-strong bg-surface shadow-card"
                  : "border-transparent bg-transparent hover:bg-surface-2",
              )}
            >
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-lg font-mono text-[10px] tabular-nums",
                  on ? "bg-accent text-accent-fg" : "bg-surface-2 text-fg-subtle",
                )}
              >
                {kind.index}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-medium">{pick(kind.zh, locale)}</span>
                <span className="block font-mono text-[10px] text-fg-muted">{aligns(kind.id)}</span>
              </span>
            </button>
          );
        })}
      </nav>

      <section className="min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 07</p>
            <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">{pick(meta.zh, locale)}</h2>
            <p className="mt-1 text-[14px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
          </div>
          <p className="max-w-xs text-[12px] leading-relaxed text-fg-subtle sm:text-right">
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

        <KindDemo id={meta.id} />

        <SpecCard
          locale={locale}
          wrong={meta.wrongCss}
          right={meta.css}
          text={pick(meta.spec, locale)}
        />

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

function SpecCard({
  text,
  locale,
  wrong,
  right,
}: {
  text: string;
  locale: Locale;
  wrong: string;
  right: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(right);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-fg bg-fg text-surface">
      <div className="flex items-start justify-between gap-3 px-4 pt-3.5">
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
      <p className="px-4 pt-1.5 text-[14px] leading-relaxed text-surface/90">{text}</p>
      <div className="mt-3 grid gap-px bg-surface/10 sm:grid-cols-2">
        <pre className="bg-wrong/20 px-4 py-3 font-mono text-[11px] leading-relaxed text-surface/70">
          <span className="mb-1 block text-[10px] font-medium tracking-wide text-wrong">
            {locale === "en" ? "Wrong" : "错"}
          </span>
          {wrong}
        </pre>
        <pre className="bg-intent/15 px-4 py-3 font-mono text-[11px] leading-relaxed text-surface/85">
          <span className="mb-1 block text-[10px] font-medium tracking-wide text-intent">
            {locale === "en" ? "Right" : "对"}
          </span>
          {right}
        </pre>
      </div>
    </div>
  );
}

export function KindDemo({
  id,
  state,
}: {
  id: KindId;
  state?: StageState;
}) {
  const locale = useLocale();
  const meta = kindMeta(id);
  const both = state == null;
  return (
    <div
      data-align-kind={id}
      data-align-pair={both ? "pair" : "single"}
      className={both ? "align-pair" : "grid w-full min-w-0"}
    >
      {(both || state === "wrong") && (
        <ComparePane
          state="wrong"
          hint={pick(meta.wrongHint, locale)}
          caption={pick(meta.wrongCaption, locale)}
        >
          <SpellFigure id={id} state="wrong" />
        </ComparePane>
      )}
      {(both || state === "right") && (
        <ComparePane
          state="right"
          hint={pick(meta.rightHint, locale)}
          caption={pick(meta.rightCaption, locale)}
        >
          <SpellFigure id={id} state="right" />
        </ComparePane>
      )}
    </div>
  );
}
