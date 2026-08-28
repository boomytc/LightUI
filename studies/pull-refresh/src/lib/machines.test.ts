import test from "node:test";
import assert from "node:assert/strict";
import {
  shouldTakeoverScroll,
  calculatePull,
  isThresholdMet,
  pullProgress,
  resolvePointerRelease,
  DEFAULT_THRESHOLD_PX,
} from "./machines";

test("shouldTakeoverScroll checks scrollTop, dy, and busy state", () => {
  assert.equal(shouldTakeoverScroll(0, 10, false), true);
  assert.equal(shouldTakeoverScroll(10, 10, false), false); // scrolled down
  assert.equal(shouldTakeoverScroll(0, -5, false), false);  // scrolling up
  assert.equal(shouldTakeoverScroll(0, 10, true), false);   // busy refreshing
});

test("calculatePull applies damping and caps at max", () => {
  assert.equal(calculatePull(-10), 0);
  assert.equal(calculatePull(0), 0);
  assert.equal(calculatePull(100), 42); // 100 * 0.42 = 42
  assert.equal(calculatePull(500), 120); // capped at 120
});

test("isThresholdMet and pullProgress calculate qualification correctly", () => {
  assert.equal(isThresholdMet(50, 56), false);
  assert.equal(isThresholdMet(56, 56), true);
  assert.equal(isThresholdMet(70, 56), true);

  assert.equal(pullProgress(0, 56), 0);
  assert.equal(pullProgress(28, 56), 0.5);
  assert.equal(pullProgress(56, 56), 1);
  assert.equal(pullProgress(70, 56), 1);
});

test("resolvePointerRelease determines whether to pin & refresh or snap back", () => {
  // Pull < threshold -> snap back
  const under = resolvePointerRelease(40, DEFAULT_THRESHOLD_PX);
  assert.equal(under.shouldRefresh, false);
  assert.equal(under.targetHeight, 0);

  // Pull >= threshold -> commit and pin at threshold height
  const over = resolvePointerRelease(70, DEFAULT_THRESHOLD_PX);
  assert.equal(over.shouldRefresh, true);
  assert.equal(over.targetHeight, DEFAULT_THRESHOLD_PX);
});
