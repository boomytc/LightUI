export type StageKind = "classic" | "aurora" | "flame";
export type StageState = "run" | "park";

const KINDS = new Set<string>(["classic", "aurora", "flame"]);
const STATES = new Set<string>(["run", "park"]);

export function readStageQuery(
  fallbackKind: StageKind = "classic",
  fallbackState: StageState = "run",
): { kind: StageKind; state: StageState } {
  const query = new URLSearchParams(window.location.search);
  const rawKind = query.get("kind") ?? fallbackKind;
  const rawState = query.get("state") ?? fallbackState;
  return {
    kind: KINDS.has(rawKind) ? (rawKind as StageKind) : fallbackKind,
    state: STATES.has(rawState) ? (rawState as StageState) : fallbackState,
  };
}
