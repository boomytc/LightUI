export type ActivityType = "online" | "offline" | "";

export type FormValues = {
  name: string;
  type: ActivityType;
  date: string;
  confirmed: boolean;
};

export type FieldKey = "name" | "type" | "date" | "confirmed";

export type ErrorCode =
  | "name-empty"
  | "name-short"
  | "type-empty"
  | "date-empty"
  | "date-past"
  | "confirm-empty";

export type FieldErrors = Partial<Record<FieldKey, ErrorCode>>;

export type LessonId = "blur" | "inline" | "submit";

export type LessonContext = {
  values: FormValues;
  touched: Record<FieldKey, boolean>;
  submitted: boolean;
};

export const FIELD_KEYS: FieldKey[] = ["name", "type", "date", "confirmed"];

export const EMPTY_VALUES: FormValues = {
  name: "",
  type: "",
  date: "",
  confirmed: false,
};

export const EMPTY_TOUCHED: Record<FieldKey, boolean> = {
  name: false,
  type: false,
  date: false,
  confirmed: false,
};

/** Frozen calendar day so stage stills and tests do not drift. */
export const STAGE_TODAY = "2026-08-23";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function todayISO(now = new Date()): string {
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

export function charCount(value: string): number {
  return Array.from(value.trim()).length;
}

export function validateField(
  key: FieldKey,
  values: FormValues,
  today = todayISO(),
): ErrorCode | undefined {
  switch (key) {
    case "name": {
      const name = values.name.trim();
      if (!name) return "name-empty";
      if (charCount(name) < 4) return "name-short";
      return undefined;
    }
    case "type":
      if (!values.type) return "type-empty";
      return undefined;
    case "date": {
      if (!values.date) return "date-empty";
      if (values.date < today) return "date-past";
      return undefined;
    }
    case "confirmed":
      if (!values.confirmed) return "confirm-empty";
      return undefined;
  }
}

export function validateAll(values: FormValues, today = todayISO()): FieldErrors {
  const errors: FieldErrors = {};
  for (const key of FIELD_KEYS) {
    const code = validateField(key, values, today);
    if (code) errors[key] = code;
  }
  return errors;
}

export function visibleErrors(
  values: FormValues,
  touched: Record<FieldKey, boolean>,
  submitted: boolean,
  today = todayISO(),
): FieldErrors {
  const all = validateAll(values, today);
  const shown: FieldErrors = {};
  for (const key of FIELD_KEYS) {
    if ((touched[key] || submitted) && all[key]) {
      shown[key] = all[key];
    }
  }
  return shown;
}

export function isFormReady(values: FormValues, today = todayISO()): boolean {
  return Object.keys(validateAll(values, today)).length === 0;
}

export function shownByLesson(
  lesson: LessonId,
  ctx: LessonContext,
  today = todayISO(),
): FieldErrors {
  const all = validateAll(ctx.values, today);
  if (lesson === "submit") {
    return ctx.submitted ? all : {};
  }
  const shown: FieldErrors = {};
  for (const key of FIELD_KEYS) {
    if (ctx.touched[key] && all[key]) shown[key] = all[key];
  }
  return shown;
}

export type MonthCell = { iso: string; day: number } | null;

export function yearMonth(iso: string): { y: number; m: number } {
  const y = Number(iso.slice(0, 4));
  const mo = Number(iso.slice(5, 7));
  if (!Number.isFinite(y) || !Number.isFinite(mo) || mo < 1 || mo > 12) {
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth() };
  }
  return { y, m: mo - 1 };
}

export function shiftMonth(y: number, m: number, delta: number): { y: number; m: number } {
  const next = new Date(y, m + delta, 1);
  return { y: next.getFullYear(), m: next.getMonth() };
}

export function monthCells(y: number, m: number): MonthCell[] {
  const weekday = new Date(y, m, 1).getDay();
  const blanks = (weekday + 6) % 7;
  const count = new Date(y, m + 1, 0).getDate();
  const cells: MonthCell[] = [];
  for (let i = 0; i < blanks; i++) cells.push(null);
  for (let d = 1; d <= count; d++) {
    cells.push({ iso: `${y}-${pad2(m + 1)}-${pad2(d)}`, day: d });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export type StageState = "error" | "ok";

export type StageSnapshot = {
  values: FormValues;
  touched: Record<FieldKey, boolean>;
  submitted: boolean;
  success: boolean;
  dateOpen: boolean;
};

const OK_VALUES: FormValues = {
  name: "夏日新品体验会",
  type: "online",
  date: "2026-09-12",
  confirmed: true,
};

export function stageSnapshot(kind: LessonId, state: StageState): StageSnapshot {
  if (state === "ok") {
    return {
      values: { ...OK_VALUES },
      touched: { name: true, type: true, date: true, confirmed: true },
      submitted: false,
      success: false,
      dateOpen: false,
    };
  }
  if (kind === "blur") {
    return {
      values: { ...OK_VALUES, name: "夏日" },
      touched: { name: true, type: false, date: false, confirmed: false },
      submitted: false,
      success: false,
      dateOpen: false,
    };
  }
  if (kind === "inline") {
    return {
      values: { ...OK_VALUES, type: "offline", date: "2026-01-01", confirmed: false },
      touched: { name: false, type: false, date: true, confirmed: false },
      submitted: false,
      success: false,
      dateOpen: false,
    };
  }
  return {
    values: { ...EMPTY_VALUES },
    touched: { ...EMPTY_TOUCHED },
    submitted: true,
    success: false,
    dateOpen: false,
  };
}
