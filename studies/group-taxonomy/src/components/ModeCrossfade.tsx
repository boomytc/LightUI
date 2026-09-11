import type { ReactNode } from "react";
import type { GroupMode } from "../lib/machines.js";

export function ModeCrossfade({
  mode,
  cards,
  grouped,
}: {
  mode: GroupMode;
  cards: ReactNode;
  grouped: ReactNode;
}) {
  return (
    <div className="mode-stack">
      <div
        className="mode-pane"
        data-active={mode === "cards" ? "true" : "false"}
        aria-hidden={mode !== "cards"}
      >
        {cards}
      </div>
      <div
        className="mode-pane"
        data-active={mode === "grouped" ? "true" : "false"}
        aria-hidden={mode !== "grouped"}
      >
        {grouped}
      </div>
    </div>
  );
}
