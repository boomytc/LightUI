import { Timeline } from "./Timeline";
import { readStageQuery } from "./lib/stage-query";

export function StageView() {
  const { visible } = readStageQuery();
  return (
    <div data-stage="root" className="flex min-h-dvh items-center justify-center bg-bg p-4">
      <div
        data-stage="fixture"
        className="w-full max-w-[390px] min-w-0 rounded-2xl border border-border bg-surface p-5"
      >
        <Timeline visible={visible} />
      </div>
    </div>
  );
}
