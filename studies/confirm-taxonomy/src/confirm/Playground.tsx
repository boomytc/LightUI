import { useEffect, useState } from "react";
import { HoldDemo } from "../components/demos/hold-demo";
import { ModalDemo } from "../components/demos/modal-demo";
import { PopconfirmDemo } from "../components/demos/popconfirm-demo";
import { SelectDemo } from "../components/demos/select-demo";
import { SwipeDemo } from "../components/demos/swipe-demo";
import { TypeDemo } from "../components/demos/type-demo";
import { UndoDemo } from "../components/demos/undo-demo";
import { PATTERNS, type ConfirmSlug } from "../lib/kinds";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { cn, prefersReducedMotion } from "../lib/utils";

export function Playground() {
  const locale = useLocale();
  const [selected, setSelected] = useState<ConfirmSlug>("undo");
  const [seed, setSeed] = useState(0);
  const current = PATTERNS.find((p) => p.slug === selected) ?? PATTERNS[0];
  const index = PATTERNS.findIndex((p) => p.slug === selected);
  const heat = ((index + 1) / PATTERNS.length) * 100;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      const n = Number(e.key);
      if (n >= 1 && n <= PATTERNS.length) {
        e.preventDefault();
        pickRung(PATTERNS[n - 1]!.slug);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function pickRung(slug: ConfirmSlug) {
    setSelected(slug);
    setSeed((n) => n + 1);
  }

  return (
    <div className="min-w-0">
      <Ladder selected={selected} locale={locale} heat={heat} onPick={pickRung} />

      <section className="mt-6 min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[12px] tabular-nums text-accent">
              {current.id} / 07
            </p>
            <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">
              {pick(current.title, locale)}
            </h2>
            <p className="mt-1 text-[14px] text-fg-muted">{pick(current.eyebrow, locale)}</p>
          </div>
          <p className="max-w-xs text-right text-[12px] leading-relaxed text-fg-subtle">
            {pick(current.interruptWeight, locale)}
            <span className="mx-1.5 text-border-strong">·</span>
            {pick(current.scenes, locale)}
          </p>
        </div>

        <Contrast
          locale={locale}
          naive={pick(current.naive, locale)}
          matched={pick(current.matched, locale)}
          rung={pick(current.frictionShort, locale)}
        />

        <p className="mt-4 mb-4 max-w-3xl text-[13px] leading-relaxed text-fg-subtle">
          <span className="mr-2 font-medium text-fg-muted">
            {locale === "en" ? "Spec" : "规格"}
          </span>
          {pick(current.rulePrompt, locale)}
        </p>

        <div className="min-h-[460px]" data-kind={current.slug}>
          <KindDemo slug={selected} seed={seed} />
        </div>

        <p className="mt-3 text-[12px] leading-relaxed text-fg-muted">
          {pick(current.caption, locale)}
        </p>
      </section>
    </div>
  );
}

function Ladder({
  selected,
  locale,
  heat,
  onPick,
}: {
  selected: ConfirmSlug;
  locale: Locale;
  heat: number;
  onPick: (slug: ConfirmSlug) => void;
}) {
  const reduce = prefersReducedMotion();

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-medium tracking-wide text-intent">
          {locale === "en" ? "Reversible · after the fact" : "可逆 · 事后"}
        </p>
        <p className="text-[11px] font-medium tracking-wide text-wrong">
          {locale === "en" ? "Irreversible · must read" : "不可逆 · 必须读完"}
        </p>
      </div>

      <div className="relative mb-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            reduce ? "" : "transition-[width] duration-400 ease-out",
          )}
          style={{
            width: `${heat}%`,
            background:
              "linear-gradient(90deg, var(--color-intent) 0%, var(--color-accent) 46%, var(--color-wrong) 100%)",
          }}
        />
      </div>

      <nav
        aria-label={locale === "en" ? "Confirmation ladder" : "确认阶梯"}
        className="-mx-1 overflow-x-auto pb-1"
      >
        <ol className="grid min-w-[44rem] grid-cols-7 gap-1.5 px-1 sm:min-w-0">
          {PATTERNS.map((pat) => {
            const on = selected === pat.slug;
            const bar = 18 + pat.scale * 10;
            return (
              <li key={pat.slug}>
                <button
                  type="button"
                  data-kind={pat.slug}
                  aria-pressed={on}
                  onClick={() => onPick(pat.slug)}
                  className={cn(
                    "flex h-full w-full flex-col rounded-xl border px-2 py-2.5 text-left transition-colors",
                    on
                      ? "border-fg bg-fg text-surface shadow-card"
                      : "border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg",
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-[10px] tabular-nums",
                      on ? "text-surface/50" : "text-fg-subtle",
                    )}
                  >
                    {pat.id}
                  </span>
                  <span className="mt-1 text-[12px] font-semibold leading-tight">
                    {pick(pat.frictionShort, locale)}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 line-clamp-2 text-[10px] leading-snug",
                      on ? "text-surface/55" : "text-fg-subtle",
                    )}
                  >
                    {pick(pat.title, locale)}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-2 block w-full rounded-sm",
                      on ? "bg-surface/35" : "bg-fg/12",
                    )}
                    style={{ height: bar }}
                  />
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

function Contrast({
  locale,
  naive,
  matched,
  rung,
}: {
  locale: Locale;
  naive: string;
  matched: string;
  rung: string;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <aside className="rounded-xl border border-border bg-surface-2/70 px-3.5 py-3">
        <p className="text-[10px] font-medium tracking-wide text-fg-subtle uppercase">
          {locale === "en" ? "Always a modal" : "一律弹窗"}
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{naive}</p>
      </aside>
      <aside className="rounded-xl border border-intent/30 bg-intent-soft px-3.5 py-3">
        <p className="text-[10px] font-medium tracking-wide text-intent uppercase">
          {locale === "en" ? "This rung" : "这一档"}
          <span className="ml-1.5 font-sans normal-case tracking-normal text-intent/70">
            {rung}
          </span>
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-fg">{matched}</p>
      </aside>
    </div>
  );
}

export function KindDemo({ slug, seed = 0 }: { slug: ConfirmSlug; seed?: number }) {
  switch (slug) {
    case "undo":
      return <UndoDemo key={seed} />;
    case "hold":
      return <HoldDemo key={seed} />;
    case "swipe":
      return <SwipeDemo key={seed} />;
    case "pop":
      return <PopconfirmDemo key={seed} />;
    case "modal":
      return <ModalDemo key={seed} />;
    case "type":
      return <TypeDemo key={seed} />;
    case "select":
      return <SelectDemo key={seed} />;
  }
}
