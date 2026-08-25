export type StageLock = "idle" | "lift";

export function readStageQuery(
  fallback: string,
  allowed: Set<string>,
): { kind: string; state: StageLock } {
  const query = new URLSearchParams(window.location.search);
  const raw = query.get("kind") ?? fallback;
  const kind = allowed.has(raw) ? raw : fallback;
  const state = query.get("state") === "lift" ? "lift" : "idle";
  return { kind, state };
}
