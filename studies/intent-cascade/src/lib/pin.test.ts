import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { corridorTriangle, pinConfirmCursor, pinHoverCursor, visualTriangle } from "./pin";

const item = { left: 0, top: 40, right: 80, bottom: 70 };
const child = { left: 200, top: 10, right: 400, bottom: 300 };
const toward = { left: 200, top: 240, right: 400, bottom: 270 };

describe("pinHoverCursor", () => {
  it("stays on the item, left of the submenu edge", () => {
    const point = pinHoverCursor(item, child);
    assert.ok(point.x < child.left);
    assert.ok(point.x > item.left);
    assert.equal(point.y, (item.top + item.bottom) / 2);
  });
});

describe("pinConfirmCursor", () => {
  it("sits on the target row inside the submenu", () => {
    const point = pinConfirmCursor(child, toward);
    assert.ok(point.x > child.left && point.x < child.right);
    assert.equal(point.y, (toward.top + toward.bottom) / 2);
  });
});

describe("corridorTriangle", () => {
  it("nails the apex to the open parent item", () => {
    const triangle = corridorTriangle(child, item);
    assert.equal(triangle.cursor.x, item.left + 12);
    assert.equal(triangle.cursor.y, (item.top + item.bottom) / 2);
    assert.equal(triangle.top.x, child.left);
    assert.equal(triangle.bottom.x, child.left);
  });
});

describe("visualTriangle", () => {
  it("uses the live cursor while predicting", () => {
    const cursor = { x: 120, y: 90 };
    const triangle = visualTriangle(cursor, child, item, false);
    assert.deepEqual(triangle.cursor, cursor);
  });

  it("anchors a confirmed corridor on the parent item", () => {
    const cursor = { x: 260, y: 255 };
    const triangle = visualTriangle(cursor, child, item, true);
    assert.deepEqual(triangle, corridorTriangle(child, item));
  });
});
