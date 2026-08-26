export type DutyId =
  | "label"
  | "required"
  | "helper"
  | "group"
  | "hint"
  | "repair"
  | "done";

export type Phase = "before" | "during" | "after";

export type StageState = "naive" | "clear";

export type LiveTone = "idle" | "error" | "ok";

export type CopySlot = "none" | "helper" | "error" | "ok";

export type FieldRole = "required" | "optional";

export type FieldMark = {
  star: boolean;
  srRequired: boolean;
  optional: boolean;
};

export type GroupId = "event" | "signup" | "prefs";

export type FieldSpec = {
  id: string;
  group: GroupId;
  known: boolean;
  extra?: boolean;
};

export type Section = {
  group: GroupId | "flat";
  fields: FieldSpec[];
};

export type SeatValue = "standard" | "vip" | "";

export type RepairResult = {
  tone: LiveTone;
  remain?: number;
  invalid?: boolean;
};

export type Outcome = {
  title: string;
  what: string;
  next: string;
};

export const DUTY_IDS: DutyId[] = [
  "label",
  "required",
  "helper",
  "group",
  "hint",
  "repair",
  "done",
];

export const PHASE_IDS: Phase[] = ["before", "during", "after"];

export const SHORT_PHONE = "138 0000 0";

export const SIGNUP_FIELDS: FieldSpec[] = [
  { id: "title", group: "event", known: true },
  { id: "when", group: "event", known: true },
  { id: "place", group: "event", known: true },
  { id: "fee", group: "event", known: true, extra: true },
  { id: "cap", group: "event", known: true, extra: true },
  { id: "deadline", group: "event", known: true, extra: true },
  { id: "name", group: "signup", known: false },
  { id: "phone", group: "signup", known: false },
  { id: "email", group: "signup", known: false },
  { id: "seat", group: "prefs", known: false },
  { id: "diet", group: "prefs", known: false },
];

const PHASE: Record<DutyId, Phase> = {
  label: "before",
  required: "before",
  helper: "before",
  group: "before",
  hint: "during",
  repair: "during",
  done: "after",
};

export function isDutyId(value: string): value is DutyId {
  return (DUTY_IDS as string[]).includes(value);
}

export function isStageState(value: string): value is StageState {
  return value === "naive" || value === "clear";
}

export function phaseOf(id: DutyId): Phase {
  return PHASE[id];
}

export function dutiesIn(phase: Phase): DutyId[] {
  return DUTY_IDS.filter((id) => phaseOf(id) === phase);
}

export function identityLost(hasLabel: boolean, value: string): boolean {
  return !hasLabel && value.trim().length > 0;
}

export function fieldMark(clear: boolean, role: FieldRole): FieldMark {
  if (!clear) return { star: false, srRequired: false, optional: false };
  if (role === "required") return { star: true, srRequired: true, optional: false };
  return { star: false, srRequired: false, optional: true };
}

export function markIsAccessible(mark: FieldMark, role: FieldRole): boolean {
  if (role === "required") return mark.star && mark.srRequired;
  return mark.optional;
}

export function shownCopy(args: {
  hasHelper: boolean;
  hasError: boolean;
  hasOk: boolean;
}): CopySlot {
  if (args.hasError) return "error";
  if (args.hasOk) return "ok";
  if (args.hasHelper) return "helper";
  return "none";
}

export function stackedCopy(hasHelper: boolean, hasError: boolean): boolean {
  return hasHelper && hasError;
}

export function hintKind(
  field: "phone" | "email" | "seat",
  clear: boolean,
): "empty" | "format" | "preselected" {
  if (!clear) return "empty";
  return field === "seat" ? "preselected" : "format";
}

export function seatValue(clear: boolean): SeatValue {
  return clear ? "standard" : "";
}

export function fieldsFor(clear: boolean): FieldSpec[] {
  return SIGNUP_FIELDS.filter((field) => (clear ? !field.extra : true));
}

export function sectionsFor(clear: boolean): Section[] {
  const fields = fieldsFor(clear);
  if (!clear) return [{ group: "flat", fields }];
  return (["event", "signup", "prefs"] as const).map((group) => ({
    group,
    fields: fields.filter((field) => field.group === group),
  }));
}

export function isReadout(field: FieldSpec, clear: boolean): boolean {
  return clear && field.known;
}

export function asksKnownFact(clear: boolean): boolean {
  return fieldsFor(clear).some((field) => field.known && !isReadout(field, clear));
}

export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

export function formatPhone(value: string): string {
  const digits = phoneDigits(value);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
}

export function phoneRepair(value: string): RepairResult {
  const digits = phoneDigits(value);
  if (digits.length === 0) return { tone: "idle" };
  if (digits.length < 11) return { tone: "error", remain: 11 - digits.length };
  if (!/^1[3-9]\d{9}$/.test(digits)) return { tone: "error", invalid: true };
  return { tone: "ok" };
}

export function repairIsActionable(result: RepairResult): boolean {
  if (result.tone !== "error") return false;
  return result.remain != null || result.invalid === true;
}

export function repairPlacement(clear: boolean): "banner" | "field" {
  return clear ? "field" : "banner";
}

export function outcomeComplete(outcome: Pick<Outcome, "what" | "next">): boolean {
  return outcome.what.trim().length > 0 && outcome.next.trim().length > 0;
}

export type StageSnapshot = {
  typed: string;
  phone: string;
  email: string;
};

const EMPTY_SNAPSHOT: StageSnapshot = {
  typed: "",
  phone: "",
  email: "",
};

export function stageSnapshot(kind: DutyId, _state: StageState): StageSnapshot {
  if (kind === "label" || kind === "required") {
    return { ...EMPTY_SNAPSHOT, typed: "苏晓雨" };
  }
  if (kind === "helper" || kind === "repair") {
    return { ...EMPTY_SNAPSHOT, phone: SHORT_PHONE };
  }
  if (kind === "done") {
    return { typed: "苏晓雨", phone: "138 0000 0000", email: "sue@example.com" };
  }
  return { ...EMPTY_SNAPSHOT };
}
