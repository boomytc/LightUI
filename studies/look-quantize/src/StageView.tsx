import { LookCanvas } from "./LookCanvas";
import { STAGE_POSES } from "./lib/look";
import { readStageQuery } from "./lib/stage-query";

export function StageView() {
  const { kind } = readStageQuery();
  const pose = STAGE_POSES[kind];

  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg px-8 py-12">
      <div data-stage="fixture" className="w-full max-w-xl">
        <LookCanvas
          radius={180}
          smoothing={0}
          lookY={1}
          autoBlink={false}
          showRadius={false}
          showGrid={false}
          locked={pose}
        />
      </div>
    </div>
  );
}
