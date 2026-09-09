import type { SnapPoint } from "./machines";

export type StageParams = {
  snap: SnapPoint;
};

export function readStageQuery(): StageParams {
  if (typeof window === "undefined") {
    return { snap: "half" };
  }
  const params = new URLSearchParams(window.location.search);
  const snapParam = params.get("snap");
  if (snapParam === "peek" || snapParam === "half" || snapParam === "full") {
    return { snap: snapParam };
  }
  return { snap: "half" };
}
