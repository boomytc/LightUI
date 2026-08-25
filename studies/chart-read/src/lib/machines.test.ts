import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  KIND_IDS,
  brushPointerDown,
  brushPointerMove,
  brushPointerUp,
  brushRange,
  drillPop,
  drillPush,
  gestureClass,
  isKindId,
  legendToggle,
  nearestIndex,
  rangeStats,
  xAt,
  zoomWindow,
  type DrillNode,
  type KindId,
} from "./machines";

describe("gestureClass", () => {
  it("maps all seven kinds", () => {
    const expected: Record<KindId, string> = {
      brush: "range",
      crosshair: "read",
      highlight: "read",
      tooltip: "read",
      legend: "filter",
      zoom: "window",
      drill: "path",
    };
    assert.equal(KIND_IDS.length, 7);
    for (const id of KIND_IDS) assert.equal(gestureClass(id), expected[id]);
  });
});

describe("isKindId", () => {
  it("accepts the seven leaves and rejects chart marks", () => {
    assert.equal(isKindId("brush"), true);
    assert.equal(isKindId("drill"), true);
    assert.equal(isKindId("line"), false);
    assert.equal(isKindId("pie"), false);
  });
});

describe("nearestIndex", () => {
  it("maps px on [0, 600] onto 0..6", () => {
    assert.equal(nearestIndex(7, 0, 0, 600), 0);
    assert.equal(nearestIndex(7, 600, 0, 600), 6);
    assert.equal(nearestIndex(7, 300, 0, 600), 3);
  });

  it("clamps outside the plot and handles empty geometry", () => {
    assert.equal(nearestIndex(7, -40, 0, 600), 0);
    assert.equal(nearestIndex(7, 900, 0, 600), 6);
    assert.equal(nearestIndex(0, 300, 0, 600), 0);
    assert.equal(nearestIndex(7, 300, 40, 40), 0);
  });

  it("is the inverse of xAt on the sample grid", () => {
    for (let i = 0; i < 7; i++) {
      assert.equal(nearestIndex(7, xAt(i, 7, 0, 600), 0, 600), i);
    }
  });
});

describe("brush", () => {
  it("orders an inclusive range", () => {
    assert.deepEqual(brushRange(2, 5), { start: 2, end: 5 });
    assert.deepEqual(brushRange(5, 2), { start: 2, end: 5 });
  });

  it("downs, moves, then freezes on up", () => {
    const down = brushPointerDown(2);
    assert.deepEqual(down, { origin: 2, start: 2, end: 2, frozen: false });
    const moved = brushPointerMove(down, 5);
    assert.deepEqual(moved, { origin: 2, start: 2, end: 5, frozen: false });
    const up = brushPointerUp(moved);
    assert.deepEqual(up, { origin: null, start: 2, end: 5, frozen: true });
  });

  it("ignores move when origin is null", () => {
    const idle = { origin: null, start: 0, end: 0, frozen: false };
    assert.equal(brushPointerMove(idle, 4), idle);
  });
});

describe("rangeStats", () => {
  it("averages an inclusive slice", () => {
    assert.deepEqual(rangeStats([1, 3, 5, 7], 1, 2), { count: 2, avg: 4, peak: 5 });
  });

  it("returns zeros when empty", () => {
    assert.deepEqual(rangeStats([], 0, 2), { count: 0, avg: 0, peak: 0 });
    assert.deepEqual(rangeStats([1, 2], 2, 1), { count: 0, avg: 0, peak: 0 });
  });
});

describe("legendToggle", () => {
  it("cannot hide the last visible series", () => {
    const all = ["a", "b", "c"];
    let hidden = new Set<string>();
    hidden = legendToggle(hidden, "a", all);
    hidden = legendToggle(hidden, "b", all);
    assert.deepEqual([...hidden].sort(), ["a", "b"]);
    const stuck = legendToggle(hidden, "c", all);
    assert.equal(stuck.has("c"), false);
    assert.deepEqual([...stuck].sort(), ["a", "b"]);
    hidden = legendToggle(hidden, "a", all);
    assert.equal(hidden.has("a"), false);
  });
});

describe("zoomWindow", () => {
  it("shrinks the span around the cursor", () => {
    const z = zoomWindow(0, 29, 0.5, 15, 2, 29);
    assert.ok(z.end - z.start < 29);
    assert.ok(z.start < 15 && z.end > 15);
    assert.ok(z.start >= 0 && z.end <= 29);
    assert.ok(z.end - z.start >= 2);
    assert.deepEqual(z, { start: 7, end: 22 });
  });

  it("clamps a zoom-out to [0, maxEnd]", () => {
    const z = zoomWindow(8, 22, 4, 15, 2, 29);
    assert.equal(z.start, 0);
    assert.equal(z.end, 29);
  });
});

const TREE: readonly DrillNode[] = [
  {
    id: "search",
    name: "Search",
    children: [
      {
        id: "brand",
        name: "Brand",
        children: [
          { id: "home", name: "Home" },
          { id: "event", name: "Event" },
        ],
      },
    ],
  },
  { id: "direct", name: "Direct" },
];

describe("drill", () => {
  it("pushes only when the child has children", () => {
    assert.deepEqual(drillPush([], "search", TREE), ["search"]);
    assert.deepEqual(drillPush(["search"], "brand", TREE), ["search", "brand"]);
    assert.deepEqual(drillPush(["search", "brand"], "home", TREE), ["search", "brand"]);
    assert.deepEqual(drillPush([], "direct", TREE), []);
    assert.deepEqual(drillPush([], "missing", TREE), []);
  });

  it("pops the path to a clamped length", () => {
    assert.deepEqual(drillPop(["search", "brand"], 1), ["search"]);
    assert.deepEqual(drillPop(["search", "brand"], 0), []);
    assert.deepEqual(drillPop(["search"], 8), ["search"]);
    assert.deepEqual(drillPop(["search"], -1), []);
  });
});
