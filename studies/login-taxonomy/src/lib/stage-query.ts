export function readStageQuery(
  fallback: string,
  allowed: Set<string>,
): { kind: string; state: string } {
  const query = new URLSearchParams(window.location.search);
  const raw = query.get("kind") ?? fallback;
  const kind = allowed.has(raw) ? raw : fallback;
  return { kind, state: query.get("state") ?? "default" };
}
