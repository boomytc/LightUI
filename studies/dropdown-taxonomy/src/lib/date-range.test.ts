import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  compareDay,
  day,
  formatIso,
  inRange,
  isPastDay,
  leadingBlanks,
  monthCells,
  nightsBetween,
  pickRangeDay,
  type DateRange,
} from "./date-range";

const today = day(2026, 7, 15);

describe("pickRangeDay", () => {
  it("ignores a day before today", () => {
    const range: DateRange = { from: null, to: null };
    assert.deepEqual(pickRangeDay(range, day(2026, 7, 14), today), range);
  });

  it("first click sets check-in only", () => {
    assert.deepEqual(pickRangeDay({ from: null, to: null }, day(2026, 7, 18), today), {
      from: day(2026, 7, 18),
      to: null,
    });
  });

  it("a later second click sets check-out", () => {
    const next = pickRangeDay({ from: day(2026, 7, 18), to: null }, day(2026, 7, 21), today);
    assert.deepEqual(next, { from: day(2026, 7, 18), to: day(2026, 7, 21) });
    assert.equal(nightsBetween(next.from!, next.to!), 3);
  });

  it("a same-day or earlier second click restarts check-in", () => {
    assert.deepEqual(
      pickRangeDay({ from: day(2026, 7, 18), to: null }, day(2026, 7, 18), today),
      { from: day(2026, 7, 18), to: null },
    );
    assert.deepEqual(
      pickRangeDay({ from: day(2026, 7, 18), to: null }, day(2026, 7, 16), today),
      { from: day(2026, 7, 16), to: null },
    );
  });

  it("a click after a complete span starts a new check-in", () => {
    assert.deepEqual(
      pickRangeDay(
        { from: day(2026, 7, 18), to: day(2026, 7, 21) },
        day(2026, 7, 25),
        today,
      ),
      { from: day(2026, 7, 25), to: null },
    );
  });
});

describe("nightsBetween / inRange", () => {
  it("counts calendar days, not 24-hour periods", () => {
    assert.equal(nightsBetween(day(2026, 7, 18), day(2026, 7, 21),), 3);
    assert.equal(nightsBetween(day(2026, 7, 31), day(2026, 8, 2)), 2);
  });

  it("marks interior days inclusive of both ends", () => {
    const range: DateRange = { from: day(2026, 7, 18), to: day(2026, 7, 21) };
    assert.equal(inRange(day(2026, 7, 18), range), true);
    assert.equal(inRange(day(2026, 7, 20), range), true);
    assert.equal(inRange(day(2026, 7, 21), range), true);
    assert.equal(inRange(day(2026, 7, 22), range), false);
  });
});

describe("calendar helpers", () => {
  it("orders days", () => {
    assert.equal(compareDay(day(2026, 7, 15), today), 0);
    assert.ok(compareDay(day(2026, 7, 14), today) < 0);
    assert.equal(isPastDay(day(2026, 7, 14), today), true);
  });

  it("formats ISO without a timezone shift", () => {
    assert.equal(formatIso(day(2026, 7, 8)), "2026-08-08");
  });

  it("builds a Monday-first August 2026 grid", () => {
    // 2026-08-01 is Saturday. Monday-first → 5 leading blanks.
    assert.equal(leadingBlanks(2026, 7, 1), 5);
    const cells = monthCells(2026, 7, 1);
    assert.equal(cells.length % 7, 0);
    assert.equal(cells[5]?.d, 1);
    assert.equal(cells.filter(Boolean).length, 31);
  });
});
