export function readStageQuery(
  fallback: string,
  allowed: Set<string>,
): { kind: string; state: "open" | "closed" } {
  const query = new URLSearchParams(window.location.search);
  const raw = query.get("kind") ?? fallback;
  const kind = allowed.has(raw) ? raw : fallback;
  const state = query.get("state") === "closed" ? "closed" : "open";
  return { kind, state };
}
