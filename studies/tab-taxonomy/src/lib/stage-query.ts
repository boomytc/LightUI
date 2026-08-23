export function readStageQuery(
  fallback: string,
  allowed: Set<string>,
): { kind: string; tab: string } {
  const query = new URLSearchParams(window.location.search);
  const raw = query.get("kind") ?? fallback;
  const kind = allowed.has(raw) ? raw : fallback;
  return { kind, tab: query.get("state") ?? query.get("tab") ?? "" };
}
