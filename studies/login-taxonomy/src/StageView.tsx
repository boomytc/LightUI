import { KINDS, type KindId } from "./lib/kinds";
import { isKindId, isStepped, parseStepState } from "./lib/machines";
import { readStageQuery } from "./lib/stage-query";
import { KindDemo } from "./logins/Playground";

const IDS = new Set<string>(KINDS.map((k) => k.id));

export function StageView() {
  const { kind, state } = readStageQuery("centered", IDS);
  const id: KindId = isKindId(kind) ? kind : "centered";
  const step = isStepped(id) ? parseStepState(state) : undefined;
  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center overflow-x-hidden bg-bg px-4 py-10 sm:px-8">
      <div data-stage="fixture" className="w-[390px] max-w-full min-w-0">
        <KindDemo id={id} step={step} />
      </div>
    </div>
  );
}
