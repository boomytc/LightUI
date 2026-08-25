import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  commitKind,
  dropzoneHit,
  edgeScrollDelta,
  insertIndexY,
  isKindId,
  moveItem,
  passedThreshold,
  snapbackKeepsModel,
  transferItem,
} from "./machines";

describe("commitKind", () => {
  it("maps each kind to its commit", () => {
    assert.equal(commitKind("reorder"), "reorder");
    assert.equal(commitKind("dropzone"), "receive");
    assert.equal(commitKind("transfer"), "transfer");
    assert.equal(commitKind("snapback"), "reject");
  });
});

describe("insertIndexY", () => {
  const slots = [
    { id: "A", top: 0, height: 40 },
    { id: "B", top: 40, height: 40 },
    { id: "C", top: 80, height: 40 },
  ];

  it("inserts before the first remaining item", () => {
    assert.equal(insertIndexY(slots, 10, "B"), 0);
  });

  it("inserts at the end of the remaining items", () => {
    assert.equal(insertIndexY(slots, 100, "B"), 2);
  });
});

describe("dropzoneHit", () => {
  const box = { left: 10, top: 20, right: 110, bottom: 80 };

  it("is true inside the zone", () => {
    assert.equal(dropzoneHit(box, 10, 20), true);
    assert.equal(dropzoneHit(box, 60, 50), true);
    assert.equal(dropzoneHit(box, 110, 80), true);
  });

  it("is false outside the zone", () => {
    assert.equal(dropzoneHit(box, 9, 50), false);
    assert.equal(dropzoneHit(box, 60, 81), false);
    assert.equal(dropzoneHit(box, 111, 20), false);
  });
});

describe("moveItem", () => {
  it("reorders a to index 2", () => {
    assert.deepEqual(
      moveItem([{ id: "a" }, { id: "b" }, { id: "c" }], "a", 2),
      [{ id: "b" }, { id: "c" }, { id: "a" }],
    );
  });

  it("does not mutate the source list", () => {
    const list = [{ id: "a" }, { id: "b" }, { id: "c" }];
    moveItem(list, "a", 2);
    assert.deepEqual(list, [{ id: "a" }, { id: "b" }, { id: "c" }]);
  });
});

describe("transferItem", () => {
  it("moves an item across lists", () => {
    const source = [{ id: "a" }, { id: "b" }];
    const dest = [{ id: "c" }];
    const next = transferItem(source, dest, "b", 0);
    assert.deepEqual(next.source, [{ id: "a" }]);
    assert.deepEqual(next.dest, [{ id: "b" }, { id: "c" }]);
    assert.deepEqual(source, [{ id: "a" }, { id: "b" }]);
    assert.deepEqual(dest, [{ id: "c" }]);
  });

  it("leaves both copies unchanged when the id is missing", () => {
    const source = [{ id: "a" }];
    const dest = [{ id: "c" }];
    const next = transferItem(source, dest, "missing", 0);
    assert.deepEqual(next.source, [{ id: "a" }]);
    assert.deepEqual(next.dest, [{ id: "c" }]);
    assert.notEqual(next.source, source);
    assert.notEqual(next.dest, dest);
  });
});

describe("snapbackKeepsModel", () => {
  it("keeps the model when the drop is invalid", () => {
    assert.equal(snapbackKeepsModel(false), true);
    assert.equal(snapbackKeepsModel(true), false);
  });
});

describe("passedThreshold", () => {
  it("stays idle below 6px hypot", () => {
    assert.equal(passedThreshold(3, 3), false);
  });

  it("lifts at 6px", () => {
    assert.equal(passedThreshold(6, 0), true);
  });
});

describe("edgeScrollDelta", () => {
  it("is 0 at the center of the container", () => {
    assert.equal(edgeScrollDelta(100, 0, 200), 0);
  });

  it("is negative near the top and positive near the bottom", () => {
    assert.ok(edgeScrollDelta(10, 0, 200) < 0);
    assert.ok(edgeScrollDelta(190, 0, 200) > 0);
  });
});

describe("isKindId", () => {
  it("rejects placeholder and autoscroll", () => {
    assert.equal(isKindId("placeholder"), false);
    assert.equal(isKindId("autoscroll"), false);
  });

  it("accepts the four commit kinds", () => {
    assert.equal(isKindId("reorder"), true);
    assert.equal(isKindId("dropzone"), true);
    assert.equal(isKindId("transfer"), true);
    assert.equal(isKindId("snapback"), true);
  });
});
