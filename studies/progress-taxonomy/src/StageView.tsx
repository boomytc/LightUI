import { KIND_IDS, isKindId, stageState } from "./lib/machines";
import { readStageQuery } from "./lib/stage-query";
import { KindDemo } from "./meters/Playground";

const IDS = new Set<string>(KIND_IDS);

export function StageView() {
  const { kind, state } = readStageQuery("fill", IDS);
  const id = isKindId(kind) ? kind : "fill";
  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg px-8 py-12">
      <div data-stage="fixture" className="w-full min-w-0 max-w-md">
        <KindDemo id={id} state={stageState(state)} />
      </div>
    </div>
  );
}
