import { useEffect, useState } from "react";
import {
  NAV_ITEMS,
  PATTERN_MAP,
  nextPattern,
  prevPattern,
  type GroupMode,
  type PatternId,
} from "./lib/machines.js";
import { Overview } from "./components/Overview.js";
import { PatternStage } from "./components/PatternStage.js";

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
      {/* Navigation Bar */}
      <nav aria-label="分组技法导航" className="mb-8 border-b border-border pb-3">
        <div className="flex items-center justify-between gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-1.5 shrink-0">
            {NAV_ITEMS.map((item) => {
              const active = item.id === p;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => open(item.id)}
                  className={`pressable flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-fg text-surface shadow-sm"
                      : "bg-surface-2 text-fg-muted hover:bg-surface hover:text-fg border border-border"
                  }`}
                >
                  {item.num ? (
                    <span
                      className={`font-mono text-[0.65rem] ${
                        active ? "text-accent-soft" : "text-accent"
                      }`}
                    >
                      {item.num}
                    </span>
                  ) : null}
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="hidden items-center gap-1 text-[0.7rem] text-fg-subtle sm:flex shrink-0">
            <kbd className="rounded bg-surface px-1.5 py-0.5 font-mono text-[0.65rem] border border-border">
              0-5
            </kbd>
            <span>选技法</span>
            <kbd className="ml-2 rounded bg-surface px-1.5 py-0.5 font-mono text-[0.65rem] border border-border">
              T
            </kbd>
            <span>对照</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main id="main">
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
