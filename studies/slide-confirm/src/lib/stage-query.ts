export type StageParams = {
  scenario: "destroy" | "transfer" | "delete_account";
  state: "idle" | "committed";
};

export function readStageQuery(): StageParams {
  if (typeof window === "undefined") {
    return { scenario: "destroy", state: "idle" };
  }
  const params = new URLSearchParams(window.location.search);
  const rawScenario = params.get("scenario") ?? params.get("kind");
  const scenario =
    rawScenario === "transfer" || rawScenario === "delete_account"
      ? rawScenario
      : "destroy";

  const rawState = params.get("state");
  const state = rawState === "committed" ? "committed" : "idle";

  return { scenario, state };
}
