import { useMemo, useState } from "react";
import { PANEL_CODE, PANEL_PATCH } from "../lib/fixtures";
import { KINDS } from "../lib/kinds";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Btn, Window } from "./Frame";

type Range = { from: number; to: number };

function applyPatch(lines: string[], from: number, to: number, replacement: string): string[] {
  const next = replacement.replace(/\n$/, "").split("\n");
  return [...lines.slice(0, from), ...next, ...lines.slice(to + 1)];
}

export function PanelDemo() {
  const locale = useLocale();
  const meta = KINDS[1]!;
  const [code, setCode] = useState(PANEL_CODE);
  const [range, setRange] = useState<Range | null>({ from: 0, to: 2 });
  const [dragging, setDragging] = useState<number | null>(null);
  const [suggestion, setSuggestion] = useState(false);
  const [undo, setUndo] = useState<string | null>(null);
  const lines = useMemo(() => code.split("\n"), [code]);

  function select(from: number, to: number) {
    setRange({ from: Math.min(from, to), to: Math.max(from, to) });
    setSuggestion(false);
  }

  function apply() {
    if (!range) return;
    setUndo(code);
    setCode(applyPatch(lines, range.from, range.to, PANEL_PATCH.replacement).join("\n"));
    setSuggestion(false);
    setRange(null);
  }

  return (
    <Window title={pick(meta.window, locale)}>
      <div className="flex h-full min-w-0 overflow-x-hidden">
        <div
          className="min-w-0 flex-1 overflow-auto py-2 font-mono text-[12px] leading-5"
          onMouseUp={() => setDragging(null)}
          onMouseLeave={() => setDragging(null)}
        >
          {lines.map((line, i) => {
            const on = range != null && i >= range.from && i <= range.to;
            return (
              <button
                type="button"
                key={`${i}-${line}`}
                onMouseDown={() => {
                  setDragging(i);
                  select(i, i);
                }}
                onMouseEnter={() => {
                  if (dragging != null) select(dragging, i);
                }}
                className={cn("flex w-full min-w-0 text-left", on ? "bg-accent-soft" : "hover:bg-surface-2")}
              >
                <span className="w-7 shrink-0 pr-1.5 text-right text-[10px] text-fg-subtle tabular-nums">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate pr-2 text-fg">{line || " "}</span>
              </button>
            );
          })}
        </div>

        <aside className="flex w-[38%] min-w-0 shrink-0 flex-col overflow-x-hidden border-l border-border p-2.5">
          <p className="text-[11px] font-medium text-accent">{locale === "en" ? "Assist" : "AI 协作"}</p>
          {!range ? (
            <p className="mt-2 text-[11px] leading-relaxed text-fg-muted">
              {locale === "en" ? "Select the lines it should change." : "在左边拖选几行。选中哪段，它改哪段。"}
            </p>
          ) : (
            <div className="mt-2 space-y-2">
              <p className="text-[10px] text-fg-subtle">
                {locale === "en"
                  ? `Lines ${range.from + 1}–${range.to + 1}`
                  : `已选 ${range.from + 1}–${range.to + 1} 行`}
              </p>
              <Btn className="w-full min-w-0" onClick={() => setSuggestion(true)}>
                {locale === "en" ? "Review" : "看这段"}
              </Btn>
            </div>
          )}

          {suggestion ? (
            <div className="mt-3 min-w-0 rounded-xl border border-border bg-surface-2 p-2.5">
              <p className="text-[10px] font-medium text-accent">{locale === "en" ? "Suggestion" : "建议"}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-fg">{pick(PANEL_PATCH.advice, locale)}</p>
              <Btn className="mt-2 w-full min-w-0" onClick={apply}>
                {locale === "en" ? "Apply" : "应用修改"}
              </Btn>
            </div>
          ) : null}

          {undo ? (
            <button
              type="button"
              className="mt-2 text-left text-[11px] text-fg-muted hover:text-fg"
              onClick={() => {
                setCode(undo);
                setUndo(null);
              }}
            >
              {locale === "en" ? "Undo last apply" : "撤销刚才的修改"}
            </button>
          ) : null}
        </aside>
      </div>
    </Window>
  );
}
