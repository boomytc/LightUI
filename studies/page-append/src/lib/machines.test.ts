import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  KIND_IDS,
  appendCount,
  appendExhausted,
  collectionMode,
  collectionView,
  dropsOldItems,
  isKindId,
  nextPage,
  pageCount,
  pageSlice,
  prevPage,
  resetsScroll,
  type KindId,
} from "./machines";

const TEN = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

describe("KIND_IDS", () => {
  it("is the two leaves", () => {
    const ids: readonly KindId[] = KIND_IDS;
    assert.deepEqual(ids, ["page", "append"]);
  });
});

describe("isKindId", () => {
  it("accepts the two leaves and rejects infinite / carousel", () => {
    assert.equal(isKindId("page"), true);
    assert.equal(isKindId("append"), true);
    assert.equal(isKindId("infinite"), false);
    assert.equal(isKindId("carousel"), false);
    assert.equal(isKindId(""), false);
  });
});

describe("collectionMode", () => {
  it("replaces on page and appends on append", () => {
    assert.equal(collectionMode("page"), "replace");
    assert.equal(collectionMode("append"), "append");
  });
});

describe("dropsOldItems", () => {
  it("is true only for page", () => {
    assert.equal(dropsOldItems("page"), true);
    assert.equal(dropsOldItems("append"), false);
  });
});

describe("resetsScroll", () => {
  it("is true only for page", () => {
    assert.equal(resetsScroll("page"), true);
    assert.equal(resetsScroll("append"), false);
  });
});

describe("pageSlice", () => {
  it("takes a 1-based page of ten items, size 3", () => {
    assert.deepEqual(pageSlice(TEN, 2, 3), [3, 4, 5]);
  });

  it("is empty when page is below 1", () => {
    assert.deepEqual(pageSlice(TEN, 0, 3), []);
    assert.deepEqual(pageSlice(TEN, -1, 3), []);
  });

  it("is empty when pageSize is not positive", () => {
    assert.deepEqual(pageSlice(TEN, 1, 0), []);
  });
});

describe("pageCount", () => {
  it("ceils 10 / 3 to 4, and is 0 when total or pageSize is not positive", () => {
    assert.equal(pageCount(10, 3), 4);
    assert.equal(pageCount(0, 3), 0);
    assert.equal(pageCount(5, 0), 0);
  });
});

describe("nextPage / prevPage", () => {
  it("clamps at the ends, and returns 1 when there are no pages", () => {
    assert.equal(nextPage(4, 4), 4);
    assert.equal(prevPage(1, 4), 1);
    assert.equal(nextPage(1, 0), 1);
    assert.equal(prevPage(3, 0), 1);
  });
});

describe("appendCount", () => {
  it("grows by batch and stops at total", () => {
    assert.equal(appendCount(4, 4, 10), 8);
    assert.equal(appendCount(8, 4, 10), 10);
    assert.equal(appendCount(10, 4, 10), 10);
  });

  it("clamps visible to [0, total] before adding", () => {
    assert.equal(appendCount(12, 4, 10), 10);
    assert.equal(appendCount(-2, 4, 10), 4);
  });
});

describe("appendExhausted", () => {
  it("is true when visible has reached a non-negative total", () => {
    assert.equal(appendExhausted(10, 10), true);
    assert.equal(appendExhausted(8, 10), false);
  });
});

describe("collectionView", () => {
  it("page drops items not on this page and asks for a scroll reset", () => {
    const view = collectionView("page", TEN, { page: 2, pageSize: 3, visible: 10, batch: 4 });
    assert.deepEqual(view.shown, [3, 4, 5]);
    assert.equal(view.shown.includes(0), false);
    assert.equal(view.scrollReset, true);
    assert.equal(view.exhausted, false);
    assert.equal(dropsOldItems("page"), true);
  });

  it("page is exhausted on the last slice", () => {
    const view = collectionView("page", TEN, { page: 4, pageSize: 3, visible: 0, batch: 0 });
    assert.deepEqual(view.shown, [9]);
    assert.equal(view.exhausted, true);
  });

  it("append keeps the prefix and does not auto-add batch", () => {
    const view = collectionView("append", TEN, { page: 1, pageSize: 3, visible: 4, batch: 4 });
    assert.deepEqual(view.shown, [0, 1, 2, 3]);
    assert.equal(view.visible, 4);
    assert.equal(view.scrollReset, false);
    assert.equal(view.exhausted, false);
    assert.equal(dropsOldItems("append"), false);
  });

  it("append keeps the same leading ids as visible grows", () => {
    const first = collectionView("append", TEN, { page: 1, pageSize: 3, visible: 4, batch: 99 });
    const next = collectionView("append", TEN, {
      page: 1,
      pageSize: 3,
      visible: appendCount(4, 4, TEN.length),
      batch: 99,
    });
    assert.deepEqual(first.shown, [0, 1, 2, 3]);
    assert.deepEqual(next.shown, [0, 1, 2, 3, 4, 5, 6, 7]);
    assert.deepEqual(next.shown.slice(0, 4), first.shown);
  });
});
