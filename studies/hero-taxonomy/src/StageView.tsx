import { KindDemo } from "./heroes/Playground";
import { KINDS, type KindId } from "./lib/kinds";
import { readStageQuery } from "./lib/stage-query";

const IDS = new Set<string>(KINDS.map((k) => k.id));

export function StageView() {
  const { kind } = readStageQuery("product", IDS);
  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center overflow-x-hidden bg-bg px-4 py-10 sm:px-8">
      <div data-stage="fixture" className="w-[390px] max-w-full min-w-0 overflow-x-hidden">
        <KindDemo id={kind as KindId} />
      </div>
    </div>
  );
}
