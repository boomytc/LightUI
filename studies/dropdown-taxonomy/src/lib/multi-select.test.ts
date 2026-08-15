import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { clearMulti, isBlocked, removeMulti, toggleMulti } from "./multi-select";

describe("toggleMulti", () => {
  it("adds an item under the cap", () => {
    assert.deepEqual(toggleMulti(["design"], "writing", 5), ["design", "writing"]);
  });

  it("removes an item that is already on", () => {
    assert.deepEqual(toggleMulti(["design", "writing"], "design", 5), ["writing"]);
  });

  it("refuses a new item at the cap", () => {
    const full = ["a", "b", "c"];
    assert.deepEqual(toggleMulti(full, "d", 3), full);
    assert.notEqual(toggleMulti(full, "d", 3), full);
  });

  it("still allows turning an item off at the cap", () => {
    assert.deepEqual(toggleMulti(["a", "b", "c"], "b", 3), ["a", "c"]);
  });
});

describe("removeMulti / clearMulti", () => {
  it("drops one chip without touching the others", () => {
    assert.deepEqual(removeMulti(["design", "writing", "data"], "writing"), ["design", "data"]);
  });

  it("clears the set", () => {
    assert.deepEqual(clearMulti(), []);
  });
});

describe("isBlocked", () => {
  it("blocks only unselected items when full", () => {
    assert.equal(isBlocked(["a", "b"], "c", 2), true);
    assert.equal(isBlocked(["a", "b"], "a", 2), false);
    assert.equal(isBlocked(["a"], "c", 2), false);
  });
});
