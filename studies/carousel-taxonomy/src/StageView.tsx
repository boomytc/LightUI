import { KINDS, type KindId } from "./lib/kinds";
import { isKindId, stageIndex } from "./lib/machines";
import { readStageQuery } from "./lib/stage-query";
import { KindDemo } from "./slides/Playground";

const IDS = new Set<string>(KINDS.map((k) => k.id));

export function StageView() {
  const { kind, state } = readStageQuery("classic", IDS);
  const id: KindId = isKindId(kind) ? kind : "classic";
  const index = stageIndex(state);
  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center overflow-x-hidden bg-bg px-4 py-12">
      <div data-stage="fixture" className="w-[390px] max-w-full min-w-0">
        <KindDemo id={id} index={index} autoplay={false} />
      </div>
    </div>
  );
}
