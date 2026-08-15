import { KINDS, type KindId } from "./lib/kinds";
import { readStageQuery } from "./lib/stage-query";
import { KindDemo } from "./navs/Playground";

const IDS = new Set<string>(KINDS.map((k) => k.id));

export function StageView() {
  const { kind, open } = readStageQuery("floating", IDS);
  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg px-8 py-12">
      <div data-stage="fixture" className="w-full max-w-4xl">
        <KindDemo id={kind as KindId} defaultOpen={open} />
      </div>
    </div>
  );
}
