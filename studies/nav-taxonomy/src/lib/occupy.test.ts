import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { KINDS, type KindId } from "./kinds";
import { isHamburgerOverlay, itemCap, navOccupancy, occupiesBottom, occupiesEdge } from "./occupy";

describe("occupiesBottom", () => {
  it("is true only for the bottom primary", () => {
    for (const kind of KINDS) {
      assert.equal(occupiesBottom(kind.id), kind.id === "bottom");
    }
  });
});

describe("isHamburgerOverlay", () => {
  it("is the drawer and the full-screen overlay, not the bottom bar", () => {
    assert.equal(isHamburgerOverlay("drawer"), true);
    assert.equal(isHamburgerOverlay("overlay"), true);
    assert.equal(isHamburgerOverlay("bottom"), false);
    assert.equal(isHamburgerOverlay("sidebar"), false);
  });
});

describe("navOccupancy", () => {
  it("lets the bottom bar occupy, not overlay", () => {
    assert.equal(navOccupancy("bottom"), "occupy");
    assert.equal(navOccupancy("drawer"), "overlay");
    assert.equal(navOccupancy("sidebar"), "occupy");
  });
});

describe("occupiesEdge", () => {
  it("pins bottom-nav to the bottom edge", () => {
    assert.equal(occupiesEdge("bottom"), "bottom");
    assert.equal(occupiesEdge("sidebar"), "left");
    assert.equal(occupiesEdge("drawer"), "none");
  });
});

describe("itemCap", () => {
  it("caps the bottom primary at five destinations", () => {
    assert.equal(itemCap("bottom"), 5);
    const other: KindId = "floating";
    assert.equal(itemCap(other), null);
  });
});
