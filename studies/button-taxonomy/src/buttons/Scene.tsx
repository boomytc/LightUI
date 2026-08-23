import { TRIO, WRONG_BAR } from "../lib/fixtures";
import { primaryCount, tooManyPrimaries, type KindId } from "../lib/machines";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { ActionButton, Window } from "./Frame";

export type SceneState = "ok" | "wrong";

export function Scene({
  named,
  state = "ok",
  showWrongNote = false,
}: {
  named: KindId;
  state?: SceneState;
  showWrongNote?: boolean;
}) {
  const locale = useLocale();
  const wrong = state === "wrong";
  const leaves = wrong ? WRONG_BAR : TRIO;
  const crowded = tooManyPrimaries(primaryCount(leaves.map((leaf) => leaf.kind)));

  return (
    <div className="w-full min-w-0 max-w-[390px] overflow-x-hidden">
      <Window title={locale === "en" ? "Orbit · pack" : "Orbit · 资源"}>
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-fg-subtle">
          {locale === "en" ? "Weekend pack" : "周末速写本"}
        </p>
        <h3 className="mt-1 text-[1.15rem] font-semibold tracking-tight">
          {locale === "en" ? "Field notes PDF" : "田间速写 PDF"}
        </h3>
        <p className="mt-1 text-[13px] text-fg-muted">
          {locale === "en" ? "12 pages · 3.2 MB" : "12 页 · 3.2 MB"}
        </p>

        <div
          className={cn(
            "mt-5 flex flex-wrap items-center gap-2 overflow-x-hidden",
            crowded && "rounded-xl border border-dashed border-border-strong bg-surface-2 px-2.5 py-2",
          )}
        >
          {leaves.map((leaf, i) => (
            <ActionButton
              key={`${leaf.kind}-${leaf.label.zh}-${i}`}
              kind={leaf.kind}
              named={!wrong && leaf.kind === named}
            >
              {pick(leaf.label, locale)}
            </ActionButton>
          ))}
        </div>

        {wrong ? (
          <p className="mt-3 text-[12px] leading-relaxed text-accent">
            {locale === "en"
              ? "Wrong: two solids in one bar. A region may have only one filled primary."
              : "错：同一条里两个面状。一区只能有一个实心主按钮。"}
          </p>
        ) : (
          <p className="mt-3 text-[12px] leading-relaxed text-fg-subtle">
            {locale === "en"
              ? "One solid, one outline, one text. The ring names the weight you are specifying."
              : "一个面状、一个线状、一个文字。描边标出你正在命名的那一档。"}
          </p>
        )}
      </Window>

      {showWrongNote && !wrong ? <WrongNote /> : null}
    </div>
  );
}

function WrongNote() {
  const locale = useLocale();
  return (
    <div className="mt-3 min-w-0 overflow-x-hidden rounded-2xl border border-dashed border-border-strong bg-surface px-4 py-3">
      <p className="text-[11px] font-medium tracking-wide text-accent">
        {locale === "en" ? "Wrong" : "错"}
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">
        {locale === "en"
          ? "Two solids in one bar. Both shout; neither is the primary."
          : "同一条里两个面状。两个都在喊，就没有主按钮。"}
      </p>
      <div className="mt-2.5 flex flex-wrap items-center gap-2 overflow-x-hidden">
        {WRONG_BAR.map((leaf, i) => (
          <ActionButton key={`${leaf.label.zh}-${i}`} kind={leaf.kind}>
            {pick(leaf.label, locale)}
          </ActionButton>
        ))}
      </div>
    </div>
  );
}
