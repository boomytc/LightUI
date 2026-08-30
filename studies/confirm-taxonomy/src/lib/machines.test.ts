import assert from "node:assert/strict";
import test, { describe } from "node:test";
import {
  areAllChecklistItemsSelected,
  calculateHoldProgress,
  isHoldComplete,
  isTypeMatchValid,
  resolveSwipeReveal,
} from "./machines";

describe("calculateHoldProgress", () => {
  test("returns 0 at start", () => {
    assert.equal(calculateHoldProgress(0, 2000), 0);
  });

  test("returns 0.5 at 1 second", () => {
    assert.equal(calculateHoldProgress(1000, 2000), 0.5);
  });

  test("clamps at 1 when elapsed exceeds duration", () => {
    assert.equal(calculateHoldProgress(2500, 2000), 1);
  });
});

describe("isHoldComplete", () => {
  test("returns false before target duration", () => {
    assert.equal(isHoldComplete(1999, 2000), false);
  });

  test("returns true when target duration is reached or exceeded", () => {
    assert.equal(isHoldComplete(2000, 2000), true);
    assert.equal(isHoldComplete(2100, 2000), true);
  });
});

describe("resolveSwipeReveal", () => {
  test("does not open when dragged less than threshold", () => {
    const res = resolveSwipeReveal(-30, 56, 80);
    assert.equal(res.shouldOpen, false);
    assert.equal(res.revealedPx, -30);
  });

  test("snaps open when dragged past threshold", () => {
    const res = resolveSwipeReveal(-60, 56, 80);
    assert.equal(res.shouldOpen, true);
    assert.equal(res.revealedPx, -60);
  });

  test("clamps overdragging within max action boundary", () => {
    const res = resolveSwipeReveal(-120, 56, 80);
    assert.equal(res.revealedPx, -92);
  });
});

describe("isTypeMatchValid", () => {
  test("accepts exact string match", () => {
    assert.equal(isTypeMatchValid("DELETE", "DELETE"), true);
    assert.equal(isTypeMatchValid("sue-prod-db", "sue-prod-db"), true);
  });

  test("rejects case mismatch or partial match", () => {
    assert.equal(isTypeMatchValid("delete", "DELETE"), false);
    assert.equal(isTypeMatchValid("DELET", "DELETE"), false);
    assert.equal(isTypeMatchValid("DELETE ", "DELETE"), false);
  });
});

describe("areAllChecklistItemsSelected", () => {
  const required = ["docs", "members", "keys"];

  test("returns false when some items are unchecked", () => {
    assert.equal(
      areAllChecklistItemsSelected({ docs: true, members: false, keys: true }, required),
      false,
    );
  });

  test("returns true when all items are checked", () => {
    assert.equal(
      areAllChecklistItemsSelected({ docs: true, members: true, keys: true }, required),
      true,
    );
  });
});
