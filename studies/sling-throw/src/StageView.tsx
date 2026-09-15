import { SlingTrack } from "./SlingTrack";
import { DEMO_VALUE } from "./lib/machines";
import { readStageQuery } from "./lib/stage-query";

export function StageView() {
  const query = readStageQuery();

  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg px-4 py-8 md:px-8">
      <div data-stage="fixture" className="w-full max-w-3xl">
        <SlingTrack
          kind={query.kind}
          value={DEMO_VALUE}
          locked
          lockState={query.state}
          showHint={false}
        />
      </div>
    </div>
  );
}
