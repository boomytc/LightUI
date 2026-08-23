import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CROSSFADE_MS,
  KIND_IDS,
  allowsSpinner,
  hasAction,
  isKindId,
  occupancy,
  reservesLayout,
  shimmerMotion,
  stageState,
  type KindId,
} from "./machines";

describe("KIND_IDS", () => {
  it("is the two leaves", () => {
    const ids: readonly KindId[] = KIND_IDS;
    assert.deepEqual(ids, ["skeleton", "empty"]);
  });
});

describe("isKindId", () => {
  it("accepts the two leaves and rejects progress / notice slugs", () => {
    assert.equal(isKindId("skeleton"), true);
    assert.equal(isKindId("empty"), true);
    assert.equal(isKindId("spin"), false);
    assert.equal(isKindId("toast"), false);
    assert.equal(isKindId(""), false);
  });
});

describe("reservesLayout", () => {
  it("is true only for skeleton", () => {
    assert.equal(reservesLayout("skeleton"), true);
    assert.equal(reservesLayout("empty"), false);
  });
});

describe("hasAction", () => {
  it("is true only for empty", () => {
    assert.equal(hasAction("empty"), true);
    assert.equal(hasAction("skeleton"), false);
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
