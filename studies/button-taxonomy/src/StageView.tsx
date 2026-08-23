import { Scene } from "./buttons/Scene";
import { KINDS, type KindId } from "./lib/kinds";
import { readStageQuery } from "./lib/stage-query";

const IDS = new Set<string>(KINDS.map((k) => k.id));

export function StageView() {
  const { kind, state } = readStageQuery("solid", IDS);
  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg px-8 py-12">
      <div data-stage="fixture" className="w-full min-w-0 max-w-[390px] overflow-x-hidden">
        <Scene named={kind as KindId} state={state} />
      </div>
    </div>
  );
}
