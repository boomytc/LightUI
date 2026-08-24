import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  KIND_IDS,
  MAX_DOTS,
  MIN_DOTS,
  atStart,
  dotCount,
  focusDot,
  fraction,
  hidesNative,
  isKindId,
  overflow,
  seekTop,
  showsCue,
  showsTrack,
  stageFraction,
  stageState,
} from "./machines";

describe("KIND_IDS", () => {
  it("is the three leaves", () => {
    assert.deepEqual(KIND_IDS, ["native", "cue", "track"]);
  });
});

describe("isKindId", () => {
  it("rejects progress, nav, and morph skins", () => {
    assert.equal(isKindId("native"), true);
    assert.equal(isKindId("cue"), true);
    assert.equal(isKindId("track"), true);
    assert.equal(isKindId("spin"), false);
    assert.equal(isKindId("scrollspy"), false);
    assert.equal(isKindId("morph"), false);
  });
});

describe("visibility", () => {
  it("only native keeps the OS thumb", () => {
    assert.equal(hidesNative("native"), false);
    assert.equal(hidesNative("cue"), true);
    assert.equal(hidesNative("track"), true);
  });

  it("cue only when there is overflow and the pane is at the top", () => {
    assert.equal(showsCue("cue", true, true), true);
    assert.equal(showsCue("cue", true, false), false);
    assert.equal(showsCue("cue", false, true), false);
    assert.equal(showsCue("track", true, true), false);
    assert.equal(showsCue("native", true, true), false);
  });

  it("track only when there is overflow", () => {
    assert.equal(showsTrack("track", true), true);
    assert.equal(showsTrack("track", false), false);
    assert.equal(showsTrack("cue", true), false);
  });

  it("overflow and start use a few pixels of slack", () => {
    assert.equal(overflow(0), false);
    assert.equal(overflow(9), true);
    assert.equal(atStart(0), true);
    assert.equal(atStart(20), false);
  });
});

describe("quantize", () => {
  it("lands fraction on a dot", () => {
    assert.equal(focusDot(0, 10), 0);
    assert.equal(focusDot(1, 10), 9);
    assert.equal(focusDot(0.5, 11), 5);
    assert.equal(focusDot(0.45, 10), 4);
  });

  it("clamps a missing range", () => {
    assert.equal(fraction(10, 0), 0);
    assert.equal(fraction(50, 100), 0.5);
    assert.equal(fraction(-4, 100), 0);
    assert.equal(fraction(200, 100), 1);
  });

  it("keeps dot count in the rail band", () => {
    assert.equal(dotCount(16), MIN_DOTS);
    assert.equal(dotCount(800), MAX_DOTS);
    assert.equal(dotCount(160), 10);
  });
});

describe("seekTop", () => {
  it("native does not steal the thumb", () => {
    assert.equal(seekTop("native", { index: 3, n: 10, max: 400, viewport: 200, current: 0 }), null);
  });

  it("cue jumps one viewport, then clamps", () => {
    assert.equal(seekTop("cue", { index: 0, n: 10, max: 400, viewport: 200, current: 0 }), 200);
    assert.equal(seekTop("cue", { index: 0, n: 10, max: 400, viewport: 200, current: 300 }), 400);
  });

  it("track seeks a fraction, not a heading", () => {
    assert.equal(seekTop("track", { index: 0, n: 5, max: 400, viewport: 200, current: 80 }), 0);
    assert.equal(seekTop("track", { index: 4, n: 5, max: 400, viewport: 200, current: 80 }), 400);
    assert.equal(seekTop("track", { index: 2, n: 5, max: 400, viewport: 200, current: 80 }), 200);
  });
});

describe("stage", () => {
  it("fit means no overflow; mid is a mid-page fraction", () => {
    assert.equal(stageState(""), "mid");
    assert.equal(stageFraction("fit"), null);
    assert.equal(stageFraction("start"), 0);
    assert.equal(stageFraction("end"), 1);
    assert.equal(stageFraction("mid"), 0.45);
  });
});
