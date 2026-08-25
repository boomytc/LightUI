import { isKindId, type KindId } from "./machines";

export function readStageQuery(
  fallback: string,
  allowed: Set<string>,
): { kind: string; state: string } {
  const query = new URLSearchParams(window.location.search);
  const raw = query.get("kind") ?? fallback;
  const kind = allowed.has(raw) ? raw : fallback;
  return { kind, state: query.get("state") ?? "" };
}

export function normalizeStageState(kind: KindId, raw: string): string {
  if (kind === "accordion") return raw === "b" ? "b" : "a";
  if (kind === "tree") {
    if (raw === "collapsed" || raw === "closed") return "collapsed";
    return "expanded";
  }
  return raw === "closed" ? "closed" : "open";
}

export function stageKind(raw: string, fallback: KindId = "accordion"): KindId {
  return isKindId(raw) ? raw : fallback;
}
