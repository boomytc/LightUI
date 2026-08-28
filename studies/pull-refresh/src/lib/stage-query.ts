import type { RefreshPhase } from "./kinds";

export function readStageQuery(): { state: RefreshPhase; pull: number } {
  const query = new URLSearchParams(window.location.search);
  const rawState = query.get("state") ?? "ready";
  const state: RefreshPhase =
    rawState === "pulling" || rawState === "ready" || rawState === "refreshing" || rawState === "settled"
      ? rawState
      : "ready";
  const pull = Number(query.get("pull") ?? (state === "ready" ? "56" : "0"));
  return { state, pull };
}
