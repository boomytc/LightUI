import { KINDS, type KindId } from "./lib/kinds";
import { KindDemo } from "./overlays/Playground";
import { readStageQuery } from "./lib/stage-query";

const IDS = new Set<string>(KINDS.map((k) => k.id));

export function StageView() {
  const { kind, open } = readStageQuery("select", IDS);
  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg px-8 py-12">
      <div data-stage="fixture" className="w-full max-w-xl">
        <KindDemo id={kind as KindId} defaultOpen={open} />
      </div>
    </div>
  );
}
