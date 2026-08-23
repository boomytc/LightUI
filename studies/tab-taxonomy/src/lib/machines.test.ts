import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bevelInset,
  cardPanelRadius,
  equalPill,
  folderLayer,
  indicatorTransition,
  stepKind,
  textIndicator,
} from "./machines";

describe("textIndicator", () => {
  it("measures the text span relative to the list, not the cell", () => {
    assert.deepEqual(textIndicator(100, 124, 36), { left: 24, width: 36 });
  });

  it("does not go negative when the span sits on the list origin", () => {
    assert.deepEqual(textIndicator(40, 40, 18), { left: 0, width: 18 });
  });
});

describe("indicatorTransition", () => {
  it("skips the first measure so the bar does not slide in from 0", () => {
    assert.equal(indicatorTransition(null), "none");
    assert.equal(indicatorTransition({ left: 0, width: 0 }), "none");
  });

  it("then only transitions left and width", () => {
    assert.equal(indicatorTransition({ left: 24, width: 36 }), "left, width");
  });
});

describe("equalPill", () => {
  it("splits the track into equal cells", () => {
    assert.deepEqual(equalPill(0, 3, 300), { left: 0, width: 100 });
    assert.deepEqual(equalPill(2, 3, 300), { left: 200, width: 100 });
  });

  it("honours a gap between items", () => {
    assert.deepEqual(equalPill(1, 3, 320, 10), { left: 110, width: 100 });
  });

  it("clamps a wild index", () => {
    assert.deepEqual(equalPill(-2, 4, 200), { left: 0, width: 50 });
    assert.deepEqual(equalPill(9, 4, 200), { left: 150, width: 50 });
  });
});

describe("stepKind", () => {
  it("is done before current, todo after", () => {
    assert.equal(stepKind(0, 2), "done");
    assert.equal(stepKind(1, 2), "done");
    assert.equal(stepKind(2, 2), "current");
    assert.equal(stepKind(3, 2), "todo");
  });
});

describe("cardPanelRadius", () => {
  it("drops only the top-left radius when the first card is current", () => {
    assert.deepEqual(cardPanelRadius(0, 16), { topLeft: 0, topRight: 16 });
    assert.deepEqual(cardPanelRadius(1, 16), { topLeft: 16, topRight: 16 });
  });
});

describe("folderLayer", () => {
  it("raises the selected tab above the paper stack", () => {
    assert.deepEqual(folderLayer(0, 1, 3), { z: 1, raised: false });
    assert.deepEqual(folderLayer(1, 1, 3), { z: 4, raised: true });
    assert.deepEqual(folderLayer(2, 1, 3), { z: 3, raised: false });
  });
});

describe("bevelInset", () => {
  it("is 0 at 0° and grows with a 30° right cut", () => {
    assert.equal(bevelInset(32, 0), 0);
    assert.ok(Math.abs(bevelInset(32, 30) - 32 * Math.tan(Math.PI / 6)) < 1e-9);
  });
});
