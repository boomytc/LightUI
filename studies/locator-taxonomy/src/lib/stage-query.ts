export function readStageQuery(): {
  kind: string;
  state: string;
} {
  const query = new URLSearchParams(window.location.search);
  const kind = query.get("kind") ?? "anchor";
  const state = query.get("state") ?? "default";
  return { kind, state };
}
