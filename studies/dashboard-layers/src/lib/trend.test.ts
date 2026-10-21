import assert from "node:assert/strict";
import { test } from "node:test";
import { BOARD } from "./dashboard-data";
import { historyFor, trendWindow, windowChange } from "./trend";
test("window slices retain the metric endpoint and authored final week", () => {
  for (const kpi of BOARD.kpis) {
    const history = historyFor(kpi.spark);
    assert.equal(history.length, 90);
    assert.deepEqual(trendWindow(history, 7), kpi.spark);
    assert.equal(trendWindow(history, 30).length, 30);
    assert.equal(trendWindow(history, 90).at(-1), kpi.value);
  }
});
test("endpoint change handles falls, zero baselines, and missing points", () => {
  assert.equal(windowChange([100, 80]), -20);
  assert.equal(windowChange([80, 100]), 25);
  assert.equal(windowChange([0, 20]), null);
  assert.equal(windowChange([20]), null);
  assert.equal(windowChange([]), null);
  assert.equal(windowChange([20, 20]), 0);
});
