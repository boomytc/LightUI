import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bevelInset,
  cardPanelRadius,
  folderLayer,
  folderPanelZ,
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
  it("keeps idle paper under the panel, current tab above it", () => {
    const panel = folderPanelZ(3);
    const idle = folderLayer(0, 1, 3);
    const current = folderLayer(1, 1, 3);
    const later = folderLayer(2, 1, 3);
    assert.equal(idle.raised, false);
    assert.equal(current.raised, true);
    assert.ok(idle.z < panel);
    assert.ok(later.z < panel);
    assert.ok(current.z > panel);
  });
});

describe("bevelInset", () => {
  it("is 0 at 0° and grows with a 30° right cut", () => {
    assert.equal(bevelInset(32, 0), 0);
    assert.ok(Math.abs(bevelInset(32, 30) - 32 * Math.tan(Math.PI / 6)) < 1e-9);
  });
});
