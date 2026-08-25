import { CompareView } from "./components/CompareView.tsx";
import { QueryDock } from "./components/QueryDock.tsx";
import { ScoreView } from "./components/ScoreView.tsx";
import { readStageQuery } from "./lib/stage-query.ts";
import "./bm25/bm25.css";

const ALLOWED_KINDS = new Set(["compare", "score"]);

export function StageView() {
  const { kind } = readStageQuery("compare", ALLOWED_KINDS);

  return (
    <div
      data-stage="root"
      className="grid min-h-dvh place-items-center overflow-x-hidden bg-bg px-4 py-8 sm:px-6"
    >
      <div data-stage="fixture" className="w-full max-w-4xl min-w-0 overflow-x-hidden space-y-4">
        <div className="rounded-2xl bg-surface p-4 border border-border shadow-sm">
          <QueryDock />
        </div>
        {kind === "score" ? <ScoreView /> : <CompareView />}
      </div>
    </div>
  );
}
