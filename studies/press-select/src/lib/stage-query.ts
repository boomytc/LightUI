import type { SelectionMode } from "./kinds";

export function readStageQuery(): { mode: SelectionMode; count: number } {
  const query = new URLSearchParams(window.location.search);
  const rawMode = query.get("mode") ?? "selecting";
  const mode: SelectionMode = rawMode === "normal" ? "normal" : "selecting";
  const count = Number(query.get("count") ?? "2");
  return { mode, count };
}
