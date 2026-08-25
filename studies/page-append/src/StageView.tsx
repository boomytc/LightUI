import { KIND_IDS, isKindId, stageState } from "./lib/machines";
import { readStageQuery } from "./lib/stage-query";
import { KindDemo } from "./records/Playground";

const IDS = new Set<string>(KIND_IDS);

export function StageView() {
  const { kind, state } = readStageQuery("page", IDS);
  const id = isKindId(kind) ? kind : "page";
  const locked = stageState(state, id);
  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg px-8 py-12">
      <div data-stage="fixture" className="w-full min-w-0 max-w-lg">
        <KindDemo id={id} state={locked} compact />
      </div>
    </div>
  );
}
