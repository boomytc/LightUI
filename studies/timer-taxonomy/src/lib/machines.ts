export type KindId = "stopwatch" | "focus";

export type StageState = "idle" | "running" | "paused" | "done";

export type TimerState = {
  running: boolean;
  startedAt: number | null;
  accumulated: number;
  mode: KindId;
  focusMinutes: number;
};

export type StageSnapshot = {
  elapsed: number;
  running: boolean;
};

export const KIND_IDS: readonly KindId[] = ["stopwatch", "focus"];

/** Product-length focus. Stage fixtures use this cap so remaining ~12:00 is visible. */
export const DEFAULT_FOCUS_MINUTES = 25;

/** Playground demo length so testers can see completion. */
export const PLAYGROUND_FOCUS_MINUTES = 1;

/** Frozen unix seconds for stage stills. Display must not read the wall clock. */
export const STAGE_NOW = 0;

const STAGE_FOCUS_ELAPSED = 13 * 60;
const STAGE_STOPWATCH_ELAPSED = 90;

export function isKindId(value: string): value is KindId {
  return (KIND_IDS as readonly string[]).includes(value);
}

export function isStageState(value: string): value is StageState {
  return value === "idle" || value === "running" || value === "paused" || value === "done";
}

export function stageState(raw: string, _kind: KindId = "focus"): StageState {
  void _kind;
  if (isStageState(raw)) return raw;
  return "running";
}

export function emptyTimer(
  mode: KindId = "stopwatch",
  focusMinutes = DEFAULT_FOCUS_MINUTES,
): TimerState {
  return {
    running: false,
    startedAt: null,
    accumulated: 0,
    mode,
    focusMinutes,
  };
}

/** Wall time and startedAt are unix seconds. */
export function liveSeconds(t: TimerState, now: number): number {
  const extra = t.running && t.startedAt != null ? Math.max(0, now - t.startedAt) : 0;
  return Math.max(0, t.accumulated + extra);
}

export function focusCapSeconds(minutes: number): number {
  const safe = Number.isFinite(minutes) ? minutes : 0;
  return Math.max(0, safe) * 60;
}

export function remainingSeconds(t: TimerState, now: number): number {
  if (t.mode !== "focus") return 0;
  return Math.max(0, focusCapSeconds(t.focusMinutes) - liveSeconds(t, now));
}

export function displaySeconds(t: TimerState, now: number): number {
  if (t.mode === "focus") return remainingSeconds(t, now);
  return liveSeconds(t, now);
}

/**
 * Focus progress is this session's elapsed/cap.
 * Stopwatch has no session percent — not a daily goal ring.
 */
export function sessionProgress(t: TimerState, now: number): number | null {
  if (t.mode !== "focus") return null;
  const cap = focusCapSeconds(t.focusMinutes);
  if (cap <= 0) return 0;
  const p = liveSeconds(t, now) / cap;
  if (!Number.isFinite(p) || p <= 0) return 0;
  if (p >= 1) return 1;
  return p;
}

export function shouldStopFocus(t: TimerState, now: number): boolean {
  return t.mode === "focus" && t.running && liveSeconds(t, now) >= focusCapSeconds(t.focusMinutes);
}

export function occupiesChrome(t: TimerState, now: number): boolean {
  return t.running || liveSeconds(t, now) > 0;
}

export function pause(t: TimerState, now: number): TimerState {
  if (!t.running) return t;
  return {
    ...t,
    running: false,
    startedAt: null,
    accumulated: liveSeconds(t, now),
  };
}

export function start(t: TimerState, now: number): TimerState {
  if (t.running) return t;
  if (t.mode === "focus" && liveSeconds(t, now) >= focusCapSeconds(t.focusMinutes)) return t;
  return {
    ...t,
    running: true,
    startedAt: now,
  };
}

/** Reset elapsed; keep the leaf and the chosen length. */
export function end(t: TimerState): TimerState {
  return {
    running: false,
    startedAt: null,
    accumulated: 0,
    mode: t.mode,
    focusMinutes: t.focusMinutes,
  };
}

export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

/**
 * Locked stills: running stopwatch is 90s; running focus remaining is 12:00
 * on a 25:00 cap (elapsed 13:00). Done is focus remaining 0; stopwatch done
 * is treated as paused with the same elapsed.
 */
export function stageSnapshot(kind: KindId, state: StageState): StageSnapshot {
  if (state === "idle") return { elapsed: 0, running: false };

  if (kind === "focus") {
    if (state === "done") return { elapsed: focusCapSeconds(DEFAULT_FOCUS_MINUTES), running: false };
    return { elapsed: STAGE_FOCUS_ELAPSED, running: state === "running" };
  }

  return { elapsed: STAGE_STOPWATCH_ELAPSED, running: state === "running" };
}

/** Build a frozen timer so liveSeconds(t, now) equals lock.elapsed. */
export function timerFromLock(
  kind: KindId,
  lock: StageSnapshot,
  now: number = STAGE_NOW,
): TimerState {
  return {
    running: lock.running,
    startedAt: lock.running ? now : null,
    accumulated: Math.max(0, lock.elapsed),
    mode: kind,
    focusMinutes: DEFAULT_FOCUS_MINUTES,
  };
}
