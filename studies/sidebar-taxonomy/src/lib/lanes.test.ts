import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { KINDS, type KindId } from "./kinds";
import { LANES, laneOf, mixedPair, spaceSnap } from "./lanes";
import { occupyPx, overlayPx } from "./space";

describe("laneOf", () => {
  it("puts only off-canvas on the layer lane", () => {
    const seen = new Set<KindId>();
    for (const lane of LANES) {
      for (const id of lane.kinds) {
        assert.equal(seen.has(id), false);
        seen.add(id);
        assert.equal(laneOf(id), lane.id);
      }
    }
    assert.equal(seen.size, KINDS.length);
  });
});

describe("spaceSnap", () => {
  it("keeps occupancy in the flow except off-canvas", () => {
    assert.equal(spaceSnap("floating").occupy, occupyPx("floating", true));
    assert.equal(spaceSnap("collapsible").occupy, occupyPx("collapsible", true));
    assert.equal(spaceSnap("offcanvas").occupy, 0);
    assert.equal(spaceSnap("offcanvas").overlay, overlayPx("offcanvas", true));
    assert.equal(spaceSnap("collapsible").overlay, 0);
  });
});

describe("mixedPair", () => {
  it("pairs collapse with overlay, wheel with tree", () => {
    assert.equal(mixedPair("collapsible"), "offcanvas");
    assert.equal(mixedPair("offcanvas"), "collapsible");
    assert.equal(mixedPair("wheel"), "multilevel");
    assert.equal(mixedPair("floating"), undefined);
  });
});
