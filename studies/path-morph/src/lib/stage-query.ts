export interface StageQueryParams {
  preset: string;
  t: number;
  mode: "polar" | "linear";
  showPoints: boolean;
}

export function readStageQuery(
  fallbackPreset: string,
  allowedPresets: Set<string>,
): StageQueryParams {
  if (typeof window === "undefined") {
    return {
      preset: fallbackPreset,
      t: 0.5,
      mode: "polar",
      showPoints: false,
    };
  }

  const query = new URLSearchParams(window.location.search);
  const rawPreset = query.get("preset") ?? fallbackPreset;
  const preset = allowedPresets.has(rawPreset) ? rawPreset : fallbackPreset;

  const rawT = parseFloat(query.get("t") ?? "0.5");
  const t = Number.isFinite(rawT) ? Math.max(0, Math.min(1, rawT)) : 0.5;

  const rawMode = query.get("mode");
  const mode = rawMode === "linear" ? "linear" : "polar";

  const showPoints = query.get("points") === "1" || query.get("points") === "true";

  return {
    preset,
    t,
    mode,
    showPoints,
  };
}
