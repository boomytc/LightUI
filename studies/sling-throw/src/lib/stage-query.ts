import type { SlingKind } from "./machines";

export type StageState = "idle" | "pull";

export type StageParams = {
  kind: SlingKind;
  state: StageState;
};

export function readStageQuery(): StageParams {
  if (typeof window === "undefined") {
    return { kind: "sling", state: "pull" };
  }
  const params = new URLSearchParams(window.location.search);
  const rawKind = params.get("kind");
  const kind: SlingKind = rawKind === "clamp" ? "clamp" : "sling";
  const rawState = params.get("state");
  const state: StageState = rawState === "idle" ? "idle" : "pull";
  return { kind, state };
}
