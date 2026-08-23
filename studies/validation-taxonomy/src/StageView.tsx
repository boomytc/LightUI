import { KINDS, type KindId } from "./lib/kinds";
import { readStageQuery } from "./lib/stage-query";
import { useLocale } from "./lib/site-locale";
import { KindDemo } from "./form/Playground";

const IDS = new Set<string>(KINDS.map((k) => k.id));

export function StageView() {
  const locale = useLocale();
  const { kind, state } = readStageQuery("submit", IDS);
  const locked = state === "ok" ? "ok" : "error";
  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg px-8 py-12">
      <div data-stage="fixture" className="w-full min-w-0 max-w-[390px] overflow-x-hidden">
        <KindDemo id={kind as KindId} locale={locale} state={locked} />
      </div>
    </div>
  );
}
