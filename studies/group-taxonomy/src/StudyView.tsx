import { useEffect, useState } from "react";
import {
  PATTERN_MAP,
  nextPattern,
  prevPattern,
  type GroupMode,
  type PatternId,
} from "./lib/machines.js";
import { Overview } from "./components/Overview.js";
import { PatternStage } from "./components/PatternStage.js";
import { TaxonomyRail } from "./components/TaxonomyRail.js";

export function StudyView() {
  const [p, setP] = useState<PatternId>("overview");
  const [mode, setMode] = useState<GroupMode>("grouped");

  function open(id: PatternId, nextMode?: GroupMode) {
    setP(id);
    if (nextMode) setMode(nextMode);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "t" || event.key === "T") {
        event.preventDefault();
        setMode((prev) => (prev === "cards" ? "grouped" : "cards"));
      } else if (event.key === "ArrowRight" || event.key === "j") {
        event.preventDefault();
        setP((prev) => nextPattern(prev));
      } else if (event.key === "ArrowLeft" || event.key === "k") {
        event.preventDefault();
        setP((prev) => prevPattern(prev));
      } else if (event.key >= "0" && event.key <= "5") {
        const map: Record<string, PatternId> = {
          "0": "cards",
          "1": "whitespace",
          "2": "form",
          "3": "list",
          "4": "bands",
          "5": "compare",
        };
        const id = map[event.key];
        if (id) {
          event.preventDefault();
          setP(id);
        }
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pattern = p === "overview" ? null : PATTERN_MAP[p];

  return (
    <div className="page-width min-w-0 overflow-x-hidden pt-4 pb-20">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => open("overview")}
          className={`pressable text-sm font-medium transition-colors ${
            p === "overview" ? "text-fg" : "text-fg-muted hover:text-fg"
          }`}
        >
          概览
        </button>
        <p className="hidden items-center gap-1.5 text-[0.7rem] text-fg-subtle sm:flex">
          <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[0.65rem]">
            0–5
          </kbd>
          选技法
          <kbd className="ml-1 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[0.65rem]">
            T
          </kbd>
          对照
        </p>
      </div>

      <TaxonomyRail active={p === "overview" ? null : p} onOpen={open} />

      <main id="main" className="mt-10">
        {pattern ? (
          <PatternStage
            pattern={pattern}
            mode={mode}
            onMode={setMode}
            onOpen={open}
          />
        ) : (
          <Overview onOpen={open} />
        )}
      </main>
    </div>
  );
}
