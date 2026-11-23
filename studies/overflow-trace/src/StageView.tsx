import { Fixture } from "./Fixture";
import { readStageQuery } from "./lib/stage-query";

export function StageView() {
  const { kind, state } = readStageQuery();
  return (
    <div data-stage="root" className="flex min-h-dvh items-center justify-center bg-bg p-4">
      <div data-stage="fixture" className="w-full max-w-[390px] min-w-0">
        <Fixture mode={state} cause={kind} />
      </div>
    </div>
  );
}
