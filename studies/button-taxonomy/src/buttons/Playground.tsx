import { useState } from "react";
import { KINDS, type KindId } from "../lib/kinds";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { ActionRow, type SceneState } from "./Scene";

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("solid");
  const meta = KINDS.find((k) => k.id === active) ?? KINDS[0];

  return (
    <div className="min-w-0">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[1.15rem] font-semibold tracking-tight">{meta.name}</h2>
          <p className="mt-0.5 text-[13px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
        </div>
        <KindSwitch active={active} locale={locale} onChange={setActive} />
      </div>

      <p data-spec="caption" className="mb-5 max-w-3xl text-[13px] leading-relaxed text-fg-subtle">
        <span className="mr-2 font-medium text-fg-muted">{locale === "en" ? "Spec" : "规格"}</span>
        {pick(meta.spec, locale)}
      </p>

      <div data-work="compare" className="grid min-w-0 w-full gap-3 lg:grid-cols-2">
        <WeightRegion state="ok" named={active} />
        <WeightRegion state="wrong" />
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
    </div>
  );
}

function KindSwitch({
  active,
  locale,
  onChange,
}: {
  active: KindId;
  locale: Locale;
  onChange: (id: KindId) => void;
}) {
  return (
    <div
      role="radiogroup"
      data-kind-switch
      aria-label={locale === "en" ? "Button weights" : "按钮重量"}
      className="inline-flex rounded-lg border border-border bg-surface p-0.5"
    >
      {KINDS.map((kind) => {
        const on = kind.id === active;
        return (
          <button
            key={kind.id}
            type="button"
            role="radio"
            aria-checked={on}
            data-kind={kind.id}
            onClick={() => onChange(kind.id)}
            className={cn(
              "rounded-md px-3 py-1 text-[12px] font-medium transition-colors",
              on ? "bg-fg text-surface" : "text-fg-muted hover:text-fg",
            )}
          >
            {pick(kind.zh, locale)}
          </button>
        );
      })}
    </div>
  );
}

function WeightRegion({
  state,
  named,
}: {
  state: SceneState;
  named?: KindId;
}) {
  const locale = useLocale();
  const ok = state === "ok";

  return (
    <section
      data-region={state}
      className={cn(
        "flex min-h-56 min-w-0 flex-col rounded-2xl border bg-surface px-5 py-4 shadow-card lg:min-h-72 lg:px-6 lg:py-5",
        ok ? "border-intent/35" : "border-border",
      )}
    >
      <p
        className={cn(
          "w-fit rounded-full px-2 py-0.5 text-[11px] font-medium",
          ok ? "bg-intent-soft text-intent" : "bg-accent-soft text-accent",
        )}
      >
        {ok ? (locale === "en" ? "Right" : "对") : locale === "en" ? "Wrong" : "错"}
      </p>
      <div className="flex flex-1 items-center py-6">
        <ActionRow named={named} state={state} />
      </div>
      <p className="text-[12px] leading-relaxed text-fg-muted">
        {ok
          ? locale === "en"
            ? "One solid, one outline, one text. The ring names the weight you are specifying."
            : "一个面状、一个线状、一个文字。描边标出你正在命名的那一档。"
          : locale === "en"
            ? "Two solids in one bar. Both shout; neither is the primary."
            : "同一条里两个面状。两个都在喊，就没有主按钮。"}
      </p>
    </section>
  );
}
