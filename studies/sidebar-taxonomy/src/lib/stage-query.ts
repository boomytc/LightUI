export function readStageQuery(fallback: string, allowed: Set<string>): { kind: string; open: boolean } {
  const query = new URLSearchParams(window.location.search);
  const raw = query.get("kind") ?? fallback;
  const kind = allowed.has(raw) ? raw : fallback;
  return { kind, open: query.get("state") === "open" };
}
