export type ValueUnit = "number" | "percent";

export function formatValue(n: number, unit: ValueUnit): string {
  if (unit === "percent") return `${n.toFixed(1)}%`;
  return Math.round(n).toLocaleString("zh-CN");
}

export function formatDelta(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}
