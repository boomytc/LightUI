import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { KINDS, PHASES, type KindId } from "../lib/kinds";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { dutiesIn, phaseOf, type StageState } from "../lib/machines";
import { Window } from "./Frame";
import { DutyScene } from "./Scenes";
import "./fill.css";

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("label");
  const [sceneKey, setSceneKey] = useState(0);
  const meta = KINDS.find((k) => k.id === active) ?? KINDS[0];
  const phase = PHASES.find((item) => item.id === phaseOf(meta.id)) ?? PHASES[0];

  function select(id: KindId) {
    setActive(id);
    setSceneKey((n) => n + 1);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
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
    <div
      data-playground="fill"
      data-lesson={meta.id}
      className="grid min-w-0 gap-8 lg:grid-cols-[minmax(28rem,32rem)_minmax(0,1fr)] lg:items-start lg:gap-10"
    >
      <section data-pane="lesson" className="min-w-0 lg:order-2">
        <p className="mb-3 text-[12px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
          {locale === "en" ? "Three moments" : "三个时刻"}
        </p>

        <nav
          aria-label={locale === "en" ? "Filling duties" : "填写职责"}
          className="-mx-4 flex gap-5 overflow-x-auto px-4 pb-1 lg:mx-0 lg:max-w-sm lg:flex-col lg:overflow-visible lg:px-0"
        >
          {PHASES.map((item, index) => {
            const items = dutiesIn(item.id)
              .map((id) => KINDS.find((kind) => kind.id === id))
              .filter((kind): kind is (typeof KINDS)[number] => Boolean(kind));
            const phaseOn = item.id === phase.id;
            return (
              <div key={item.id} data-phase={item.id} className="relative flex min-w-52 shrink-0 flex-col gap-1 lg:min-w-0 lg:pl-5">
                <span
                  aria-hidden="true"
                  className={cn(
                    "fill-phase-dot absolute top-1.5 left-0 hidden size-2.5 rounded-full lg:block",
                    phaseOn ? "bg-accent" : "bg-border-strong",
                  )}
                />
                {index < PHASES.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-4 bottom-[-1.15rem] left-[4px] hidden w-px bg-border lg:block"
                  />
                ) : null}
                <p
                  className={cn(
                    "px-1 text-[11px] font-medium tracking-[0.12em] uppercase",
                    phaseOn ? "text-accent" : "text-fg-subtle",
                  )}
                >
                  {pick(item.label, locale)}
                </p>
                {items.map((kind) => {
                  const on = kind.id === active;
                  return (
                    <button
                      key={kind.id}
                      type="button"
                      data-kind={kind.id}
                      aria-pressed={on}
                      onClick={() => select(kind.id)}
                      className={cn(
                        "flex min-w-44 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-[border-color,background-color,box-shadow] duration-200 lg:min-w-0",
                        on
                          ? "border-border-strong bg-surface shadow-card"
                          : "border-transparent bg-transparent hover:bg-surface-2",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-8 shrink-0 place-items-center rounded-full font-mono text-[11px] tabular-nums transition-colors duration-200",
                          on ? "bg-accent text-accent-fg" : "bg-surface-2 text-fg-subtle",
                        )}
                      >
                        {kind.index}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium">{kind.name}</span>
                        <span className="block truncate text-[11px] text-fg-muted">{pick(kind.zh, locale)}</span>
                        <span className="mt-0.5 hidden text-[11px] leading-snug text-fg-subtle lg:block">
                          {pick(kind.tells, locale)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="mt-6">
          <div className="mb-4">
            <p className="font-mono text-[12px] tabular-nums text-accent">
              {pick(phase.label, locale)}
              {" · "}
              {meta.index} / 07
            </p>
            <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">{meta.name}</h2>
            <p className="mt-1 text-[14px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
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

          <p className="mb-4 text-[13px] leading-relaxed text-fg-muted">
            {locale === "en" ? "Try: " : "试一试："}
            {pick(meta.tryHint, locale)}
          </p>

          <ul className="flex flex-wrap gap-2">
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
      </section>

      <div data-pane="form" className="w-full min-w-0 max-w-[32rem] lg:order-1">
        <KindDemo key={`${meta.id}-${sceneKey}`} id={meta.id} locale={locale} />
      </div>
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

export function KindDemo({
  id,
  locale,
  state,
}: {
  id: KindId;
  locale: Locale;
  state?: StageState;
}) {
  const locked = state === "naive" || state === "clear";
  const phase = PHASES.find((item) => item.id === phaseOf(id));
  return (
    <div className={locked ? undefined : "fill-enter"}>
      <Window
        kicker={phase ? pick(phase.label, locale) : undefined}
        title={locale === "en" ? "Sign-up · what to disclose" : "活动报名 · 填写职责"}
      >
        <div data-locked={locked ? "true" : "false"} data-duty={id} data-state={state ?? "live"}>
          <DutyScene id={id} locale={locale} state={state} />
        </div>
      </Window>
    </div>
  );
}
