import { EVENTS } from "./fixtures";
export function readStageQuery() {
  const state = new URLSearchParams(window.location.search).get("state");
  return {
    visible: state === "start" ? 1 : state === "mid" ? 2 : EVENTS.length,
  };
}
