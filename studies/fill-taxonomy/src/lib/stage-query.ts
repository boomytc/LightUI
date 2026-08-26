import { isDutyId, isStageState, type DutyId, type StageState } from "./machines";

export function readStageQuery(
  fallbackKind: DutyId = "label",
  fallbackState: StageState = "naive",
): { kind: DutyId; state: StageState } {
  const query = new URLSearchParams(window.location.search);
  const rawKind = query.get("kind") ?? fallbackKind;
  const rawState = query.get("state") ?? fallbackState;
  return {
    kind: isDutyId(rawKind) ? rawKind : fallbackKind,
    state: isStageState(rawState) ? rawState : fallbackState,
  };
}
