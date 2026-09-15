import { ConeField } from "./ConeField";
import { DEMO_SECRET } from "./lib/machines";
import { readStageQuery } from "./lib/stage-query";

export function StageView() {
  const query = readStageQuery();
  const awake = query.state !== "asleep";
  const park = query.state === "search" ? "search" : query.state === "peek" ? "peek" : null;

  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg px-4 py-8 md:px-8">
      <div data-stage="fixture" className="w-full max-w-3xl">
        <ConeField
          kind={query.kind}
          awake={awake}
          instant
          locked
          showHint={false}
          showLabel={false}
          park={query.kind === "cone" ? park : null}
          followPointer={false}
          autoSearch={query.state === "search"}
          secret={DEMO_SECRET}
        />
      </div>
    </div>
  );
}
