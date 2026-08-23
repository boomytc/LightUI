export type KindId = "centered" | "split" | "immersive" | "roles" | "steps";

export type PaneCount = 1 | 2;

export type StepIndex = 1 | 2;

export type RoleId = "personal" | "enterprise";

export const KIND_IDS: readonly KindId[] = [
  "centered",
  "split",
  "immersive",
  "roles",
  "steps",
];

export const STEP_COUNT = 2;

export const DEFAULT_ROLE: RoleId = "personal";

export function isKindId(value: string): value is KindId {
  return (KIND_IDS as readonly string[]).includes(value);
}

/** Only the brand / form split occupies two panes. */
export function paneCount(kind: KindId): PaneCount {
  return kind === "split" ? 2 : 1;
}

/** Only steps advance a screen. Email then password — not one long form. */
export function isStepped(kind: KindId): boolean {
  return kind === "steps";
}

/** Only the role gate picks an identity before the form. */
export function needsRole(kind: KindId): boolean {
  return kind === "roles";
}

export function clampStep(n: number): StepIndex {
  if (!Number.isFinite(n) || n <= 1) return 1;
  return 2;
}

/** Stage `state=default|1` is screen 1. `state=2` is the password screen. */
export function parseStepState(state: string): StepIndex {
  return state.trim() === "2" ? 2 : 1;
}
