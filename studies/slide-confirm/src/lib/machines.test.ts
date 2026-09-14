import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  clamp,
  calcMaxTravel,
  calcDampedOffset,
  calcSlideProgress,
  calcTextOpacity,
  isThresholdReached,
} from "./machines.js";

describe("slide-confirm machines", () => {
  describe("clamp", () => {
    it("clamps values correctly", () => {
      assert.equal(clamp(5, 0, 10), 5);
      assert.equal(clamp(-2, 0, 10), 0);
      assert.equal(clamp(15, 0, 10), 10);
      assert.equal(clamp(NaN, 0, 10), 0);
      assert.equal(clamp(5, 10, 0), 5);
      assert.equal(clamp(-2, 10, 0), 0);
      assert.equal(clamp(15, 10, 0), 10);
    });
  });

  describe("calcMaxTravel", () => {
    it("calculates track minus thumb width", () => {
      assert.equal(calcMaxTravel(300, 60), 240);
      assert.equal(calcMaxTravel(100, 100), 0);
      assert.equal(calcMaxTravel(50, 100), 0);
    });

    it("calculates track minus thumb width and padding", () => {
      assert.equal(calcMaxTravel(300, 60, 8), 232);
      assert.equal(calcMaxTravel(300, 60, NaN), 240);
    });

    it("handles non-finite values safely", () => {
      assert.equal(calcMaxTravel(NaN, 60), 0);
      assert.equal(calcMaxTravel(300, Infinity), 0);
    });
  });

  describe("calcDampedOffset", () => {
    it("provides 1:1 linear tracking within [0, maxTravel]", () => {
      assert.equal(calcDampedOffset(0, 200), 0);
      assert.equal(calcDampedOffset(100, 200), 100);
      assert.equal(calcDampedOffset(200, 200), 200);
    });

    it("applies exponential damping when dragged past maxTravel", () => {
      const damped1 = calcDampedOffset(216, 200);
      // 200 + (16)^0.75 = 200 + 8 = 208
      assert.equal(damped1, 208);
      assert.ok(damped1 < 216);

      const damped2 = calcDampedOffset(281, 200);
      // 200 + (81)^0.75 = 200 + 27 = 227
      assert.equal(damped2, 227);
    });

    it("applies reverse damping when dragged to the left (< 0)", () => {
      const dampedNegative = calcDampedOffset(-16, 200);
      // -(16^0.75) = -8
      assert.equal(dampedNegative, -8);
      assert.ok(dampedNegative > -16);
    });

    it("safely handles zero or non-finite travel", () => {
      assert.equal(calcDampedOffset(50, 0), 0);
      assert.equal(calcDampedOffset(NaN, 200), 0);
    });
  });

  describe("calcSlideProgress", () => {
    it("calculates normalized progress in [0, 1]", () => {
      assert.equal(calcSlideProgress(0, 200), 0);
      assert.equal(calcSlideProgress(100, 200), 0.5);
      assert.equal(calcSlideProgress(170, 200), 0.85);
      assert.equal(calcSlideProgress(200, 200), 1);
    });

    it("clamps out of bounds progress to [0, 1]", () => {
      assert.equal(calcSlideProgress(-50, 200), 0);
      assert.equal(calcSlideProgress(300, 200), 1);
    });

    it("handles invalid inputs gracefully", () => {
      assert.equal(calcSlideProgress(50, 0), 0);
      assert.equal(calcSlideProgress(NaN, 200), 0);
    });
  });

  describe("calcTextOpacity", () => {
    it("fades out text as progress increases", () => {
      assert.equal(calcTextOpacity(0), 1);
      // at progress 0.2: 1 - 0.2 * 1.5 = 0.7
      assert.equal(calcTextOpacity(0.2), 0.7);
      // at progress 0.67 or above: 1 - 0.67 * 1.5 <= 0
      assert.equal(calcTextOpacity(0.7), 0);
      assert.equal(calcTextOpacity(1), 0);
    });

    it("safely clamps out of range values", () => {
      assert.equal(calcTextOpacity(-0.5), 1);
      assert.equal(calcTextOpacity(1.5), 0);
      assert.equal(calcTextOpacity(NaN), 1);
    });
  });

  describe("isThresholdReached", () => {
    it("accurately adjudicates 85% default threshold", () => {
      assert.equal(isThresholdReached(0), false);
      assert.equal(isThresholdReached(0.5), false);
      assert.equal(isThresholdReached(0.84), false);
      assert.equal(isThresholdReached(0.8499), false);
      assert.equal(isThresholdReached(0.85), true);
      assert.equal(isThresholdReached(0.95), true);
      assert.equal(isThresholdReached(1.0), true);
    });

    it("supports custom thresholds", () => {
      assert.equal(isThresholdReached(0.69, 0.7), false);
      assert.equal(isThresholdReached(0.7, 0.7), true);
      assert.equal(isThresholdReached(0.71, 0.7), true);
    });

    it("safely handles invalid inputs", () => {
      assert.equal(isThresholdReached(NaN), false);
      assert.equal(isThresholdReached(0.9, NaN), false);
    });
  });
});
