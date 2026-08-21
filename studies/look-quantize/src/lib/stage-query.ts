import { STAGE_POSES, type StageKind } from "./look";

const KINDS = new Set<string>(Object.keys(STAGE_POSES));

export function readStageQuery(fallback: StageKind = "center"): { kind: StageKind } {
  const query = new URLSearchParams(window.location.search);
  const raw = query.get("kind") ?? fallback;
  return { kind: KINDS.has(raw) ? (raw as StageKind) : fallback };
}
