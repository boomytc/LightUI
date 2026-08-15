export type Day = { y: number; m: number; d: number };

export type DateRange = {
  from: Day | null;
  to: Day | null;
};

export function day(y: number, m: number, d: number): Day {
  return { y, m, d };
}

export function fromDate(value: Date): Day {
  return { y: value.getFullYear(), m: value.getMonth(), d: value.getDate() };
}

export function toDate(value: Day): Date {
  return new Date(value.y, value.m, value.d);
}

export function todayDay(now = new Date()): Day {
  return fromDate(now);
}

export function compareDay(a: Day, b: Day): number {
  if (a.y !== b.y) return a.y < b.y ? -1 : 1;
  if (a.m !== b.m) return a.m < b.m ? -1 : 1;
  if (a.d !== b.d) return a.d < b.d ? -1 : 1;
  return 0;
}

export function isSameDay(a: Day, b: Day): boolean {
  return compareDay(a, b) === 0;
}

export function isBeforeDay(a: Day, b: Day): boolean {
  return compareDay(a, b) < 0;
}

export function isPastDay(value: Day, today: Day): boolean {
  return isBeforeDay(value, today);
}

export function nightsBetween(from: Day, to: Day): number {
  const ms = toDate(to).getTime() - toDate(from).getTime();
  return Math.round(ms / 86_400_000);
}

export function inRange(value: Day, range: DateRange): boolean {
  if (!range.from || !range.to) return false;
  return compareDay(value, range.from) >= 0 && compareDay(value, range.to) <= 0;
}

export function isRangeEnd(value: Day, range: DateRange): boolean {
  return Boolean(
    (range.from && isSameDay(value, range.from)) || (range.to && isSameDay(value, range.to)),
  );
}

export function pickRangeDay(range: DateRange, value: Day, today: Day): DateRange {
  if (isPastDay(value, today)) return range;
  if (!range.from || range.to) {
    return { from: value, to: null };
  }
  if (compareDay(value, range.from) <= 0) {
    return { from: value, to: null };
  }
  return { from: range.from, to: value };
}

export function daysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate();
}

export function addMonths(value: Day, delta: number): Day {
  const next = new Date(value.y, value.m + delta, 1);
  return { y: next.getFullYear(), m: next.getMonth(), d: 1 };
}

/** 0 = Sunday. weekStartsOn: 0 Sunday, 1 Monday. */
export function leadingBlanks(y: number, m: number, weekStartsOn: 0 | 1): number {
  const weekday = new Date(y, m, 1).getDay();
  return weekStartsOn === 1 ? (weekday + 6) % 7 : weekday;
}

export function monthCells(y: number, m: number, weekStartsOn: 0 | 1): Array<Day | null> {
  const blanks = leadingBlanks(y, m, weekStartsOn);
  const count = daysInMonth(y, m);
  const cells: Array<Day | null> = [];
  for (let i = 0; i < blanks; i++) cells.push(null);
  for (let d = 1; d <= count; d++) cells.push({ y, m, d });
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function formatIso(value: Day): string {
  const mm = String(value.m + 1).padStart(2, "0");
  const dd = String(value.d).padStart(2, "0");
  return `${value.y}-${mm}-${dd}`;
}
