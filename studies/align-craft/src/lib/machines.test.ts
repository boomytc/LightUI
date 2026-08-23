import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CAP_RATIO,
  GEOMETRIC_POSITION,
  KIND_IDS,
  SUBJECT_POSITION,
  aligns,
  isKindId,
  isStageState,
  needsObjectPosition,
  objectFitFor,
  objectPositionFor,
  paddingTopForCap,
  type AlignTarget,
  type KindId,
} from "./machines";

const ALIGN: Record<KindId, AlignTarget> = {
  baseline: "baseline",
  cover: "focus",
  axis: "box",
  margin: "gap",
  padding: "edge",
  optical: "focus",
  inset: "edge",
};

describe("aligns", () => {
  it("names what each spell lines up", () => {
    for (const kind of KIND_IDS) {
      assert.equal(aligns(kind), ALIGN[kind]);
    }
  });

  it("answers baseline, focus, or box for the three named questions", () => {
    assert.equal(aligns("baseline"), "baseline");
    assert.equal(aligns("cover"), "focus");
    assert.equal(aligns("axis"), "box");
  });

  it("treats optical mass as focus, not the geometric box", () => {
    assert.equal(aligns("optical"), "focus");
    assert.notEqual(aligns("optical"), "box");
  });

  it("treats leftover spacing as gap and flush type as edge", () => {
    assert.equal(aligns("margin"), "gap");
    assert.equal(aligns("padding"), "edge");
    assert.equal(aligns("inset"), "edge");
  });
});

describe("objectFitFor", () => {
  it("fills the frame only for cover", () => {
    assert.equal(objectFitFor("cover"), "cover");
  });

  it("leaves every other spell at contain", () => {
    for (const kind of KIND_IDS) {
      if (kind === "cover") continue;
      assert.equal(objectFitFor(kind), "contain");
    }
  });
});

describe("needsObjectPosition", () => {
  it("is true only for cover", () => {
    assert.equal(needsObjectPosition("cover"), true);
    for (const kind of KIND_IDS) {
      if (kind === "cover") continue;
      assert.equal(needsObjectPosition(kind), false);
    }
  });

  it("matches the cover object-fit", () => {
    for (const kind of KIND_IDS) {
      assert.equal(needsObjectPosition(kind), objectFitFor(kind) === "cover");
    }
  });
});

describe("objectPositionFor", () => {
  it("follows the subject on a right cover, not 50% 50%", () => {
    assert.equal(SUBJECT_POSITION, "50% 88%");
    assert.equal(objectPositionFor("cover", "right"), SUBJECT_POSITION);
    assert.notEqual(objectPositionFor("cover", "right"), GEOMETRIC_POSITION);
  });

  it("falls back to the geometric center when cover is wrong", () => {
    assert.equal(objectPositionFor("cover", "wrong"), GEOMETRIC_POSITION);
  });

  it("does not invent a focal point for other spells", () => {
    for (const kind of KIND_IDS) {
      if (kind === "cover") continue;
      assert.equal(objectPositionFor(kind, "right"), GEOMETRIC_POSITION);
    }
  });
});

describe("paddingTopForCap", () => {
  it("subtracts extra leading above the cap", () => {
    const inset = 16;
    const font = 32;
    const line = 40;
    const cap = font * CAP_RATIO;
    const extra = (line - cap) / 2;
    assert.equal(paddingTopForCap(inset, font, line), inset - extra);
  });

  it("does not go negative when leading is larger than the inset", () => {
    assert.equal(paddingTopForCap(2, 32, 48), 0);
  });
});

describe("guards", () => {
  it("accepts the seven kinds and wrong|right", () => {
    assert.equal(isKindId("baseline"), true);
    assert.equal(isKindId("cover"), true);
    assert.equal(isKindId("tabs"), false);
    assert.equal(isStageState("right"), true);
    assert.equal(isStageState("wrong"), true);
    assert.equal(isStageState("ok"), false);
  });
});
