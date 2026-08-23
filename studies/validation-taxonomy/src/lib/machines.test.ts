import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  EMPTY_TOUCHED,
  EMPTY_VALUES,
  STAGE_TODAY,
  charCount,
  isFormReady,
  monthCells,
  shownByLesson,
  stageSnapshot,
  todayISO,
  validateAll,
  validateField,
  visibleErrors,
  type FormValues,
} from "./machines";

const TODAY = STAGE_TODAY;

function values(patch: Partial<FormValues>): FormValues {
  return { ...EMPTY_VALUES, ...patch };
}

describe("charCount", () => {
  it("counts CJK graphemes after trim", () => {
    assert.equal(charCount("夏日"), 2);
    assert.equal(charCount("夏日新品"), 4);
    assert.equal(charCount("  夏日  "), 2);
  });
});

describe("todayISO", () => {
  it("formats local YYYY-MM-DD", () => {
    assert.equal(todayISO(new Date(2026, 7, 23)), "2026-08-23");
    assert.equal(todayISO(new Date(2026, 0, 5)), "2026-01-05");
  });
});

describe("validateField name", () => {
  it("rejects two characters and accepts four", () => {
    assert.equal(validateField("name", values({ name: "夏日" }), TODAY), "name-short");
    assert.equal(validateField("name", values({ name: "夏日新品" }), TODAY), undefined);
  });

  it("rejects an empty name", () => {
    assert.equal(validateField("name", values({ name: "   " }), TODAY), "name-empty");
  });
});

describe("validateField date", () => {
  it("rejects a past day and accepts today or later", () => {
    assert.equal(validateField("date", values({ date: "2026-08-22" }), TODAY), "date-past");
    assert.equal(validateField("date", values({ date: "2026-08-23" }), TODAY), undefined);
    assert.equal(validateField("date", values({ date: "2026-09-12" }), TODAY), undefined);
  });

  it("rejects a missing date", () => {
    assert.equal(validateField("date", values({ date: "" }), TODAY), "date-empty");
  });
});

describe("validateAll / isFormReady", () => {
  it("collects every miss on an empty form", () => {
    const all = validateAll(EMPTY_VALUES, TODAY);
    assert.equal(all.name, "name-empty");
    assert.equal(all.type, "type-empty");
    assert.equal(all.date, "date-empty");
    assert.equal(all.confirmed, "confirm-empty");
    assert.equal(isFormReady(EMPTY_VALUES, TODAY), false);
  });

  it("is ready when every field passes", () => {
    const ready = values({
      name: "夏日新品体验会",
      type: "online",
      date: "2026-09-12",
      confirmed: true,
    });
    assert.deepEqual(validateAll(ready, TODAY), {});
    assert.equal(isFormReady(ready, TODAY), true);
  });
});

describe("visibleErrors", () => {
  it("hides untouched fields until submit", () => {
    assert.deepEqual(visibleErrors(EMPTY_VALUES, EMPTY_TOUCHED, false, TODAY), {});
  });

  it("reveals all misses after submit", () => {
    const shown = visibleErrors(EMPTY_VALUES, EMPTY_TOUCHED, true, TODAY);
    assert.equal(shown.name, "name-empty");
    assert.equal(shown.type, "type-empty");
    assert.equal(shown.date, "date-empty");
    assert.equal(shown.confirmed, "confirm-empty");
  });

  it("shows a touched field before submit", () => {
    const shown = visibleErrors(
      values({ name: "夏日" }),
      { ...EMPTY_TOUCHED, name: true },
      false,
      TODAY,
    );
    assert.equal(shown.name, "name-short");
    assert.equal(shown.type, undefined);
  });
});

describe("shownByLesson", () => {
  const short = values({ name: "夏日" });
  const past = values({
    name: "夏日新品体验会",
    type: "online",
    date: "2026-01-01",
    confirmed: true,
  });

  it("blur hides an untouched name until the field is left", () => {
    const hidden = shownByLesson("blur", {
      values: short,
      touched: EMPTY_TOUCHED,
      submitted: false,
    }, TODAY);
    assert.equal(hidden.name, undefined);

    const shown = shownByLesson("blur", {
      values: short,
      touched: { ...EMPTY_TOUCHED, name: true },
      submitted: false,
    }, TODAY);
    assert.equal(shown.name, "name-short");
  });

  it("inline shows the date error once a past day is picked", () => {
    const hidden = shownByLesson("inline", {
      values: past,
      touched: EMPTY_TOUCHED,
      submitted: false,
    }, TODAY);
    assert.equal(hidden.date, undefined);

    const shown = shownByLesson("inline", {
      values: past,
      touched: { ...EMPTY_TOUCHED, date: true },
      submitted: false,
    }, TODAY);
    assert.equal(shown.date, "date-past");
  });

  it("submit hides everything until the flag, then reveals all", () => {
    const hidden = shownByLesson("submit", {
      values: EMPTY_VALUES,
      touched: EMPTY_TOUCHED,
      submitted: false,
    }, TODAY);
    assert.deepEqual(hidden, {});

    const shown = shownByLesson("submit", {
      values: EMPTY_VALUES,
      touched: EMPTY_TOUCHED,
      submitted: true,
    }, TODAY);
    assert.equal(shown.name, "name-empty");
    assert.equal(shown.type, "type-empty");
    assert.equal(shown.date, "date-empty");
    assert.equal(shown.confirmed, "confirm-empty");
  });

  it("blur ignores a submitted flag so this lesson only speaks on leave", () => {
    const shown = shownByLesson("blur", {
      values: EMPTY_VALUES,
      touched: EMPTY_TOUCHED,
      submitted: true,
    }, TODAY);
    assert.deepEqual(shown, {});
  });
});

describe("monthCells", () => {
  it("pads a Monday-start August 2026 grid", () => {
    const cells = monthCells(2026, 7);
    assert.equal(cells.filter(Boolean).length, 31);
    assert.equal(cells[5]?.iso, "2026-08-01");
    assert.equal(cells[0], null);
  });
});

describe("stageSnapshot", () => {
  it("defaults submit/error to every miss visible", () => {
    const snap = stageSnapshot("submit", "error");
    const shown = shownByLesson("submit", snap, TODAY);
    assert.equal(Object.keys(shown).length, 4);
    assert.equal(snap.submitted, true);
  });

  it("locks blur/error on a two-character name", () => {
    const snap = stageSnapshot("blur", "error");
    const shown = shownByLesson("blur", snap, TODAY);
    assert.equal(shown.name, "name-short");
    assert.equal(shown.date, undefined);
  });

  it("locks inline/error on a past date", () => {
    const snap = stageSnapshot("inline", "error");
    const shown = shownByLesson("inline", snap, TODAY);
    assert.equal(shown.date, "date-past");
  });

  it("ok has no visible errors", () => {
    for (const kind of ["blur", "inline", "submit"] as const) {
      const snap = stageSnapshot(kind, "ok");
      assert.deepEqual(shownByLesson(kind, snap, TODAY), {});
      assert.equal(isFormReady(snap.values, TODAY), true);
    }
  });
});
