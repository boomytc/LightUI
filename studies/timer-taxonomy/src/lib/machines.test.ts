import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_FOCUS_MINUTES,
  KIND_IDS,
  STAGE_NOW,
  displaySeconds,
  emptyTimer,
  end,
  focusCapSeconds,
  formatDuration,
  isKindId,
  liveSeconds,
  occupiesChrome,
  pause,
  remainingSeconds,
  sessionProgress,
  shouldStopFocus,
  stageSnapshot,
  stageState,
  start,
  timerFromLock,
  type KindId,
  type TimerState,
} from "./machines";

function focus(partial: Partial<TimerState> = {}): TimerState {
  return {
    running: false,
    startedAt: null,
    accumulated: 0,
    mode: "focus",
    focusMinutes: 1,
    ...partial,
  };
}

function watch(partial: Partial<TimerState> = {}): TimerState {
  return {
    running: false,
    startedAt: null,
    accumulated: 0,
    mode: "stopwatch",
    focusMinutes: DEFAULT_FOCUS_MINUTES,
    ...partial,
  };
}

describe("KIND_IDS", () => {
  it("is the two leaves", () => {
    const ids: readonly KindId[] = KIND_IDS;
    assert.deepEqual(ids, ["stopwatch", "focus"]);
  });
});

describe("isKindId", () => {
  it("accepts the two leaves and rejects progress / notice slugs", () => {
    assert.equal(isKindId("stopwatch"), true);
    assert.equal(isKindId("focus"), true);
    assert.equal(isKindId("spin"), false);
    assert.equal(isKindId("toast"), false);
    assert.equal(isKindId("pomodoro"), false);
    assert.equal(isKindId(""), false);
  });
});

describe("liveSeconds", () => {
  it("includes running elapsed time", () => {
    const t = watch({ running: true, startedAt: 1000, accumulated: 10 });
    assert.equal(liveSeconds(t, 1005), 15);
  });

  it("ignores wall time when not running", () => {
    const t = watch({ running: false, startedAt: 1000, accumulated: 10 });
    assert.equal(liveSeconds(t, 9999), 10);
  });
});

describe("pause", () => {
  it("freezes accumulated at live and stops", () => {
    const running = watch({ running: true, startedAt: 100, accumulated: 5 });
    const paused = pause(running, 140);
    assert.equal(paused.running, false);
    assert.equal(paused.accumulated, 45);
    assert.equal(paused.startedAt, null);
    assert.equal(liveSeconds(paused, 400), 45);
  });
});

describe("start / end", () => {
  it("resumes from accumulated without losing it", () => {
    const paused = watch({ accumulated: 45 });
    const resumed = start(paused, 200);
    assert.equal(resumed.running, true);
    assert.equal(liveSeconds(resumed, 210), 55);
  });

  it("end zeros elapsed and keeps the leaf", () => {
    const t = focus({ running: true, startedAt: 0, accumulated: 12, focusMinutes: 1 });
    const cleared = end(t);
    assert.equal(cleared.running, false);
    assert.equal(cleared.accumulated, 0);
    assert.equal(cleared.startedAt, null);
    assert.equal(cleared.mode, "focus");
    assert.equal(cleared.focusMinutes, 1);
  });

  it("does not start a focus session that already hit the cap", () => {
    const done = focus({ accumulated: 60, focusMinutes: 1 });
    const next = start(done, 900);
    assert.equal(next.running, false);
    assert.equal(next.accumulated, 60);
  });
});

describe("focus remaining", () => {
  it("hits 0 and shouldStopFocus when live reaches the cap", () => {
    const t = focus({ running: true, startedAt: 0, accumulated: 0, focusMinutes: 1 });
    assert.equal(focusCapSeconds(1), 60);
    assert.equal(remainingSeconds(t, 60), 0);
    assert.equal(shouldStopFocus(t, 60), true);
    assert.equal(displaySeconds(t, 60), 0);
  });

  it("pauses at the cap instead of running past it", () => {
    const t = focus({ running: true, startedAt: 0, focusMinutes: 1 });
    const stopped = pause(t, 60);
    assert.equal(stopped.running, false);
    assert.equal(remainingSeconds(stopped, 80), 0);
    assert.equal(shouldStopFocus(stopped, 80), false);
  });
});

describe("sessionProgress", () => {
  it("is null for stopwatch — no session percent", () => {
    const t = watch({ running: true, startedAt: 0, accumulated: 90 });
    assert.equal(sessionProgress(t, 30), null);
  });

  it("is this session's elapsed/cap for focus", () => {
    const t = focus({ running: true, startedAt: 0, accumulated: 0, focusMinutes: 25 });
    assert.equal(sessionProgress(t, 13 * 60), 13 / 25);
    assert.equal(sessionProgress(t, 0), 0);
    assert.equal(sessionProgress(t, 25 * 60), 1);
  });
});

describe("displaySeconds", () => {
  it("never goes negative past a focus cap", () => {
    const t = focus({ running: true, startedAt: 0, focusMinutes: 1 });
    assert.equal(displaySeconds(t, 90), 0);
    assert.ok(displaySeconds(t, 90) >= 0);
  });

  it("counts up for stopwatch and down for focus", () => {
    const up = watch({ running: true, startedAt: 0, accumulated: 0 });
    const down = focus({ running: true, startedAt: 0, accumulated: 0, focusMinutes: 1 });
    assert.equal(displaySeconds(up, 12), 12);
    assert.equal(displaySeconds(down, 12), 48);
  });
});

describe("formatDuration", () => {
  it("uses m:ss under an hour and h:mm:ss at or above", () => {
    assert.equal(formatDuration(0), "00:00");
    assert.equal(formatDuration(90), "01:30");
    assert.equal(formatDuration(12 * 60), "12:00");
    assert.equal(formatDuration(3600), "1:00:00");
    assert.equal(formatDuration(-8), "00:00");
  });
});

describe("stageSnapshot", () => {
  it("defaults the stage to a mid-session focus countdown", () => {
    assert.equal(stageState(""), "running");
    assert.equal(stageState("idle"), "idle");
    const snap = stageSnapshot("focus", "running");
    assert.equal(snap.elapsed, 13 * 60);
    assert.equal(snap.running, true);
    const t = timerFromLock("focus", snap, STAGE_NOW);
    assert.equal(displaySeconds(t, STAGE_NOW), 12 * 60);
    assert.equal(liveSeconds(t, STAGE_NOW), 13 * 60);
  });

  it("locks stopwatch running at 90s and treats done as paused elapsed", () => {
    const run = stageSnapshot("stopwatch", "running");
    assert.deepEqual(run, { elapsed: 90, running: true });
    assert.deepEqual(stageSnapshot("stopwatch", "paused"), { elapsed: 90, running: false });
    assert.deepEqual(stageSnapshot("stopwatch", "done"), { elapsed: 90, running: false });
    assert.deepEqual(stageSnapshot("stopwatch", "idle"), { elapsed: 0, running: false });
  });

  it("locks focus done at remaining 0, not running", () => {
    const done = stageSnapshot("focus", "done");
    assert.equal(done.running, false);
    const t = timerFromLock("focus", done, STAGE_NOW);
    assert.equal(displaySeconds(t, STAGE_NOW), 0);
    assert.equal(remainingSeconds(t, STAGE_NOW), 0);
  });
});

describe("occupiesChrome", () => {
  it("is true while running or while elapsed remains", () => {
    assert.equal(occupiesChrome(emptyTimer("focus", 1), 0), false);
    assert.equal(occupiesChrome(start(emptyTimer("stopwatch"), 10), 10), true);
    assert.equal(occupiesChrome(watch({ accumulated: 90 }), 0), true);
  });
});
