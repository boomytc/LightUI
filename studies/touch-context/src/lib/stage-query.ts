export type StageParams = {
  activeBubbleId: string;
};

export function readStageQuery(): StageParams {
  if (typeof window === "undefined") {
    return { activeBubbleId: "c2" };
  }
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") ?? "c2";
  return { activeBubbleId: id };
}
