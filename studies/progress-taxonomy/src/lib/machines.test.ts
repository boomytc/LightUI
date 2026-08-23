import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  category,
  circularOffset,
  clampProgress,
  KIND_IDS,
  MID_PROGRESS,
  prefersStatic,
  resolveLock,
  shouldLoop,
  showPercent,
  stageState,
  stepCurrent,
  stepKind,
} from "./machines";

describe("category", () => {
  it("splits the eight leaves into determinate and indeterminate", () => {
    assert.equal(category("fill"), "determinate");
    assert.equal(category("steps"), "determinate");
    assert.equal(category("circular"), "determinate");
    assert.equal(category("liquid"), "determinate");
    assert.equal(category("spin"), "indeterminate");
    assert.equal(category("radar"), "indeterminate");
    assert.equal(category("dots"), "indeterminate");
    assert.equal(category("wave"), "indeterminate");
  });
});

describe("clampProgress", () => {
  it("keeps unit progress in 0..1", () => {
    assert.equal(clampProgress(0), 0);
    assert.equal(clampProgress(0.62), 0.62);
    assert.equal(clampProgress(1), 1);
  });

  it("clamps overflow, underflow, and non-finite values", () => {
    assert.equal(clampProgress(-0.2), 0);
    assert.equal(clampProgress(1.4), 1);
    assert.equal(clampProgress(Number.NaN), 0);
    assert.equal(clampProgress(Number.POSITIVE_INFINITY), 0);
  });
});

describe("showPercent", () => {
  it("is true only for determinate kinds", () => {
    for (const id of KIND_IDS) {
      assert.equal(showPercent(id), category(id) === "determinate");
    }
    assert.equal(showPercent("fill"), true);
    assert.equal(showPercent("spin"), false);
  });
});

describe("stepKind", () => {
  it("is done before current, active at current, todo after", () => {
    assert.equal(stepKind(0, 1), "done");
    assert.equal(stepKind(1, 1), "active");
    assert.equal(stepKind(2, 1), "todo");
  });

  it("marks every node done when current is past the last index", () => {
    assert.equal(stepKind(0, 3), "done");
    assert.equal(stepKind(1, 3), "done");
    assert.equal(stepKind(2, 3), "done");
  });
});

describe("stepCurrent", () => {
  it("maps mid progress onto the middle node", () => {
    assert.equal(stepCurrent(0, 3), 0);
    assert.equal(stepCurrent(MID_PROGRESS, 3), 1);
  });

  it("returns count at 1 so every node is done", () => {
    assert.equal(stepCurrent(1, 3), 3);
  });
});

describe("circularOffset", () => {
  it("is C * (1-p) from 12 o'clock remaining length", () => {
    assert.equal(circularOffset(0, 100), 100);
    assert.equal(circularOffset(0.5, 100), 50);
    assert.equal(circularOffset(1, 100), 0);
  });

  it("clamps p before computing the offset", () => {
    assert.equal(circularOffset(-1, 80), 80);
    assert.equal(circularOffset(2, 80), 0);
  });
});

describe("shouldLoop", () => {
  it("loops only indeterminate kinds", () => {
    assert.equal(shouldLoop("fill"), false);
    assert.equal(shouldLoop("circular"), false);
    assert.equal(shouldLoop("spin"), true);
    assert.equal(shouldLoop("wave"), true);
  });
});

describe("prefersStatic", () => {
  it("does not freeze when motion is allowed", () => {
    assert.equal(prefersStatic(false, "fill"), false);
    assert.equal(prefersStatic(false, "spin"), false);
  });

  it("freezes determinate at p and turns indeterminate into a static mark", () => {
    assert.equal(prefersStatic(true, "fill"), true);
    assert.equal(prefersStatic(true, "steps"), true);
    assert.equal(prefersStatic(true, "spin"), true);
    assert.equal(prefersStatic(true, "radar"), true);
  });
});

describe("stage lock", () => {
  it("defaults unknown state to mid", () => {
    assert.equal(stageState(""), "mid");
    assert.equal(stageState("open"), "mid");
    assert.equal(stageState("done"), "done");
    assert.equal(stageState("loop"), "loop");
  });

  it("locks determinate mid near 0.62 and done at 1, never looping", () => {
    const mid = resolveLock("fill", "mid");
    assert.equal(mid.progress, MID_PROGRESS);
    assert.equal(mid.looping, false);
    assert.equal(mid.current, 1);
    const done = resolveLock("steps", "done");
    assert.equal(done.progress, 1);
    assert.equal(done.current, 3);
    assert.equal(done.looping, false);
    const ignored = resolveLock("circular", "loop");
    assert.equal(ignored.looping, false);
    assert.equal(ignored.progress, MID_PROGRESS);
  });

  it("locks indeterminate loop as looping, mid/done as a still mark", () => {
    const loop = resolveLock("spin", "loop");
    assert.equal(loop.looping, true);
    assert.equal(loop.progress, MID_PROGRESS);
    assert.equal(resolveLock("dots", "mid").looping, false);
    assert.equal(resolveLock("wave", "done").looping, false);
    assert.equal(resolveLock("wave", "done").progress, 1);
  });
});
