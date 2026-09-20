import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CASCADE_PATH, RANGE, REGIONS, RULER, STEPPER, TODAY } from "./fixtures";
import {
  KIND_IDS,
  addMonths,
  applyRangeThumb,
  atCeil,
  atFloor,
  cascadeComplete,
  cascadeJump,
  cascadeOptions,
  cascadeSelect,
  childrenOf,
  choosePicker,
  compareDay,
  dateComplete,
  day,
  defaultStageState,
  inRange,
  isKindId,
  isPastDay,
  monthCells,
  nearestThumb,
  nightsBetween,
  pickDate,
  shapeOf,
  snapRuler,
  stageState,
  stepQty,
  valueFromDrag,
  valueFromTrack,
  type KindId,
} from "./machines";

describe("KIND_IDS", () => {
  it("is the five picker leaves", () => {
    const ids: readonly KindId[] = KIND_IDS;
    assert.deepEqual(ids, ["ruler", "range", "stepper", "cascader", "dates"]);
  });
});

describe("isKindId", () => {
  it("accepts the leaves and rejects fill / wheel / dropdown slugs", () => {
    assert.equal(isKindId("ruler"), true);
    assert.equal(isKindId("dates"), true);
    assert.equal(isKindId("text-field"), false);
    assert.equal(isKindId("select"), false);
    assert.equal(isKindId("wheel"), false);
    assert.equal(isKindId(""), false);
  });
});

describe("choosePicker", () => {
  it("maps what is picked onto a machine", () => {
    assert.equal(choosePicker("one-tick"), "ruler");
    assert.equal(choosePicker("two-ends"), "range");
    assert.equal(choosePicker("few-steps"), "stepper");
    assert.equal(choosePicker("tree-path"), "cascader");
    assert.equal(choosePicker("date-span"), "dates");
  });

  it("is the inverse of shapeOf", () => {
    for (const id of KIND_IDS) {
      assert.equal(choosePicker(shapeOf(id)), id);
    }
  });
});

describe("snapRuler", () => {
  it("lands 60.04 on 60.0 and stays inside the scale", () => {
    assert.equal(snapRuler(60.04, RULER.step, RULER.min, RULER.max), 60);
    assert.equal(snapRuler(60.05, RULER.step, RULER.min, RULER.max), 60.1);
    assert.equal(snapRuler(20, RULER.step, RULER.min, RULER.max), RULER.min);
    assert.equal(snapRuler(200, RULER.step, RULER.min, RULER.max), RULER.max);
  });
});

describe("valueFromDrag", () => {
  it("dragging right lowers the value because the ticks move under a fixed pointer", () => {
    assert.equal(valueFromDrag(60, 100, RULER.pxPerUnit, RULER.min, RULER.max), 59);
    assert.equal(valueFromDrag(60, -100, RULER.pxPerUnit, RULER.min, RULER.max), 61);
    assert.equal(valueFromDrag(30, 400, RULER.pxPerUnit, RULER.min, RULER.max), RULER.min);
  });
});

describe("applyRangeThumb", () => {
  it("keeps a gap so the floor cannot sit on the ceiling", () => {
    const crossed = applyRangeThumb(
      "lo",
      900,
      RANGE.lo,
      RANGE.hi,
      RANGE.min,
      RANGE.max,
      RANGE.gap,
      RANGE.step,
    );
    assert.equal(crossed.lo, RANGE.hi - RANGE.gap);
    assert.equal(crossed.hi, RANGE.hi);

    const fromHi = applyRangeThumb(
      "hi",
      50,
      RANGE.lo,
      RANGE.hi,
      RANGE.min,
      RANGE.max,
      RANGE.gap,
      RANGE.step,
    );
    assert.equal(fromHi.hi, RANGE.lo + RANGE.gap);
    assert.equal(fromHi.lo, RANGE.lo);
  });

  it("snaps to the 10-yuan step", () => {
    const next = applyRangeThumb("lo", 247, 100, 800, 0, 1000, 10, 10);
    assert.equal(next.lo, 250);
  });
});

describe("nearestThumb / valueFromTrack", () => {
  it("picks the closer thumb, ties go to the floor", () => {
    assert.equal(nearestThumb(120, 100, 800), "lo");
    assert.equal(nearestThumb(780, 100, 800), "hi");
    assert.equal(nearestThumb(450, 100, 800), "lo");
  });

  it("maps a track x onto a snapped value", () => {
    assert.equal(valueFromTrack(50, 0, 100, 0, 1000, 10), 500);
    assert.equal(valueFromTrack(-10, 0, 100, 0, 1000, 10), 0);
  });
});

describe("stepQty", () => {
  it("stops at the floor so minus can disable", () => {
    assert.equal(stepQty(2, -1, STEPPER.min, STEPPER.max), 1);
    assert.equal(stepQty(1, -1, STEPPER.min, STEPPER.max), 1);
    assert.equal(atFloor(1, STEPPER.min), true);
    assert.equal(atFloor(2, STEPPER.min), false);
    assert.equal(stepQty(99, 1, STEPPER.min, STEPPER.max), 99);
    assert.equal(atCeil(99, STEPPER.max), true);
  });
});

describe("cascade", () => {
  it("changing a parent drops the children", () => {
    const path = [...CASCADE_PATH];
    assert.equal(cascadeComplete(path), true);
    const jumped = cascadeJump(path, 0);
    assert.deepEqual(jumped, ["浙江省"]);
    const next = cascadeSelect(jumped, "宁波市");
    assert.deepEqual(next, ["浙江省", "宁波市"]);
    assert.equal(cascadeComplete(next), false);
    assert.ok(!next.includes("西湖区"));
  });

  it("replaces only the leaf when the path is already complete", () => {
    const next = cascadeSelect([...CASCADE_PATH], "拱墅区");
    assert.deepEqual(next, ["浙江省", "杭州市", "拱墅区"]);
  });

  it("lists the current level from the tree", () => {
    const districts = cascadeOptions(REGIONS, ["浙江省", "杭州市"]);
    assert.deepEqual(
      districts.map((n) => n.name),
      ["上城区", "拱墅区", "西湖区"],
    );
    assert.equal(childrenOf(REGIONS, []).length, 3);
  });
});

describe("pickDate", () => {
  it("ignores the past, then start, then end after start", () => {
    const empty = { from: null, to: null };
    assert.deepEqual(pickDate(empty, day(2026, 8, 10), TODAY), empty);

    const start = pickDate(empty, day(2026, 8, 20), TODAY);
    assert.deepEqual(start, { from: day(2026, 8, 20), to: null });

    const span = pickDate(start, day(2026, 8, 23), TODAY);
    assert.deepEqual(span, { from: day(2026, 8, 20), to: day(2026, 8, 23) });
    assert.equal(nightsBetween(span.from!, span.to!), 3);
    assert.equal(dateComplete(span), true);
    assert.equal(inRange(day(2026, 8, 21), span), true);
    assert.equal(inRange(day(2026, 8, 24), span), false);
  });

  it("tapping start or earlier restarts; a complete span starts over", () => {
    const start = { from: day(2026, 8, 22), to: null };
    assert.deepEqual(pickDate(start, day(2026, 8, 22), TODAY), {
      from: day(2026, 8, 22),
      to: null,
    });
    assert.deepEqual(pickDate(start, day(2026, 8, 20), TODAY), {
      from: day(2026, 8, 20),
      to: null,
    });
    assert.deepEqual(pickDate(start, day(2026, 8, 19), TODAY), start);

    const complete = { from: day(2026, 8, 20), to: day(2026, 8, 23) };
    assert.deepEqual(pickDate(complete, day(2026, 8, 22), TODAY), {
      from: day(2026, 8, 22),
      to: null,
    });
  });

  it("keeps past days out of the September 2026 grid", () => {
    assert.equal(isPastDay(day(2026, 8, 19), TODAY), true);
    assert.equal(isPastDay(day(2026, 8, 20), TODAY), false);
    assert.equal(compareDay(TODAY, day(2026, 8, 20)), 0);
    const cells = monthCells(2026, 8);
    assert.equal(cells.filter(Boolean).length, 30);
    assert.deepEqual(addMonths(day(2026, 8, 1), 1), day(2026, 9, 1));
  });
});

describe("stageState", () => {
  it("locks each kind to its diagnostic fixture", () => {
    assert.equal(defaultStageState("ruler"), "snap");
    assert.equal(defaultStageState("range"), "span");
    assert.equal(defaultStageState("stepper"), "floor");
    assert.equal(defaultStageState("cascader"), "path");
    assert.equal(defaultStageState("dates"), "span");
    assert.equal(stageState("snap", "ruler"), "snap");
    assert.equal(stageState("open", "ruler"), "snap");
    assert.equal(stageState("floor", "stepper"), "floor");
  });
});
