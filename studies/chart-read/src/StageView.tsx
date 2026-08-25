import { KindDemo } from "./charts/Playground";
import { KIND_IDS, isKindId, stageState } from "./lib/machines";
import { readStageQuery } from "./lib/stage-query";
import "./charts/charts.css";

const IDS = new Set<string>(KIND_IDS);

export function StageView() {
  const { kind, state } = readStageQuery("brush", IDS);
  const id = isKindId(kind) ? kind : "brush";
  const locked = stageState(id, state);
  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg px-8 py-12">
      <div data-stage="fixture" className="w-full min-w-0 max-w-2xl">
        <KindDemo id={id} state={locked} compact />
      </div>
    </div>
  );
}
