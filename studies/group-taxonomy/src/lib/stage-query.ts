import type { GroupMode, PatternMeta } from "./machines.js";

export function readStageQuery(): {
  kind: PatternMeta["id"];
  mode: GroupMode;
} {
  const query = new URLSearchParams(window.location.search);
  const rawKind = query.get("kind") ?? "whitespace";
  const kind: PatternMeta["id"] =
    rawKind === "cards" ||
    rawKind === "whitespace" ||
    rawKind === "form" ||
    rawKind === "list" ||
    rawKind === "bands" ||
    rawKind === "compare"
      ? rawKind
      : "whitespace";
  const rawMode = query.get("mode") ?? "grouped";
  const mode: GroupMode = rawMode === "cards" ? "cards" : "grouped";
  return { kind, mode };
}
