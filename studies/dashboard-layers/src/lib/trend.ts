export const PERIODS = [7, 30, 90] as const;
export type Period = (typeof PERIODS)[number];
/** Illustrative history ending with the authored week, never production data. */
export function historyFor(week: readonly number[]): number[] {
  if (!week.length) return [];
  const start = week[0]!;
  return [
    ...Array.from({ length: 83 }, (_, i) =>
      Math.max(0, start * (0.72 + (i / 83) * 0.28 + Math.sin(i * 0.4) * 0.025)),
    ),
    ...week,
  ];
}
export function trendWindow(
  history: readonly number[],
  period: Period,
): number[] {
  return history.slice(-period);
}
/** Endpoint change in this window, not YoY or MoM. Zero has no ratio baseline. */
export function windowChange(values: readonly number[]): number | null {
  if (values.length < 2 || values[0] === 0) return null;
  return (
    ((values[values.length - 1]! - values[0]!) / Math.abs(values[0]!)) * 100
  );
}
