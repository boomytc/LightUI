import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { crumbDepth, crumbTrail, isCurrent, shortenTo } from "./crumb";

const PATH = ["home", "tools", "draw", "mj"];

describe("crumbTrail", () => {
  it("keeps the first n items", () => {
    assert.deepEqual(crumbTrail(PATH, 2), ["home", "tools"]);
  });

  it("never goes empty or past the end", () => {
    assert.deepEqual(crumbTrail(PATH, 0), ["home"]);
    assert.deepEqual(crumbTrail(PATH, 99), PATH);
  });
});

describe("isCurrent / shortenTo", () => {
  it("marks only the last visible item current", () => {
    assert.equal(isCurrent(1, 2), true);
    assert.equal(isCurrent(0, 2), false);
  });

  it("shortens to the ancestor that was clicked", () => {
    assert.equal(shortenTo(1), 2);
    assert.equal(crumbDepth(PATH.length, shortenTo(1)), 2);
  });
});
