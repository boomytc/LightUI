import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  allowsUnevenHeight,
  clampSplit,
  isFullBleed,
  KIND_IDS,
  READING_MEASURE_PX,
  readingMeasurePx,
  SPLIT_DEFAULT,
  SPLIT_MAX,
  SPLIT_MIN,
  splitPanes,
  splitRatioFromPointer,
  type KindId,
} from "./machines";

const ONE_AXIS: KindId[] = ["single", "landing", "fullscreen"];
const GRID: KindId[] = ["masonry", "dashboard", "modular"];

describe("readingMeasurePx", () => {
  it("is 42rem (672px) only for single-column reading", () => {
    assert.equal(READING_MEASURE_PX, 672);
    assert.equal(readingMeasurePx("single"), 672);
  });

  it("is null for every other skeleton", () => {
    for (const id of KIND_IDS) {
      if (id === "single") continue;
      assert.equal(readingMeasurePx(id), null);
    }
  });
});

describe("isFullBleed", () => {
  it("is true only for fullscreen", () => {
    assert.equal(isFullBleed("fullscreen"), true);
    for (const id of KIND_IDS) {
      if (id === "fullscreen") continue;
      assert.equal(isFullBleed(id), false);
    }
  });
});

describe("allowsUnevenHeight", () => {
  it("is true only for masonry", () => {
    assert.equal(allowsUnevenHeight("masonry"), true);
    for (const id of KIND_IDS) {
      if (id === "masonry") continue;
      assert.equal(allowsUnevenHeight(id), false);
    }
  });
});

describe("splitPanes", () => {
  it("is 2 for a splitter, 1 for one-axis pages, grid otherwise", () => {
    assert.equal(splitPanes("splitter"), 2);
    for (const id of ONE_AXIS) {
      assert.equal(splitPanes(id), 1);
    }
    for (const id of GRID) {
      assert.equal(splitPanes(id), "grid");
    }
  });
});

describe("clampSplit", () => {
  it("keeps a ratio inside the pane min/max", () => {
    assert.equal(clampSplit(0.4), 0.4);
    assert.equal(clampSplit(0), SPLIT_MIN);
    assert.equal(clampSplit(1), SPLIT_MAX);
  });

  it("falls back when the value is not finite", () => {
    assert.equal(clampSplit(Number.NaN), SPLIT_DEFAULT);
    assert.equal(clampSplit(Number.POSITIVE_INFINITY), SPLIT_DEFAULT);
  });
});

describe("splitRatioFromPointer", () => {
  it("maps a pointer into the clamped ratio", () => {
    assert.equal(splitRatioFromPointer(132, 0, 400), 0.33);
    assert.equal(splitRatioFromPointer(0, 0, 400), SPLIT_MIN);
    assert.equal(splitRatioFromPointer(400, 0, 400), SPLIT_MAX);
  });

  it("returns the default when the group has no size", () => {
    assert.equal(splitRatioFromPointer(40, 0, 0), SPLIT_DEFAULT);
  });
});
