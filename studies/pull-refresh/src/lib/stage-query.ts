import type { RefreshPhase } from "./kinds";

export function readStageQuery(): { state: RefreshPhase; pull: number } {
  const query = new URLSearchParams(window.location.search);
  const rawState = query.get("state") ?? query.get("kind") ?? "ready";
  const state: RefreshPhase =
    rawState === "pulling" || rawState === "ready" || rawState === "refreshing" || rawState === "settled"
      ? rawState
      : "ready";
  const defaultPull = state === "pulling" ? 32 : state === "ready" ? 56 : state === "refreshing" ? 48 : 0;
  const rawPull = query.get("pull");
  const pull = rawPull !== null ? Number(rawPull) : defaultPull;
  return { state, pull };
}
