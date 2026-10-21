import assert from "node:assert/strict";
import { test } from "node:test";
import { escapes } from "./machines";
test("reports both escaped edges in viewport coordinates", () => {
  const frame = { left: 120, right: 495 };
  assert.equal(escapes(frame, { left: 119, right: 496 }), false);
  assert.equal(escapes(frame, { left: 118, right: 300 }), true);
  assert.equal(escapes(frame, { left: 140, right: 680 }), true);
  assert.equal(escapes(frame, { left: 140, right: 480 }), false);
});
test("clipping does not change the boundary verdict", () => {
  const frame = { left: 0, right: 375 };
  const fixedWidth = { left: 16, right: 576 };
  assert.equal(escapes(frame, fixedWidth), true);
  assert.equal(escapes(frame, { left: 16, right: 359 }), false);
});
