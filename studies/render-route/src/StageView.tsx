import { CompareBoard } from "./components/CompareBoard";
import { DegradeBoard } from "./components/DegradeBoard";
import { readStageQuery } from "./lib/stage-query";
import { useLocale } from "./lib/site-locale";
import "./route/route.css";

const KINDS = new Set(["compare", "degrade"]);

export function StageView() {
  const locale = useLocale();
  const { kind, state } = readStageQuery("compare", KINDS);

  return (
    <div data-stage="root" className="grid min-h-dvh place-items-center bg-bg px-4 py-8 sm:px-6">
      <div data-stage="fixture" className="w-full max-w-6xl min-w-0">
        {kind === "degrade" ? (
          <DegradeBoard locale={locale} lock={state || "unknown"} />
        ) : (
          <CompareBoard locale={locale} lock={state || "text"} />
        )}
      </div>
    </div>
  );
}
