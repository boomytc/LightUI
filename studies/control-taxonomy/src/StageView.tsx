import { KINDS, type KindId } from "./lib/kinds";
import { readStageQuery } from "./lib/stage-query";
import { KindDemo } from "./fields/Playground";

const IDS = new Set<string>(KINDS.map((k) => k.id));

export function StageView() {
  const { kind, state } = readStageQuery("text-field", IDS);
  const meta = KINDS.find((k) => k.id === kind);
  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg px-8 py-12">
      <div data-stage="fixture" className="w-full max-w-md">
        <KindDemo id={kind as KindId} state={state || meta?.defaultState} />
      </div>
    </div>
  );
}
