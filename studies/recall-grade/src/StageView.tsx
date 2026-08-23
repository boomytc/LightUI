import { readStageQuery } from "./lib/stage-query";
import { KindDemo } from "./recall/Playground";

export function StageView() {
  const { state } = readStageQuery("deck", "answer");

  return (
    <div
      data-stage="root"
      className="grid min-h-dvh place-items-center overflow-x-hidden bg-bg px-4 py-10 sm:px-8"
    >
      <div data-stage="fixture" className="w-[390px] max-w-full min-w-0 overflow-x-hidden">
        <KindDemo state={state} />
      </div>
    </div>
  );
}
