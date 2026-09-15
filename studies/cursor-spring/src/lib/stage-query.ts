import type { LabPresetId } from "./machines";

export type StageParams = {
  preset: LabPresetId;
  sampleHz: number;
  overlay: boolean;
  driving: "demo" | "user";
};

export function readStageQuery(): StageParams {
  if (typeof window === "undefined") {
    return { preset: "soft", sampleHz: 16, overlay: true, driving: "demo" };
  }
  const params = new URLSearchParams(window.location.search);
  const rawPreset = params.get("preset") ?? params.get("kind");
  const preset: LabPresetId =
    rawPreset === "follow" || rawPreset === "jelly" || rawPreset === "heavy"
      ? rawPreset
      : "soft";

  const rawHz = Number(params.get("sampleHz") ?? params.get("hz") ?? params.get("state") ?? 16);
  const sampleHz = Number.isFinite(rawHz) && rawHz >= 2 && rawHz <= 60 ? rawHz : 16;

  const rawOverlay = params.get("overlay");
  const overlay = rawOverlay === "0" || rawOverlay === "false" ? false : true;

  const rawDriving = params.get("driving");
  const driving = rawDriving === "user" ? "user" : "demo";

  return { preset, sampleHz, overlay, driving };
}
