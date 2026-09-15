import type { RevealKind } from "./machines";

export type StageState = "asleep" | "peek" | "search";

export type StageParams = {
  kind: RevealKind;
  state: StageState;
};

export function readStageQuery(): StageParams {
  if (typeof window === "undefined") {
    return { kind: "cone", state: "peek" };
  }
  const params = new URLSearchParams(window.location.search);
  const rawKind = params.get("kind");
  const kind: RevealKind =
    rawKind === "toggle" || rawKind === "nearest" ? rawKind : "cone";
  const rawState = params.get("state");
  const state: StageState =
    rawState === "asleep" || rawState === "search" ? rawState : "peek";
  return { kind, state };
}
