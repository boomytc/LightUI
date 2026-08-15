import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldStepWheel, stepIndex, wheelOffset, wheelVisual } from "./wheel";

describe("stepIndex", () => {
  it("steps inside the range", () => {
    assert.equal(stepIndex(1, 1, 5), 2);
    assert.equal(stepIndex(1, -1, 5), 0);
  });

  it("clamps at both ends", () => {
    assert.equal(stepIndex(0, -1, 5), 0);
    assert.equal(stepIndex(4, 1, 5), 4);
  });
});

describe("wheelVisual", () => {
  it("marks only the baseline item current", () => {
    assert.equal(wheelVisual(0).baseline, true);
    assert.equal(wheelVisual(0).blur, 0);
    assert.equal(wheelVisual(0).opacity, 1);
    assert.equal(wheelVisual(2).baseline, false);
    assert.ok(wheelVisual(2).blur > 0);
    assert.ok(wheelVisual(2).opacity < 1);
  });

  it("offsets from the active index", () => {
    assert.equal(wheelOffset(3, 1), 2);
  });
});

describe("shouldStepWheel", () => {
  it("ignores jitter under the threshold", () => {
    assert.equal(shouldStepWheel(4), 0);
  });

  it("reads the sign once past the threshold", () => {
    assert.equal(shouldStepWheel(12), 1);
    assert.equal(shouldStepWheel(-12), -1);
  });
});
