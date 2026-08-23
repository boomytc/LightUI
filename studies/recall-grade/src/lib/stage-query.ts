import { isKindId, stageState, type KindId, type StageState } from "./machines";

export function readStageQuery(
  fallbackKind: KindId = "deck",
  fallbackState: StageState = "answer",
): { kind: KindId; state: StageState } {
  const query = new URLSearchParams(window.location.search);
  const rawKind = query.get("kind") ?? fallbackKind;
  const rawState = query.get("state") ?? fallbackState;
  return {
    kind: isKindId(rawKind) ? rawKind : fallbackKind,
    state: stageState(rawState),
  };
}
