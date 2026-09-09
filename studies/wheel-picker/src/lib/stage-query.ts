export type StageParams = {
  hour: number;
  minute: number;
};

export function readStageQuery(): StageParams {
  if (typeof window === "undefined") {
    return { hour: 8, minute: 30 };
  }
  const params = new URLSearchParams(window.location.search);
  const hourParam = Number.parseInt(params.get("hour") ?? "8", 10);
  const minuteParam = Number.parseInt(params.get("minute") ?? "30", 10);

  const hour = Number.isNaN(hourParam) ? 8 : Math.max(0, Math.min(23, hourParam));
  const minute = Number.isNaN(minuteParam) ? 30 : Math.max(0, Math.min(59, minuteParam));

  return { hour, minute };
}
