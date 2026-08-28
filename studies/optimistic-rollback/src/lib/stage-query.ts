import type { SyncPhase } from "./kinds";

export function readStageQuery(): { kind: string; state: SyncPhase } {
  const query = new URLSearchParams(window.location.search);
  const kind = query.get("kind") ?? "bookmark";
  const rawState = query.get("state") ?? "syncing";
  const state: SyncPhase =
    rawState === "synced" || rawState === "error" || rawState === "idle" ? rawState : "syncing";
  return { kind, state };
}
