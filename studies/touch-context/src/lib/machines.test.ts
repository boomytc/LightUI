import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  shouldCancelHold,
  calcClampedMenuPosition,
  calcHoldProgress,
  DEFAULT_DRIFT_TOLERANCE_PX,
  DEFAULT_HOLD_DELAY_MS,
  DEFAULT_MENU_WIDTH,
  DEFAULT_MENU_HEIGHT,
} from "./machines.js";

describe("touch-context machines", () => {
  it("shouldCancelHold allows micro-wobbles within tolerance", () => {
    // 0px movement
    assert.equal(shouldCancelHold(100, 100, 100, 100, DEFAULT_DRIFT_TOLERANCE_PX), false);
    // 6px movement
    assert.equal(shouldCancelHold(100, 100, 104, 104, DEFAULT_DRIFT_TOLERANCE_PX), false);
    // 10px exact boundary
    assert.equal(shouldCancelHold(100, 100, 100, 110, DEFAULT_DRIFT_TOLERANCE_PX), false);
  });

  it("shouldCancelHold cancels hold when drift exceeds tolerance", () => {
    // 11px movement
    assert.equal(shouldCancelHold(100, 100, 100, 111, DEFAULT_DRIFT_TOLERANCE_PX), true);
    // 25px diagonal drag
    assert.equal(shouldCancelHold(100, 100, 120, 120, DEFAULT_DRIFT_TOLERANCE_PX), true);
  });

  it("calcClampedMenuPosition positions normally in safe center zone", () => {
    // Anchor at (150, 150), container is 320x500
    const pos = calcClampedMenuPosition(
      150,
      150,
      DEFAULT_MENU_WIDTH,
      DEFAULT_MENU_HEIGHT,
      320,
      500,
      12,
    );
    assert.equal(pos.x, 130); // 150 - 20
    assert.equal(pos.y, 158); // 150 + 8
    assert.equal(pos.flippedY, false);
  });

  it("calcClampedMenuPosition clamps horizontal boundaries at edges", () => {
    // Near left edge (10, 150)
    const leftPos = calcClampedMenuPosition(
      10,
      150,
      DEFAULT_MENU_WIDTH,
      DEFAULT_MENU_HEIGHT,
      320,
      500,
      12,
    );
    assert.equal(leftPos.x, 12); // clamped to minX (padding = 12)

    // Near right edge (310, 150)
    const rightPos = calcClampedMenuPosition(
      310,
      150,
      DEFAULT_MENU_WIDTH,
      DEFAULT_MENU_HEIGHT,
      320,
      500,
      12,
    );
    // maxX = 320 - 152 - 12 = 156
    assert.equal(rightPos.x, 156);
  });

  it("calcClampedMenuPosition flips vertically near bottom edge", () => {
    // Anchor near bottom: y = 430, height = 126, container = 500
    // 430 + 126 + 12 = 568 > 500 -> flips above
    const pos = calcClampedMenuPosition(
      150,
      430,
      DEFAULT_MENU_WIDTH,
      DEFAULT_MENU_HEIGHT,
      320,
      500,
      12,
    );
    assert.equal(pos.flippedY, true);
    // 430 - 126 - 8 = 296
    assert.equal(pos.y, 296);

    // Tight container test: anchor at 130, container 200
    // 130 + 126 + 12 = 268 > 200 -> flips above: rawY = 130 - 126 - 8 = -4
    // -4 < minY (12), so clamps to minY = 12
    const tightPos = calcClampedMenuPosition(
      150,
      130,
      DEFAULT_MENU_WIDTH,
      DEFAULT_MENU_HEIGHT,
      320,
      200,
      12,
    );
    assert.equal(tightPos.flippedY, true);
    assert.equal(tightPos.y, 12);
  });

  it("shouldCancelHold safely handles non-finite inputs", () => {
    assert.equal(shouldCancelHold(NaN, 100, 100, 100), true);
    assert.equal(shouldCancelHold(100, 100, Infinity, 100), true);
  });

  it("calcHoldProgress tracks normalized progress clamped 0 to 1", () => {
    assert.equal(calcHoldProgress(0, DEFAULT_HOLD_DELAY_MS), 0);
    assert.equal(calcHoldProgress(-50, DEFAULT_HOLD_DELAY_MS), 0);
    assert.equal(calcHoldProgress(NaN, DEFAULT_HOLD_DELAY_MS), 0);
    assert.equal(calcHoldProgress(230, 460), 0.5);
    assert.equal(calcHoldProgress(460, 460), 1);
    assert.equal(calcHoldProgress(600, 460), 1);
  });
});
