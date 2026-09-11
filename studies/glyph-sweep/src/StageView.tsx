import { ShimmerLine } from "./ShimmerLine";
import { readStageQuery } from "./lib/stage-query";

export function StageView() {
  const { kind, state } = readStageQuery();
  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg px-8 py-12">
      <div data-stage="fixture" className="min-w-0">
        <ShimmerLine
          text="CSS is awesome"
          style={kind}
          secondsPerChar={0.12}
          spread={3}
          angle={295}
          park={state === "park"}
          position={42}
        />
      </div>
    </div>
  );
}
