import { Fixture } from "./Fixture";
import { readStageQuery } from "./lib/stage-query";
export function StageView() {
  const { kind, state } = readStageQuery();
  return (
    <div className="grid min-h-dvh place-items-center bg-bg p-4">
      <div data-stage="fixture" className="w-[390px] max-w-full">
        <Fixture mode={state} cause={kind} />
      </div>
    </div>
  );
}
