import { Timeline } from "./Timeline";
import { readStageQuery } from "./lib/stage-query";
export function StageView() {
  const { visible } = readStageQuery();
  return (
    <div className="grid min-h-dvh place-items-center bg-bg p-4">
      <div
        data-stage="fixture"
        className="w-[390px] max-w-full rounded-2xl border border-border bg-surface p-5"
      >
        <Timeline visible={visible} />
      </div>
    </div>
  );
}
