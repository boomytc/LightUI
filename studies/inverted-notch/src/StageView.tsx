import { InvertedCard } from "./InvertedCard";
import { readStageQuery } from "./lib/stage-query";

export function StageView() {
  const { kind, state } = readStageQuery();
  const exploded = state === "exploded";
  const chipOpen = state === "open";

  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg px-8 py-12">
      <div data-stage="fixture">
        <InvertedCard
          technique={kind}
          exploded={exploded}
          locked
          chipOpen={chipOpen}
          interactive={false}
        />
      </div>
    </div>
  );
}
