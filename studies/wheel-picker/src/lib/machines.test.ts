import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  pad2,
  calcItemOffset,
  calcCylinderVisual,
  resolveScrollIndex,
  calcTargetScrollTop,
  formatTimeString,
  DEFAULT_ITEM_HEIGHT,
} from "./machines.js";

describe("wheel-picker machines", () => {
  it("pad2 formats numbers with leading zeroes", () => {
    assert.equal(pad2(0), "00");
    assert.equal(pad2(7), "07");
    assert.equal(pad2(12), "12");
    assert.equal(pad2(59), "59");
  });

  it("calcItemOffset calculates relative distance correctly", () => {
    assert.equal(calcItemOffset(5, 5), 0);
    assert.equal(calcItemOffset(7, 5), 2);
    assert.equal(calcItemOffset(3, 5), -2);
  });

  it("calcCylinderVisual produces full opacity and zero rotation at baseline", () => {
    const center = calcCylinderVisual(0);
    assert.equal(center.opacity, 1);
    assert.equal(center.rotateXDeg, 0);
    assert.equal(center.scale, 1);
    assert.equal(center.blurPx, 0);
    assert.equal(center.isBaseline, true);
  });

  it("calcCylinderVisual attenuates opacity and applies rotation as offset increases", () => {
    const above = calcCylinderVisual(-2);
    assert.ok(above.opacity < 1);
    assert.ok(above.opacity >= 0.18);
    assert.equal(above.rotateXDeg, 36);
    assert.ok(above.scale < 1);
    assert.equal(above.isBaseline, false);

    const far = calcCylinderVisual(5);
    assert.equal(far.opacity, 0.18); // clamped minimum
    assert.ok(far.blurPx > 0);
  });

  it("resolveScrollIndex snaps to nearest discrete item index", () => {
    // Top is 0
    assert.deepEqual(resolveScrollIndex(0, DEFAULT_ITEM_HEIGHT, 24), {
      index: 0,
      snapScrollTop: 0,
    });

    // 38px with item height 40px snaps to index 1 (40px)
    assert.deepEqual(resolveScrollIndex(38, DEFAULT_ITEM_HEIGHT, 24), {
      index: 1,
      snapScrollTop: 40,
    });

    // 19px snaps to index 0 (0px)
    assert.deepEqual(resolveScrollIndex(19, DEFAULT_ITEM_HEIGHT, 24), {
      index: 0,
      snapScrollTop: 0,
    });

    // 21px snaps to index 1 (40px)
    assert.deepEqual(resolveScrollIndex(21, DEFAULT_ITEM_HEIGHT, 24), {
      index: 1,
      snapScrollTop: 40,
    });
  });

  it("resolveScrollIndex clamps to valid boundary range", () => {
    // Underflow
    assert.deepEqual(resolveScrollIndex(-120, DEFAULT_ITEM_HEIGHT, 24), {
      index: 0,
      snapScrollTop: 0,
    });

    // Overflow
    assert.deepEqual(resolveScrollIndex(2000, DEFAULT_ITEM_HEIGHT, 24), {
      index: 23,
      snapScrollTop: 23 * 40,
    });

    // Empty count edge case
    assert.deepEqual(resolveScrollIndex(100, DEFAULT_ITEM_HEIGHT, 0), {
      index: 0,
      snapScrollTop: 0,
    });

    // NaN and negative item height edge cases
    assert.deepEqual(resolveScrollIndex(NaN, DEFAULT_ITEM_HEIGHT, 24), {
      index: 0,
      snapScrollTop: 0,
    });
    assert.deepEqual(resolveScrollIndex(100, 0, 24), {
      index: 0,
      snapScrollTop: 0,
    });
  });

  it("calcTargetScrollTop calculates exact pixel coordinate", () => {
    assert.equal(calcTargetScrollTop(0, 40), 0);
    assert.equal(calcTargetScrollTop(8, 40), 320);
    assert.equal(calcTargetScrollTop(30, 40), 1200);
  });

  it("formatTimeString produces standard HH:MM time", () => {
    assert.equal(formatTimeString(8, 30), "08:30");
    assert.equal(formatTimeString(0, 5), "00:05");
    assert.equal(formatTimeString(23, 59), "23:59");
  });
});
