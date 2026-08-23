import { KIND_IDS, isKindId, stageState } from "./lib/machines";
import { readStageQuery } from "./lib/stage-query";
import { KindDemo } from "./pending/Playground";

const IDS = new Set<string>(KIND_IDS);

export function StageView() {
  const { kind, state } = readStageQuery("skeleton", IDS);
  const id = isKindId(kind) ? kind : "skeleton";
  const locked = stageState(state, id);
  return (
    <div
      data-stage="root"
      className="grid min-h-dvh place-items-center overflow-x-hidden bg-bg px-4 py-10 sm:px-8"
    >
      <div data-stage="fixture" className="w-[390px] max-w-full min-w-0 overflow-x-hidden">
        <KindDemo id={id} state={locked} />
      </div>
    </div>
  );
}
