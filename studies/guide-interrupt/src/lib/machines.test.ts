import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  KIND_IDS,
  allowsSkip,
  checklistProgress,
  cutoutPad,
  guideAdvance,
  guideBlocksOutside,
  guidePersists,
  hintActive,
  hotspotNext,
  isKindId,
  tourStep,
  type Advance,
  type KindId,
} from "./machines";

const ADVANCES: Record<KindId, Advance> = {
  tour: "next",
  coach: "confirm",
  hotspot: "open-read",
  spotlight: "click-target",
  checklist: "task-complete",
  hint: "state-clear",
};

describe("kind rules", () => {
  it("maps guideAdvance / guideBlocksOutside / guidePersists / allowsSkip for all six", () => {
    for (const kind of KIND_IDS) {
      assert.equal(guideAdvance(kind), ADVANCES[kind]);
      assert.equal(guideBlocksOutside(kind), kind === "tour" || kind === "spotlight");
      assert.equal(guidePersists(kind), kind === "checklist");
      assert.equal(allowsSkip(kind), kind === "tour");
    }
  });
});

describe("isKindId", () => {
  it("accepts the six leaves", () => {
    for (const kind of KIND_IDS) assert.equal(isKindId(kind), true);
  });

  it("rejects tooltip and modal", () => {
    assert.equal(isKindId("tooltip"), false);
    assert.equal(isKindId("modal"), false);
  });
});

describe("hotspotNext", () => {
  it("goes unread → open → read, and read stays", () => {
    assert.equal(hotspotNext("unread", "click-dot"), "open");
    assert.equal(hotspotNext("open", "dismiss"), "read");
    assert.equal(hotspotNext("read", "click-dot"), "read");
    assert.equal(hotspotNext("read", "dismiss"), "read");
  });

  it("keeps unread on dismiss", () => {
    assert.equal(hotspotNext("unread", "dismiss"), "unread");
  });
});

describe("hintActive", () => {
  it("pins title, then permission, then unmounts", () => {
    assert.equal(hintActive({ title: "", permission: false }), "title");
    assert.equal(hintActive({ title: "Hi", permission: false }), "permission");
    assert.equal(hintActive({ title: "Hi", permission: true }), null);
  });
});

describe("tourStep", () => {
  it("nexts through 3 steps then done", () => {
    let s = { step: 0, done: false };
    s = tourStep(s.step, 3, "next");
    assert.deepEqual(s, { step: 1, done: false });
    s = tourStep(s.step, 3, "next");
    assert.deepEqual(s, { step: 2, done: false });
    s = tourStep(s.step, 3, "next");
    assert.deepEqual(s, { step: 3, done: true });
    assert.deepEqual(tourStep(s.step, 3, "next"), { step: 3, done: true });
  });

  it("skips from 0 to done", () => {
    assert.deepEqual(tourStep(0, 3, "skip"), { step: 3, done: true });
  });

  it("clamps back at 0", () => {
    assert.deepEqual(tourStep(0, 3, "back"), { step: 0, done: false });
  });
});

describe("checklistProgress", () => {
  it("is 2/4 === 0.5, 4/4 === 1, and 0 total === 0", () => {
    assert.equal(checklistProgress(["a", "b"], 4), 0.5);
    assert.equal(checklistProgress(["a", "b", "c", "d"], 4), 1);
    assert.equal(checklistProgress(["a"], 0), 0);
  });
});

describe("cutoutPad", () => {
  it("expands spotlight 10px each side", () => {
    assert.deepEqual(cutoutPad("spotlight", { x: 40, y: 20, w: 80, h: 24 }), {
      x: 30,
      y: 10,
      w: 100,
      h: 44,
    });
  });

  it("pads tour by 6 and leaves the others unpadded", () => {
    const rect = { x: 10, y: 10, w: 20, h: 20 };
    assert.deepEqual(cutoutPad("tour", rect), { x: 4, y: 4, w: 32, h: 32 });
    assert.deepEqual(cutoutPad("coach", rect), rect);
    assert.deepEqual(cutoutPad("hint", rect), rect);
  });
});
