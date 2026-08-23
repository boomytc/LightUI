import { KINDS, type KindId } from "./lib/kinds";
import { readStageQuery } from "./lib/stage-query";
import { KindDemo } from "./notices/Playground";

const IDS = new Set<string>(KINDS.map((k) => k.id));

export function StageView() {
  const { kind, state } = readStageQuery("badge", IDS);
  const meta = KINDS.find((k) => k.id === kind);
  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center overflow-x-hidden bg-bg px-4 py-10 sm:px-8">
      <div data-stage="fixture" className="w-[390px] max-w-[calc(100vw-2rem)] min-w-0 shrink-0">
        <KindDemo id={kind as KindId} state={state || meta?.defaultState} />
      </div>
    </div>
  );
}
