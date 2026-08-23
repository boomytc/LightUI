export type StageState = "ok" | "wrong";

export function readStageQuery(
  fallback: string,
  allowed: Set<string>,
): { kind: string; state: StageState } {
  const query = new URLSearchParams(window.location.search);
  const raw = query.get("kind") ?? fallback;
  const kind = allowed.has(raw) ? raw : fallback;
  const state = query.get("state") === "wrong" ? "wrong" : "ok";
  return { kind, state };
}
