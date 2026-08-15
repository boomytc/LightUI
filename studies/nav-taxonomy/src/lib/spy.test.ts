import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { beginJump, pickActive } from "./spy";

const entries = [
  { id: "overview", intersecting: true, ratio: 0.2 },
  { id: "features", intersecting: true, ratio: 0.7 },
  { id: "pricing", intersecting: false, ratio: 0 },
];

describe("pickActive", () => {
  it("takes the intersecting section with the highest ratio", () => {
    assert.equal(pickActive(entries, false, "overview"), "features");
  });

  it("keeps the current id while a click jump is locked", () => {
    assert.equal(pickActive(entries, true, "pricing"), "pricing");
  });

  it("keeps the current id when nothing intersects", () => {
    assert.equal(pickActive([{ id: "reviews", intersecting: false, ratio: 0 }], false, "pricing"), "pricing");
  });
});

describe("beginJump", () => {
  it("sets the target and locks the observer", () => {
    assert.deepEqual(beginJump("reviews"), { active: "reviews", locked: true });
  });
});
