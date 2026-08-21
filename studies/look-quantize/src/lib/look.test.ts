import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PITCH_ROWS,
  YAW_COLS,
  blinkSourceRow,
  cellsEqual,
  lookToCell,
  smoothToward,
  snapCellBlend,
  stepCellBlend,
  targetFromOffset,
} from "./look";

describe("targetFromOffset", () => {
  it("clamps offsets outside the radius onto the circle", () => {
    const right = targetFromOffset(1000, 0, 180, 1);
    assert.ok(Math.abs(right.x - 1) < 1e-9);
    assert.ok(Math.abs(right.y) < 1e-9);

    const up = targetFromOffset(0, -2000, 180, 1);
    assert.ok(Math.abs(up.x) < 1e-9);
    assert.ok(Math.abs(up.y - -1) < 1e-9);

    const diag = targetFromOffset(300, 300, 180, 1);
    assert.ok(Math.abs(Math.hypot(diag.x, diag.y) - 1) < 1e-9);
  });

  it("scales inside the radius", () => {
    const half = targetFromOffset(90, 0, 180, 1);
    assert.ok(Math.abs(half.x - 0.5) < 1e-9);
    assert.ok(Math.abs(half.y) < 1e-9);
  });
});

describe("lookToCell", () => {
  it("is stable at center and extremes", () => {
    assert.deepEqual(lookToCell(0, 0), { col: 3, row: 1 });
    assert.deepEqual(lookToCell(-1, -1), { col: 0, row: 0 });
    assert.deepEqual(lookToCell(1, 1), { col: YAW_COLS - 1, row: PITCH_ROWS - 1 });
  });

  it("clamps look vectors beyond [-1, 1] to the same extreme cells", () => {
    assert.deepEqual(lookToCell(-2, 4), lookToCell(-1, 1));
    assert.deepEqual(lookToCell(8, -3), lookToCell(1, -1));
  });
});

describe("blinkSourceRow", () => {
  it("uses the other atlas row for a blink", () => {
    assert.equal(blinkSourceRow(1, false), 1);
    assert.equal(blinkSourceRow(1, true), 1 + PITCH_ROWS);
    assert.equal(blinkSourceRow(0, true), PITCH_ROWS);
  });
});

describe("smoothToward", () => {
  it("moves toward the target without overshooting a stationary goal in one tiny step", () => {
    const next = smoothToward(0, 1, 0.6, 1 / 60);
    assert.ok(next > 0);
    assert.ok(next < 1);
  });
});

describe("stepCellBlend", () => {
  const a = { col: 3, row: 1 };
  const b = { col: 4, row: 1 };
  const c = { col: 5, row: 1 };

  it("stays on one unique cell when the look does not hop", () => {
    const held = stepCellBlend(snapCellBlend(a), a, 0.05, 0.14);
    assert.equal(held.t, 1);
    assert.ok(cellsEqual(held.from, a));
    assert.ok(cellsEqual(held.to, a));
  });

  it("starts a hop at t=0 and reaches the next unique cell", () => {
    let blend = stepCellBlend(snapCellBlend(a), b, 0, 0.14);
    assert.equal(blend.t, 0);
    assert.deepEqual(blend.from, a);
    assert.deepEqual(blend.to, b);

    blend = stepCellBlend(blend, b, 0.07, 0.14);
    assert.ok(blend.t > 0.4 && blend.t < 0.6);

    blend = stepCellBlend(blend, b, 0.2, 0.14);
    assert.equal(blend.t, 1);
    assert.ok(cellsEqual(blend.from, b));
    assert.ok(cellsEqual(blend.to, b));
  });

  it("retargets from the dominant unique cell, not a half-mix", () => {
    let blend = stepCellBlend(snapCellBlend(a), b, 0, 0.14);
    blend = stepCellBlend(blend, b, 0.08, 0.14);
    assert.ok(blend.t > 0.5);
    blend = stepCellBlend(blend, c, 0, 0.14);
    assert.equal(blend.t, 0);
    assert.deepEqual(blend.from, b);
    assert.deepEqual(blend.to, c);
  });
});
