import { KIND_IDS, isKindId, stageState } from "./lib/machines";
import { readStageQuery } from "./lib/stage-query";
import { KindDemo } from "./meters/Playground";

const IDS = new Set<string>(KIND_IDS);

export function StageView() {
  const { kind, state } = readStageQuery("fill", IDS);
  const id = isKindId(kind) ? kind : "fill";
  return (
    <div
      data-stage="root"
      className="grid min-h-dvh place-items-center overflow-x-auto bg-bg px-4 py-10 sm:px-8"
    >
      <div data-stage="fixture" className="w-[390px] max-w-[calc(100vw-2rem)] shrink-0">
        <KindDemo id={id} state={stageState(state)} />
      </div>
    </div>
  );
}
