import { CAUSES, type Cause, type Mode } from "./machines";
export function readStageQuery(): { kind: Cause | "all"; state: Mode } {
  const query = new URLSearchParams(window.location.search);
  const raw = query.get("kind");
  const mode = query.get("state");
  return {
    kind: CAUSES.find((id) => id === raw) ?? "all",
    state: mode === "bug" || mode === "hide" ? mode : "fix",
  };
}
