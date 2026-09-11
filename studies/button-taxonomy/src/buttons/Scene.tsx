import { TRIO, WRONG_BAR } from "../lib/fixtures";
import { WEIGHT_LABEL } from "../lib/kinds";
import { primaryCount, tooManyPrimaries, weight, type KindId } from "../lib/machines";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { ActionButton, Window, type ButtonSkin } from "./Frame";
import "./button.css";

export type SceneState = "ok" | "wrong";

export function ActionRow({
  named,
  state,
  captioned,
  skin = "round",
}: {
  named?: KindId;
  state: SceneState;
  captioned?: boolean;
  skin?: ButtonSkin;
}) {
  const locale = useLocale();
  const wrong = state === "wrong";
  const leaves = wrong ? WRONG_BAR : TRIO;
  const crowded = tooManyPrimaries(primaryCount(leaves.map((leaf) => leaf.kind)));

  return (
    <div
      className={cn(
        "flex w-fit max-w-full flex-wrap items-end gap-2",
        crowded && "btn-clash rounded-xl border border-dashed border-wrong/40 bg-wrong-soft px-2.5 py-2",
      )}
    >
      {leaves.map((leaf, i) => {
        const on = !wrong && named != null && leaf.kind === named;
        return (
          <div key={`${leaf.kind}-${leaf.label.zh}-${i}`} className="flex flex-col items-center gap-1.5">
            <ActionButton kind={leaf.kind} named={on} skin={skin}>
              {pick(leaf.label, locale)}
            </ActionButton>
            {captioned ? (
              <span
                className={cn(
                  "text-[10px] font-medium tracking-[0.12em] uppercase",
                  wrong ? "text-wrong" : on ? "text-accent" : "text-fg-subtle",
                )}
              >
                {pick(WEIGHT_LABEL[weight(leaf.kind)], locale)}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function Scene({
  named,
  state = "ok",
}: {
  named: KindId;
  state?: SceneState;
}) {
  const locale = useLocale();
  const wrong = state === "wrong";

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

        <div className="mt-5">
          <ActionRow named={named} state={state} captioned />
        </div>

        {wrong ? (
          <p className="mt-3 text-[12px] leading-relaxed text-wrong">
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
    </div>
  );
}
