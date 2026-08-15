import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isHeadingTowardSubmenu,
  pointInRect,
  pointInTriangle,
  predictsIntent,
} from "./geometry";

const prev = { x: 40, y: 80 };
const top = { x: 240, y: 20 };
const bottom = { x: 240, y: 280 };

describe("pointInTriangle", () => {
  it("accepts the centroid and the three vertices", () => {
    const centroid = { x: (prev.x + top.x + bottom.x) / 3, y: (prev.y + top.y + bottom.y) / 3 };
    assert.equal(pointInTriangle(centroid, prev, top, bottom), true);
    assert.equal(pointInTriangle(prev, prev, top, bottom), true);
    assert.equal(pointInTriangle(top, prev, top, bottom), true);
    assert.equal(pointInTriangle(bottom, prev, top, bottom), true);
  });

  it("rejects a point clearly outside the corridor", () => {
    assert.equal(pointInTriangle({ x: 40, y: 260 }, prev, top, bottom), false);
  });

  it("grows a thin triangle when pad is set", () => {
    const justOutside = { x: 39, y: 80 };
    assert.equal(pointInTriangle(justOutside, prev, top, bottom), false);
    assert.equal(pointInTriangle(justOutside, prev, top, bottom, 6), true);
  });
});

describe("isHeadingTowardSubmenu", () => {
  it("accepts a diagonal flick into a right-hand submenu", () => {
    const curr = { x: 100, y: 100 };
    assert.equal(isHeadingTowardSubmenu(prev, curr, top, bottom), true);
  });

  it("rejects a vertical move down the parent column", () => {
    const curr = { x: 42, y: 200 };
    assert.equal(isHeadingTowardSubmenu(prev, curr, top, bottom), false);
  });

  it("ignores sub-pixel jitter", () => {
    const curr = { x: 40.4, y: 80.4 };
    assert.equal(isHeadingTowardSubmenu(prev, curr, top, bottom), false);
  });
});

describe("predictsIntent", () => {
  it("protects a point that sits in the previous-sample triangle", () => {
    const curr = { x: 140, y: 120 };
    assert.equal(predictsIntent(prev, curr, top, bottom), true);
  });

  it("does not protect a downward hop onto a sibling item", () => {
    const curr = { x: 40, y: 220 };
    assert.equal(predictsIntent(prev, curr, top, bottom, 0), false);
  });
});

describe("pointInRect", () => {
  const rect = { left: 10, top: 10, right: 50, bottom: 40 };

  it("includes the interior and applies pad", () => {
    assert.equal(pointInRect({ x: 20, y: 20 }, rect), true);
    assert.equal(pointInRect({ x: 8, y: 20 }, rect), false);
    assert.equal(pointInRect({ x: 8, y: 20 }, rect, 3), true);
  });
});
