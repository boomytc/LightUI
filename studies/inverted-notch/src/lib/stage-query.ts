export type StageKind = "shape" | "path" | "scoop";
export type StageState = "closed" | "open" | "exploded";

const KINDS = new Set<string>(["shape", "path", "scoop"]);
const STATES = new Set<string>(["closed", "open", "exploded"]);

export function readStageQuery(
  fallbackKind: StageKind = "shape",
  fallbackState: StageState = "closed",
): { kind: StageKind; state: StageState } {
  const query = new URLSearchParams(window.location.search);
  const rawKind = query.get("kind") ?? fallbackKind;
  const rawState = query.get("state") ?? fallbackState;
  return {
    kind: KINDS.has(rawKind) ? (rawKind as StageKind) : fallbackKind,
    state: STATES.has(rawState) ? (rawState as StageState) : fallbackState,
  };
}
