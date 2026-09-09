export type StageParams = {
  openRowId: string | null;
  overswipe: boolean;
};

export function readStageQuery(): StageParams {
  if (typeof window === "undefined") {
    return { openRowId: "1", overswipe: false };
  }
  const params = new URLSearchParams(window.location.search);
  const row = params.get("row") ?? "1";
  const overswipe = params.get("overswipe") === "1";

  return { openRowId: row, overswipe };
}
