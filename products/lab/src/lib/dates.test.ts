import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { compareDayDesc, compareStudies, parseDay, stampLabel, studyUpdated } from "./dates";
import type { StudyMeta } from "./study";

function meta(partial: Partial<StudyMeta> & Pick<StudyMeta, "slug">): StudyMeta {
  return {
    title: partial.slug,
    summary: "",
    status: "active",
    tags: [],
    ...partial,
  };
}

describe("parseDay", () => {
  it("keeps a calendar day", () => {
    assert.equal(parseDay("2026-08-15"), "2026-08-15");
  });

  it("drops empty or malformed values", () => {
    assert.equal(parseDay(undefined), undefined);
    assert.equal(parseDay(""), undefined);
    assert.equal(parseDay("15/08/2026"), undefined);
    assert.equal(parseDay("2026-8-15"), undefined);
  });
});

describe("compareDayDesc", () => {
  it("orders later days first", () => {
    assert.ok(compareDayDesc("2026-08-15", "2026-08-14") < 0);
    assert.ok(compareDayDesc("2026-08-14", "2026-08-15") > 0);
    assert.equal(compareDayDesc("2026-08-15", "2026-08-15"), 0);
  });

  it("puts a missing day after a real one", () => {
    assert.ok(compareDayDesc(undefined, "2026-08-15") > 0);
    assert.ok(compareDayDesc("2026-08-15", undefined) < 0);
  });
});

describe("compareStudies", () => {
  it("keeps active ahead of draft", () => {
    const active = meta({ slug: "zzz", status: "active", updated: "2026-01-01" });
    const draft = meta({ slug: "aaa", status: "draft", updated: "2026-12-01" });
    assert.ok(compareStudies(active, draft) < 0);
  });

  it("within a status, newest update wins", () => {
    const older = meta({ slug: "a", created: "2026-08-01", updated: "2026-08-10" });
    const newer = meta({ slug: "b", created: "2026-08-01", updated: "2026-08-15" });
    assert.ok(compareStudies(newer, older) < 0);
  });

  it("falls back to created, then slug", () => {
    const early = meta({ slug: "zeta", created: "2026-08-01" });
    const late = meta({ slug: "alpha", created: "2026-08-15" });
    assert.ok(compareStudies(late, early) < 0);
    const a = meta({ slug: "alpha", created: "2026-08-15", updated: "2026-08-15" });
    const b = meta({ slug: "beta", created: "2026-08-15", updated: "2026-08-15" });
    assert.ok(compareStudies(a, b) < 0);
  });
});

describe("stampLabel", () => {
  it("shows one day when created and updated match", () => {
    assert.equal(stampLabel("2026-08-15", "2026-08-15", "zh"), "2026-08-15");
  });

  it("names the update when the two days differ", () => {
    assert.equal(stampLabel("2026-08-15", "2026-08-16", "zh"), "2026-08-15 · 更新 2026-08-16");
    assert.equal(stampLabel("2026-08-15", "2026-08-16", "en"), "2026-08-15 · updated 2026-08-16");
  });

  it("uses created when updated is missing", () => {
    assert.equal(stampLabel("2026-08-15", undefined, "zh"), "2026-08-15");
    assert.equal(studyUpdated({ created: "2026-08-15" }), "2026-08-15");
  });
});
