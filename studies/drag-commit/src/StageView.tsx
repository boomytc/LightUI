import { KindDemo } from "./drag/Playground";
import { KIND_IDS, isKindId } from "./lib/machines";
import { readStageQuery } from "./lib/stage-query";

const IDS = new Set<string>(KIND_IDS);

export function StageView() {
  const { kind, state } = readStageQuery("reorder", IDS);
  const id = isKindId(kind) ? kind : "reorder";
  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg px-8 py-12">
      <div data-stage="fixture" className="w-full min-w-0 max-w-2xl">
        <KindDemo id={id} compact state={state} />
      </div>
    </div>
  );
}
