export type KindId =
  | "badge"
  | "toast"
  | "snackbar"
  | "marquee"
  | "inbox"
  | "alert"
  | "banner";

export type Weight = "weak" | "mid" | "strong";

export const KIND_IDS: readonly KindId[] = [
  "badge",
  "toast",
  "snackbar",
  "marquee",
  "inbox",
  "alert",
  "banner",
];

export function weight(kind: KindId): Weight {
  switch (kind) {
    case "badge":
    case "toast":
      return "weak";
    case "snackbar":
    case "marquee":
    case "inbox":
      return "mid";
    case "alert":
    case "banner":
      return "strong";
  }
}

export function autoDismissMs(kind: KindId): number {
  if (kind === "toast") return 2400;
  if (kind === "snackbar") return 5000;
  return 0;
}

export function persists(kind: KindId): boolean {
  return kind === "inbox" || kind === "alert" || kind === "banner";
}

export function needsAction(kind: KindId): boolean {
  return kind === "snackbar" || kind === "alert";
}

export function hideBadge(count: number): boolean {
  return count <= 0;
}

export function badgeLabel(count: number): string {
  if (count <= 0) return "";
  if (count > 99) return "99+";
  return String(count);
}

/** Alert must be seen, but no notice leaf modal-blocks the task. */
export function interruptsTask(kind: KindId): boolean {
  void kind;
  return false;
}

/** Stage `state=off|0` hides the notice; anything else is on. */
export function stageOn(state: string): boolean {
  return state !== "off" && state !== "0";
}

/** Badge stage: `off` → 0, `on` or empty → fallback, else parse a count. */
export function stageBadgeCount(state: string, fallback = 3): number {
  if (state === "off") return 0;
  if (state === "" || state === "on") return fallback;
  const n = Number(state);
  if (!Number.isFinite(n)) return fallback;
  return n;
}
