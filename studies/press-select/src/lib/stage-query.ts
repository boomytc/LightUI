import type { SelectionMode } from "./kinds";

export function readStageQuery(): { mode: SelectionMode; count: number } {
  const query = new URLSearchParams(window.location.search);
  const rawMode = query.get("mode") ?? query.get("kind") ?? "selecting";
  const mode: SelectionMode = rawMode === "normal" ? "normal" : "selecting";
  const rawCount = query.get("count") ?? query.get("state") ?? "2";
  const parsedCount = Number(rawCount);
  const count = Number.isNaN(parsedCount) ? (mode === "normal" ? 0 : 2) : parsedCount;
  return { mode, count };
}
