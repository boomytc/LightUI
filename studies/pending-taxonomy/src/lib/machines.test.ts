import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CROSSFADE_MS,
  KIND_IDS,
  allowsSpinner,
  hasAction,
  isKindId,
  isVeil,
  occupancy,
  reservesLayout,
  shimmerMotion,
  stageState,
  type KindId,
} from "./machines";

describe("KIND_IDS", () => {
  it("is the three leaves", () => {
    const ids: readonly KindId[] = KIND_IDS;
    assert.deepEqual(ids, ["skeleton", "empty", "page"]);
  });
});

describe("isKindId", () => {
  it("accepts the leaves and rejects progress / notice slugs", () => {
    assert.equal(isKindId("skeleton"), true);
    assert.equal(isKindId("empty"), true);
    assert.equal(isKindId("page"), true);
    assert.equal(isKindId("spin"), false);
    assert.equal(isKindId("toast"), false);
    assert.equal(isKindId(""), false);
  });
});

describe("reservesLayout", () => {
  it("is true only for skeleton — a first-open veil has no layout to hold", () => {
    assert.equal(reservesLayout("skeleton"), true);
    assert.equal(reservesLayout("empty"), false);
    assert.equal(reservesLayout("page"), false);
  });
});

describe("hasAction", () => {
  it("is true only for empty", () => {
    assert.equal(hasAction("empty"), true);
    assert.equal(hasAction("skeleton"), false);
    assert.equal(hasAction("page"), false);
  });
});

describe("allowsSpinner", () => {
  it("is false for both leaves — a spinner is progress indeterminate", () => {
    for (const id of KIND_IDS) {
      assert.equal(allowsSpinner(id), false);
    }
  });
});

describe("stageState", () => {
  it("defaults skeleton to loading so the reserved layout is visible", () => {
    assert.equal(stageState("", "skeleton"), "loading");
    assert.equal(stageState("loading"), "loading");
    assert.equal(stageState("ready"), "ready");
    assert.equal(stageState("empty"), "empty");
  });

  it("defaults empty to empty", () => {
    assert.equal(stageState("", "empty"), "empty");
    assert.equal(stageState("open", "empty"), "empty");
  });
});

describe("occupancy", () => {
  it("keeps skeleton as layout until ready", () => {
    assert.equal(occupancy("skeleton", "loading"), "skeleton");
    assert.equal(occupancy("skeleton", "ready"), "content");
    assert.equal(occupancy("skeleton", "empty"), "skeleton");
  });

  it("keeps empty as an empty state until ready — never a spinner", () => {
    assert.equal(occupancy("empty", "empty"), "empty");
    assert.equal(occupancy("empty", "loading"), "empty");
    assert.equal(occupancy("empty", "ready"), "content");
  });

  it("covers first open with a full-page veil, not a skeleton and not a spinner", () => {
    assert.equal(occupancy("page", "loading"), "veil");
    assert.equal(occupancy("page", "ready"), "content");
    assert.equal(isVeil("page", "loading"), true);
    assert.equal(isVeil("skeleton", "loading"), false);
  });
});

describe("shimmerMotion", () => {
  it("runs the background-position loop unless motion is reduced", () => {
    assert.equal(shimmerMotion(false), true);
    assert.equal(shimmerMotion(true), false);
  });
});

describe("CROSSFADE_MS", () => {
  it("is a short arrival swap, not a long fade", () => {
    assert.equal(CROSSFADE_MS, 180);
    assert.ok(CROSSFADE_MS > 0);
    assert.ok(CROSSFADE_MS <= 240);
  });
});
