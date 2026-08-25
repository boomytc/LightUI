import { KIND_IDS, isKindId, stageLock } from "./lib/machines";
import { readStageQuery } from "./lib/stage-query";
import { KindDemo } from "./guides/Playground";

const IDS = new Set<string>(KIND_IDS);

export function StageView() {
  const { kind, state } = readStageQuery("tour", IDS);
  const id = isKindId(kind) ? kind : "tour";
  const lock = stageLock(id, state);
  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg px-8 py-12">
      <div data-stage="fixture" className="w-full min-w-0 max-w-2xl">
        <KindDemo key={`${id}-${lock}`} id={id} state={lock} compact />
      </div>
    </div>
  );
}
