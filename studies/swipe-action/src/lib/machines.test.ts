import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  resolveGestureLock,
  calcDragOffset,
  resolveSwipeRelease,
  calcActionProgress,
  DEFAULT_ACTIONS_WIDTH,
  DEFAULT_COMMIT_THRESHOLD,
  DEFAULT_LOCK_THRESHOLD,
} from "./machines.js";

describe("swipe-action machines", () => {
  it("resolveGestureLock keeps undecided within threshold circle", () => {
    assert.equal(resolveGestureLock(0, 0, DEFAULT_LOCK_THRESHOLD), "undecided");
    assert.equal(resolveGestureLock(0, 0, 0), "undecided"); // zero movement remains undecided even with 0 threshold
    assert.equal(resolveGestureLock(4, 4, DEFAULT_LOCK_THRESHOLD), "undecided");
    assert.equal(resolveGestureLock(-5, 3, DEFAULT_LOCK_THRESHOLD), "undecided");
    assert.equal(resolveGestureLock(NaN, 5, DEFAULT_LOCK_THRESHOLD), "undecided");
  });

  it("resolveGestureLock locks horizontal when dx dominates", () => {
    assert.equal(resolveGestureLock(12, 3, DEFAULT_LOCK_THRESHOLD), "horizontal");
    assert.equal(resolveGestureLock(-15, 6, DEFAULT_LOCK_THRESHOLD), "horizontal");
    assert.equal(resolveGestureLock(-10, -10, DEFAULT_LOCK_THRESHOLD), "horizontal"); // equal defaults to horizontal
    assert.equal(resolveGestureLock(9, 8.9, DEFAULT_LOCK_THRESHOLD), "horizontal"); // slight horizontal dominance
  });

  it("resolveGestureLock locks vertical when dy dominates", () => {
    assert.equal(resolveGestureLock(3, 14, DEFAULT_LOCK_THRESHOLD), "vertical");
    assert.equal(resolveGestureLock(-5, -20, DEFAULT_LOCK_THRESHOLD), "vertical");
    assert.equal(resolveGestureLock(8.9, 9, DEFAULT_LOCK_THRESHOLD), "vertical"); // slight vertical dominance
  });

  it("calcDragOffset applies damping when swiping right", () => {
    // raw = 40, damping = 0.25 -> 10
    assert.equal(calcDragOffset(40, 0, 200, 0.25), 10);
  });

  it("calcDragOffset tracks 1:1 within normal left bounds", () => {
    assert.equal(calcDragOffset(-80, 0, 200, 0.25), -80);
    assert.equal(calcDragOffset(-148, 0, 200, 0.25), -148);
  });

  it("calcDragOffset applies damping beyond max left bounds", () => {
    // maxLeft = 200, raw = -240, excess = 40, damped excess = 10 -> -210
    assert.equal(calcDragOffset(-240, 0, 200, 0.25), -210);
  });

  it("resolveSwipeRelease springs closed if under latch threshold", () => {
    // Reveal width 148, latch ratio 0.45 -> -66.6px
    // -50px is under latch threshold -> close
    const verdict = resolveSwipeRelease(-50, DEFAULT_ACTIONS_WIDTH, DEFAULT_COMMIT_THRESHOLD);
    assert.equal(verdict.action, "close");
    assert.equal(verdict.targetX, 0);
  });

  it("resolveSwipeRelease snaps open to reveal actions when released past latch threshold", () => {
    // -80px is past -66.6px and under -172px -> reveal
    const verdict = resolveSwipeRelease(-80, DEFAULT_ACTIONS_WIDTH, DEFAULT_COMMIT_THRESHOLD);
    assert.equal(verdict.action, "reveal");
    assert.equal(verdict.targetX, -DEFAULT_ACTIONS_WIDTH);
  });

  it("resolveSwipeRelease commits action directly when overswiping past commit threshold", () => {
    // -180px is past -172px -> commit
    const verdict = resolveSwipeRelease(-180, DEFAULT_ACTIONS_WIDTH, DEFAULT_COMMIT_THRESHOLD);
    assert.equal(verdict.action, "commit");
    assert.equal(verdict.targetX, -DEFAULT_COMMIT_THRESHOLD);
  });

  it("calcActionProgress calculates normalized 0..1 ratio", () => {
    assert.equal(calcActionProgress(0, 100), 0);
    assert.equal(calcActionProgress(50, 100), 0); // positive is 0
    assert.equal(calcActionProgress(-50, 100), 0.5);
    assert.equal(calcActionProgress(-100, 100), 1);
    assert.equal(calcActionProgress(-150, 100), 1); // clamped to 1
  });
});
