import { KindDemo } from "./craft/Playground";
import { readStageQuery } from "./lib/stage-query";

export function StageView() {
  const { kind, state } = readStageQuery("baseline", "right");
  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg px-8 py-12">
      <div data-stage="fixture" className="w-full min-w-0 max-w-lg">
        <KindDemo id={kind} state={state} />
      </div>
    </div>
  );
}
