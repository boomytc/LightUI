import { useEffect, useState } from "react";
import { KINDS, WEIGHT_LABEL, type KindId } from "../lib/kinds";
import { primaryCount, tooManyPrimaries, weight } from "../lib/machines";
import { TRIO, WRONG_BAR } from "../lib/fixtures";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { ActionRow, type SceneState } from "./Scene";
import type { ButtonSkin } from "./Frame";
import "./button.css";

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("solid");
  const [skin, setSkin] = useState<ButtonSkin>("round");
  const [sceneKey, setSceneKey] = useState(0);
  const meta = KINDS.find((k) => k.id === active) ?? KINDS[0];

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
    <div data-playground="button" className="min-w-0">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="text-[12px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
          {locale === "en" ? "First name the weight" : "先定重量"}
        </p>
        <p className="text-[11px] text-fg-subtle">
          {locale === "en" ? "1–3 to switch" : "1–3 切换"}
        </p>
      </div>

      <WeightRungs active={active} locale={locale} onChange={select} />

      <div className="mt-5 mb-3 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[12px] tabular-nums text-accent">
            {pick(WEIGHT_LABEL[weight(meta.id)], locale)}
            {" · "}
            {meta.index} / 03
          </p>
          <h2 className="mt-1 text-[1.35rem] font-semibold tracking-tight">{pick(meta.zh, locale)}</h2>
          <p className="mt-0.5 text-[13px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
        </div>
        <SkinToggle skin={skin} locale={locale} onChange={setSkin} />
      </div>

      <p data-spec="caption" className="mb-5 max-w-3xl text-[13px] leading-relaxed text-fg-subtle">
        <span className="mr-2 font-medium text-fg-muted">{locale === "en" ? "Spec" : "规格"}</span>
        {pick(meta.spec, locale)}
      </p>

      <div data-work="compare" className="grid min-w-0 w-full gap-3 lg:grid-cols-2">
        <WeightRegion key={`ok-${sceneKey}`} state="ok" named={active} skin={skin} />
        <WeightRegion key={`wrong-${sceneKey}`} state="wrong" skin={skin} />
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

function WeightRungs({
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
      className="grid grid-cols-3 gap-2"
    >
      {KINDS.map((kind) => {
        const on = kind.id === active;
        const rung = weight(kind.id);
        return (
          <button
            key={kind.id}
            type="button"
            role="radio"
            aria-checked={on}
            data-kind={kind.id}
            onClick={() => onChange(kind.id)}
            className={cn(
              "flex min-h-[4.75rem] flex-col items-start gap-2 rounded-2xl border px-3 py-2.5 text-left transition-[border-color,background-color,box-shadow,color] duration-200",
              on
                ? "border-fg bg-fg text-surface shadow-card"
                : "border-border bg-surface text-fg hover:border-border-strong hover:bg-surface-2",
            )}
          >
            <span className="flex w-full items-center justify-between gap-2">
              <span
                className={cn(
                  "text-[11px] font-medium tracking-[0.14em] uppercase",
                  on ? "text-surface/55" : "text-fg-subtle",
                )}
              >
                {pick(WEIGHT_LABEL[rung], locale)}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "btn-ink",
                  kind.id === "solid" && "btn-ink-solid",
                  kind.id === "outline" && "btn-ink-outline",
                  kind.id === "text" && "btn-ink-text",
                )}
              />
            </span>
            <span className="text-[14px] font-semibold tracking-tight">{pick(kind.zh, locale)}</span>
            <span className={cn("text-[11px] leading-snug", on ? "text-surface/65" : "text-fg-muted")}>
              {pick(kind.tells, locale)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SkinToggle({
  skin,
  locale,
  onChange,
}: {
  skin: ButtonSkin;
  locale: Locale;
  onChange: (skin: ButtonSkin) => void;
}) {
  return (
    <div
      role="group"
      aria-label={locale === "en" ? "Skin, not weight" : "皮肤，不是重量"}
      className="inline-flex rounded-lg border border-border bg-surface p-0.5"
    >
      {(
        [
          ["round", locale === "en" ? "Radius" : "圆角"],
          ["pill", locale === "en" ? "Pill" : "胶囊"],
        ] as const
      ).map(([id, label]) => {
        const on = skin === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={on}
            data-skin={id}
            onClick={() => onChange(id)}
            className={cn(
              "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
              on ? "bg-surface-2 text-fg" : "text-fg-subtle hover:text-fg",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function WeightRegion({
  state,
  named,
  skin,
}: {
  state: SceneState;
  named?: KindId;
  skin: ButtonSkin;
}) {
  const locale = useLocale();
  const ok = state === "ok";
  const leaves = ok ? TRIO : WRONG_BAR;
  const count = primaryCount(leaves.map((leaf) => leaf.kind));
  const crowded = tooManyPrimaries(count);

  return (
    <section
      data-region={state}
      className={cn(
        "btn-enter flex min-h-56 min-w-0 flex-col rounded-2xl border bg-surface px-5 py-4 shadow-card lg:min-h-72 lg:px-6 lg:py-5",
        ok ? "border-intent/35" : "border-wrong/30",
        !ok && "btn-enter-late",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p
          className={cn(
            "w-fit rounded-full px-2 py-0.5 text-[11px] font-medium",
            ok ? "bg-intent-soft text-intent" : "bg-wrong-soft text-wrong",
          )}
        >
          {ok ? (locale === "en" ? "Right" : "对") : locale === "en" ? "Wrong" : "错"}
        </p>
        <FillMeter count={count} crowded={crowded} locale={locale} />
      </div>
      <div className="flex flex-1 items-center py-6">
        <ActionRow named={named} state={state} captioned skin={skin} />
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

function FillMeter({
  count,
  crowded,
  locale,
}: {
  count: number;
  crowded: boolean;
  locale: Locale;
}) {
  return (
    <p
      data-filled-count={count}
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-medium tabular-nums",
        crowded ? "text-wrong" : "text-fg-subtle",
      )}
    >
      <span aria-hidden="true" className="inline-flex items-center gap-1">
        <i className="btn-slot btn-slot-fill" />
        {count > 1 ? <i className="btn-slot btn-slot-overflow" /> : null}
      </span>
      {locale === "en"
        ? `${count} filled / 1 allowed`
        : `面状 ${count} / 1`}
    </p>
  );
}
