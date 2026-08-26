import { type KindId } from "./lib/kinds";
import { readStageQuery } from "./lib/stage-query";
import { useLocale } from "./lib/site-locale";
import { KindDemo } from "./fill/Playground";

export function StageView() {
  const locale = useLocale();
  const { kind, state } = readStageQuery("label", "naive");
  const locked = state === "clear" ? "clear" : "naive";
  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg px-8 py-12">
      <div data-stage="fixture" className="w-full min-w-0 max-w-[390px] overflow-x-hidden">
        <KindDemo id={kind as KindId} locale={locale} state={locked} />
      </div>
    </div>
  );
}
