import { KINDS, type KindId } from "./lib/kinds";
import { KindDemo } from "./overlays/Playground";
import { readStageQuery } from "./lib/stage-query";

const IDS = new Set<string>(KINDS.map((k) => k.id));

export function StageView() {
  const { kind, open } = readStageQuery("select", IDS);
  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center overflow-x-hidden bg-bg px-4 py-10 sm:px-8">
      <div data-stage="fixture" className="w-full min-w-0 max-w-xl">
        <KindDemo id={kind as KindId} defaultOpen={open} />
      </div>
    </div>
  );
}
