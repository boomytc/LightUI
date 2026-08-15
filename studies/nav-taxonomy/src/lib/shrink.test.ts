import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { nextShrunk } from "./shrink";

describe("nextShrunk", () => {
  it("enters only past the higher threshold", () => {
    assert.equal(nextShrunk(false, 20), false);
    assert.equal(nextShrunk(false, 41), true);
  });

  it("leaves only under the lower threshold", () => {
    assert.equal(nextShrunk(true, 30), true);
    assert.equal(nextShrunk(true, 16), false);
  });
});
