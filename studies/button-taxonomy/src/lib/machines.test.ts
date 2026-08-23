import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  KIND_IDS,
  filled,
  primaryCount,
  roleFor,
  tooManyPrimaries,
  weight,
  type KindId,
} from "./machines";

describe("weight", () => {
  it("is primary for solid, secondary for outline, tertiary for text", () => {
    assert.equal(weight("solid"), "primary");
    assert.equal(weight("outline"), "secondary");
    assert.equal(weight("text"), "tertiary");
  });
});

describe("filled", () => {
  it("is true only for solid", () => {
    assert.equal(filled("solid"), true);
    assert.equal(filled("outline"), false);
    assert.equal(filled("text"), false);
  });

  it("matches primary weight", () => {
    for (const kind of KIND_IDS as readonly KindId[]) {
      assert.equal(filled(kind), weight(kind) === "primary");
    }
  });
});

describe("tooManyPrimaries", () => {
  it("is false at zero or one", () => {
    assert.equal(tooManyPrimaries(0), false);
    assert.equal(tooManyPrimaries(1), false);
  });

  it("is true when a region has more than one primary", () => {
    assert.equal(tooManyPrimaries(2), true);
    assert.equal(tooManyPrimaries(3), true);
  });
});

describe("roleFor", () => {
  it("names the job in the region", () => {
    assert.equal(roleFor("solid"), "commit");
    assert.equal(roleFor("outline"), "pair");
    assert.equal(roleFor("text"), "quiet");
  });
});

describe("primaryCount", () => {
  it("counts one primary in the correct trio", () => {
    assert.equal(primaryCount(["solid", "outline", "text"]), 1);
    assert.equal(tooManyPrimaries(primaryCount(["solid", "outline", "text"])), false);
  });

  it("flags two solids in one bar", () => {
    assert.equal(primaryCount(["solid", "solid"]), 2);
    assert.equal(tooManyPrimaries(primaryCount(["solid", "solid"])), true);
  });
});
