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
  numeric: "digit",
  between: "edge",
  reading: "edge",
  center: "focus",
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

  it("treats optical mass and hero results as focus", () => {
    assert.equal(aligns("optical"), "focus");
    assert.equal(aligns("center"), "focus");
    assert.notEqual(aligns("optical"), "box");
  });

  it("treats numeric digits as digit target", () => {
    assert.equal(aligns("numeric"), "digit");
  });

  it("treats leftover spacing as gap, flush type and boundaries as edge", () => {
    assert.equal(aligns("margin"), "gap");
    assert.equal(aligns("padding"), "edge");
    assert.equal(aligns("inset"), "edge");
    assert.equal(aligns("between"), "edge");
    assert.equal(aligns("reading"), "edge");
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
  it("accepts the eleven kinds and wrong|right", () => {
    assert.equal(KIND_IDS.length, 11);
    for (const kind of KIND_IDS) {
      assert.equal(isKindId(kind), true, `isKindId(${kind}) should be true`);
      assert.ok(["baseline", "focus", "box", "gap", "edge", "digit"].includes(aligns(kind)));
    }
    assert.equal(isKindId("tabs"), false);
    assert.equal(isKindId(""), false);
    assert.equal(isKindId("numeric2"), false);
    assert.equal(isStageState("right"), true);
    assert.equal(isStageState("wrong"), true);
    assert.equal(isStageState("ok"), false);
    assert.equal(isStageState(""), false);
  });

  it("ensures newly added kinds do not trigger object-position", () => {
    for (const kind of ["numeric", "between", "reading", "center"] as const) {
      assert.equal(needsObjectPosition(kind), false);
      assert.equal(objectFitFor(kind), "contain");
      assert.equal(objectPositionFor(kind, "right"), GEOMETRIC_POSITION);
      assert.equal(objectPositionFor(kind, "wrong"), GEOMETRIC_POSITION);
    }
  });
});
