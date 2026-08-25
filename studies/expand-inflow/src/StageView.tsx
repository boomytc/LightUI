import { KIND_IDS } from "./lib/machines";
import { normalizeStageState, readStageQuery, stageKind } from "./lib/stage-query";
import { KindDemo } from "./expand/Playground";
import "./expand/expand.css";

const IDS = new Set<string>(KIND_IDS);

export function StageView() {
  const { kind, state } = readStageQuery("accordion", IDS);
  const id = stageKind(kind);
  const locked = normalizeStageState(id, state);
  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg px-8 py-12">
      <div data-stage="fixture" className="w-full min-w-0 max-w-2xl">
        <KindDemo id={id} state={locked} compact />
      </div>
    </div>
  );
}
