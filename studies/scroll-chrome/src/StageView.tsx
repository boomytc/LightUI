import { Pane } from "./chrome/Pane";
import { KIND_IDS, isKindId, stageState } from "./lib/machines";
import { useLocale } from "./lib/site-locale";
import { readStageQuery } from "./lib/stage-query";

const IDS = new Set<string>(KIND_IDS);

export function StageView() {
  const { kind, state } = readStageQuery("track", IDS);
  const id = isKindId(kind) ? kind : "track";
  const locked = stageState(state);
  const locale = useLocale();

  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center overflow-x-hidden bg-bg px-4 py-10 sm:px-8">
      <div data-stage="fixture" className="w-[390px] max-w-full min-w-0 overflow-x-hidden">
        <Pane kind={id} locale={locale} lock={locked} />
      </div>
    </div>
  );
}
