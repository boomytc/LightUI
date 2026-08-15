import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  COLLAPSED_RAIL_PX,
  EXPANDED_RAIL_PX,
  dismissOverlay,
  expandKind,
  occupyPx,
  occupiesFlow,
  overlayPx,
} from "./space";

describe("occupyPx", () => {
  it("keeps a collapsed rail in the flow", () => {
    assert.equal(occupyPx("collapsible", false), COLLAPSED_RAIL_PX);
    assert.ok(occupyPx("collapsible", false) > 0);
  });

  it("gives the expanded rail its label width", () => {
    assert.equal(occupyPx("collapsible", true), EXPANDED_RAIL_PX);
  });

  it("never lets off-canvas occupy the flow", () => {
    assert.equal(occupyPx("offcanvas", false), 0);
    assert.equal(occupyPx("offcanvas", true), 0);
  });
});

describe("expandKind", () => {
  it("widens a collapsible and overlays an off-canvas", () => {
    assert.equal(expandKind("collapsible"), "widen");
    assert.equal(expandKind("offcanvas"), "overlay");
    assert.equal(expandKind("floating"), "none");
    assert.equal(expandKind("wheel"), "none");
    assert.equal(expandKind("multilevel"), "none");
  });
});

describe("occupiesFlow", () => {
  it("treats island / wheel / tree / collapse as occupancy", () => {
    assert.equal(occupiesFlow("floating"), true);
    assert.equal(occupiesFlow("wheel"), true);
    assert.equal(occupiesFlow("multilevel"), true);
    assert.equal(occupiesFlow("collapsible"), true);
    assert.equal(occupiesFlow("offcanvas"), false);
  });
});

describe("overlayPx", () => {
  it("only paints an off-canvas panel when asked", () => {
    assert.equal(overlayPx("offcanvas", false), 0);
    assert.ok(overlayPx("offcanvas", true) > 0);
    assert.equal(overlayPx("collapsible", true), 0);
  });
});

describe("dismissOverlay", () => {
  it("closes and asks to restore focus", () => {
    assert.deepEqual(dismissOverlay(), { open: false, restoreFocus: true });
  });
});
