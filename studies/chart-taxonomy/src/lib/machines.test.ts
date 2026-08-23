import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  axisFromZero,
  hasAlt,
  intentOf,
  KIND_IDS,
  lineRequiresTime,
  markFor,
  maxPieSlices,
  stageState,
  tooManyForPie,
  type IntentId,
  type Mark,
} from "./machines";

describe("intentOf", () => {
  it("treats the six leaves as the questions, not the marks", () => {
    for (const kind of KIND_IDS) {
      assert.equal(intentOf(kind), kind);
      assert.notEqual(markFor(kind, "primary"), kind);
    }
  });
});

describe("markFor", () => {
  it("maps each intent to its primary mark", () => {
    assert.equal(markFor("change"), "line");
    assert.equal(markFor("compare", "primary"), "column");
    assert.equal(markFor("share", "primary"), "pie");
    assert.equal(markFor("relate", "primary"), "scatter");
    assert.equal(markFor("flow", "primary"), "funnel");
    assert.equal(markFor("ability", "primary"), "radar");
  });

  it("uses alt as area, bar, stacked, heatmap", () => {
    assert.equal(markFor("change", "alt"), "area");
    assert.equal(markFor("compare", "alt"), "bar");
    assert.equal(markFor("share", "alt"), "stacked");
    assert.equal(markFor("relate", "alt"), "heatmap");
  });

  it("keeps flow and ability on one mark even when alt is asked", () => {
    assert.equal(markFor("flow", "alt"), "funnel");
    assert.equal(markFor("ability", "alt"), "radar");
    assert.equal(hasAlt("change"), true);
    assert.equal(hasAlt("compare"), true);
    assert.equal(hasAlt("share"), true);
    assert.equal(hasAlt("relate"), true);
    assert.equal(hasAlt("flow"), false);
    assert.equal(hasAlt("ability"), false);
  });
});

describe("axisFromZero", () => {
  it("starts comparison and time volume at 0", () => {
    const zero: Mark[] = ["line", "area", "column", "bar", "stacked", "radar"];
    for (const mark of zero) assert.equal(axisFromZero(mark), true);
  });

  it("does not force a zero axis on pie, scatter, heatmap, or funnel", () => {
    const free: Mark[] = ["pie", "scatter", "heatmap", "funnel"];
    for (const mark of free) assert.equal(axisFromZero(mark), false);
  });
});

describe("tooManyForPie", () => {
  it("caps a pie at five slices", () => {
    assert.equal(maxPieSlices, 5);
    assert.equal(tooManyForPie(5), false);
    assert.equal(tooManyForPie(6), true);
    assert.equal(tooManyForPie(0), false);
  });
});

describe("lineRequiresTime", () => {
  it("only the change question may connect with a line", () => {
    assert.equal(lineRequiresTime("change"), true);
    const rest: IntentId[] = ["compare", "share", "relate", "flow", "ability"];
    for (const kind of rest) assert.equal(lineRequiresTime(kind), false);
  });
});

describe("stageState", () => {
  it("locks alt when asked, otherwise primary", () => {
    assert.equal(stageState("alt"), "alt");
    assert.equal(stageState("primary"), "primary");
    assert.equal(stageState(""), "primary");
    assert.equal(stageState("area"), "primary");
  });
});
