import { isKindId, KIND_IDS } from "./lib/machines";
import { readStageQuery } from "./lib/stage-query";
import { Desk } from "./table/Desk";

const IDS = new Set<string>(KIND_IDS);

export function StageView() {
  const { kind, state } = readStageQuery("filter", IDS);
  const id = isKindId(kind) ? kind : "filter";
  return (
    <div
      data-stage="root"
      className="grid min-h-dvh place-items-center overflow-x-hidden bg-bg px-4 py-10 sm:px-8"
    >
      <div data-stage="fixture" className="w-full min-w-0 max-w-3xl">
        <Desk key={`${id}:${state}`} kind={id} mode="stage" stageState={state} />
      </div>
    </div>
  );
}
