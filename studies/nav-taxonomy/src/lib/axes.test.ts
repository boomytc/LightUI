import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { KINDS, type KindId } from "./kinds";
import { axisOf, AXES, mixedPair, placeSketch, revealSketch, scrollSketch } from "./axes";

describe("axisOf", () => {
  it("partitions the ten kinds without remainder or overlap", () => {
    const seen = new Set<KindId>();
    for (const axis of AXES) {
      for (const id of axis.kinds) {
        assert.equal(seen.has(id), false);
        seen.add(id);
        assert.equal(axisOf(id), axis.id);
      }
    }
    assert.equal(seen.size, KINDS.length);
  });
});

describe("sketches", () => {
  it("keeps the mixed pairs visually opposite", () => {
    assert.equal(placeSketch("drawer"), "right-veil");
    assert.equal(placeSketch("overlay"), "full-veil");
    assert.equal(revealSketch("dropdown"), "column");
    assert.equal(revealSketch("mega"), "mega");
    assert.equal(scrollSketch("shrink"), "shrink");
    assert.equal(scrollSketch("floating"), "pin");
  });
});

describe("mixedPair", () => {
  it("points at the easy mix-up, not a new kind", () => {
    assert.equal(mixedPair("drawer"), "overlay");
    assert.equal(mixedPair("overlay"), "drawer");
    assert.equal(mixedPair("breadcrumb"), undefined);
  });
});
