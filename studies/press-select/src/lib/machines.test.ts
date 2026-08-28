import test from "node:test";
import assert from "node:assert/strict";
import {
  shouldCancelHold,
  gestureVerdict,
  toggleSelection,
  selectAll,
  clearSelection,
  DRIFT_TOLERANCE_SQ,
} from "./machines";

test("shouldCancelHold detects drift beyond 8px radius", () => {
  assert.equal(shouldCancelHold(0, 0), false);
  assert.equal(shouldCancelHold(4, 4), false); // 32 <= 64
  assert.equal(shouldCancelHold(8, 0), false); // 64 <= 64
  assert.equal(shouldCancelHold(8, 1), true);  // 65 > 64
  assert.equal(shouldCancelHold(0, 10), true); // 100 > 64
});

test("gestureVerdict correctly categorizes gesture states", () => {
  // Quick release without drift -> open
  assert.equal(gestureVerdict(120, 10, true), "open");

  // Held past 480ms without drift -> select
  assert.equal(gestureVerdict(500, 20, false), "select");

  // Drift exceeded -> scroll immediately
  assert.equal(gestureVerdict(100, DRIFT_TOLERANCE_SQ + 5, false), "scroll");

  // Still holding within time -> pending
  assert.equal(gestureVerdict(200, 10, false), "pending");
});

test("toggleSelection adds and removes items properly", () => {
  const s1 = toggleSelection([], "item-1");
  assert.deepEqual(s1, ["item-1"]);

  const s2 = toggleSelection(s1, "item-2");
  assert.deepEqual(s2, ["item-1", "item-2"]);

  const s3 = toggleSelection(s2, "item-1");
  assert.deepEqual(s3, ["item-2"]);
});

test("selectAll and clearSelection work as expected", () => {
  const all = ["a", "b", "c"];
  assert.deepEqual(selectAll(all), ["a", "b", "c"]);
  assert.deepEqual(clearSelection(), []);
});
