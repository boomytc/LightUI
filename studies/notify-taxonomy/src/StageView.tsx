import { KINDS, type KindId } from "./lib/kinds";
import { readStageQuery } from "./lib/stage-query";
import { KindDemo } from "./notices/Playground";

const IDS = new Set<string>(KINDS.map((k) => k.id));

export function StageView() {
  const { kind, state } = readStageQuery("badge", IDS);
  const meta = KINDS.find((k) => k.id === kind);
  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center overflow-x-hidden bg-bg px-4 py-10">
      <div data-stage="fixture" className="w-full min-w-0 max-w-[390px]">
        <KindDemo id={kind as KindId} state={state || meta?.defaultState} />
      </div>
    </div>
  );
}
