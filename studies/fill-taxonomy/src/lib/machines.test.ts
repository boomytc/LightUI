import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { repairCopy } from "./kinds";
import {
  asksKnownFact,
  DUTY_IDS,
  dutiesIn,
  fieldMark,
  fieldsFor,
  formatPhone,
  hintKind,
  identityLost,
  isReadout,
  markIsAccessible,
  outcomeComplete,
  phaseOf,
  phoneDigits,
  phoneRepair,
  repairIsActionable,
  repairPlacement,
  seatValue,
  sectionsFor,
  SHORT_PHONE,
  shownCopy,
  stackedCopy,
  stageSnapshot,
} from "./machines";

describe("phaseOf", () => {
  it("groups the seven duties into three moments", () => {
    assert.deepEqual(dutiesIn("before"), ["label", "required", "helper", "group"]);
    assert.deepEqual(dutiesIn("during"), ["hint", "repair"]);
    assert.deepEqual(dutiesIn("after"), ["done"]);
    assert.equal(phaseOf("label"), "before");
    assert.equal(phaseOf("hint"), "during");
    assert.equal(phaseOf("done"), "after");
    assert.equal(DUTY_IDS.length, 7);
  });
});

describe("identityLost", () => {
  it("loses the field when only a placeholder remains and text is typed", () => {
    assert.equal(identityLost(false, "苏晓雨"), true);
    assert.equal(identityLost(false, ""), false);
    assert.equal(identityLost(true, "苏晓雨"), false);
  });
});

describe("fieldMark", () => {
  it("stays silent on the naive form", () => {
    const required = fieldMark(false, "required");
    const optional = fieldMark(false, "optional");
    assert.deepEqual(required, { star: false, srRequired: false, optional: false });
    assert.deepEqual(optional, { star: false, srRequired: false, optional: false });
    assert.equal(markIsAccessible(required, "required"), false);
    assert.equal(markIsAccessible(optional, "optional"), false);
  });

  it("marks required with a star and sr-only text, optional in words", () => {
    const required = fieldMark(true, "required");
    const optional = fieldMark(true, "optional");
    assert.deepEqual(required, { star: true, srRequired: true, optional: false });
    assert.deepEqual(optional, { star: false, srRequired: false, optional: true });
    assert.equal(markIsAccessible(required, "required"), true);
    assert.equal(markIsAccessible(optional, "optional"), true);
  });
});

describe("shownCopy", () => {
  it("replaces helper with error, never stacks", () => {
    assert.equal(shownCopy({ hasHelper: true, hasError: true, hasOk: false }), "error");
    assert.equal(shownCopy({ hasHelper: true, hasError: false, hasOk: true }), "ok");
    assert.equal(shownCopy({ hasHelper: true, hasError: false, hasOk: false }), "helper");
    assert.equal(shownCopy({ hasHelper: false, hasError: false, hasOk: false }), "none");
    assert.equal(stackedCopy(true, true), true);
    assert.equal(stackedCopy(true, false), false);
  });
});

describe("hintKind", () => {
  it("puts format in the placeholder and preselects a real default", () => {
    assert.equal(hintKind("phone", false), "empty");
    assert.equal(hintKind("email", false), "empty");
    assert.equal(hintKind("seat", false), "empty");
    assert.equal(hintKind("phone", true), "format");
    assert.equal(hintKind("email", true), "format");
    assert.equal(hintKind("seat", true), "preselected");
    assert.equal(seatValue(false), "");
    assert.equal(seatValue(true), "standard");
  });
});

describe("sectionsFor", () => {
  it("dumps extras as fillable known facts when naive", () => {
    const naive = sectionsFor(false);
    assert.equal(naive.length, 1);
    assert.equal(naive[0]?.group, "flat");
    assert.equal(asksKnownFact(false), true);
    assert.ok(fieldsFor(false).some((field) => field.extra));
    assert.equal(
      naive[0]?.fields.every((field) => !isReadout(field, false)),
      true,
    );
  });

  it("groups by task and turns known facts into readouts", () => {
    const clear = sectionsFor(true);
    assert.deepEqual(
      clear.map((section) => section.group),
      ["event", "signup", "prefs"],
    );
    assert.equal(asksKnownFact(true), false);
    assert.equal(fieldsFor(true).some((field) => field.extra), false);
    const event = clear[0]?.fields ?? [];
    assert.ok(event.length > 0);
    assert.equal(event.every((field) => isReadout(field, true)), true);
  });
});

describe("phoneRepair", () => {
  it("formats as 3-4-4 and names remaining digits or an invalid prefix", () => {
    assert.equal(phoneDigits("138-0000-00ab"), "138000000");
    assert.equal(formatPhone("13800000000"), "138 0000 0000");
    const short = phoneRepair(SHORT_PHONE);
    assert.equal(short.tone, "error");
    assert.equal(short.remain, 3);
    assert.equal(repairIsActionable(short), true);
    const invalid = phoneRepair("12000000000");
    assert.equal(invalid.tone, "error");
    assert.equal(invalid.invalid, true);
    assert.equal(repairIsActionable(invalid), true);
    assert.equal(phoneRepair("138 0000 0000").tone, "ok");
    assert.equal(phoneRepair("").tone, "idle");
  });
});

describe("repairCopy", () => {
  it("always names the miss and the fix on an error", () => {
    const short = repairCopy(phoneRepair(SHORT_PHONE), "zh");
    assert.ok(short?.includes("还差3位"));
    assert.ok(short?.includes("11"));
    const invalid = repairCopy(phoneRepair("12000000000"), "zh");
    assert.ok(invalid?.includes("1"));
    assert.equal(repairCopy(phoneRepair(""), "zh"), undefined);
  });
});

describe("repairPlacement", () => {
  it("is a banner or this column, not when the error speaks", () => {
    assert.equal(repairPlacement(false), "banner");
    assert.equal(repairPlacement(true), "field");
  });
});

describe("outcomeComplete", () => {
  it("needs both what happened and a next step", () => {
    assert.equal(outcomeComplete({ what: "", next: "" }), false);
    assert.equal(outcomeComplete({ what: "报名成功", next: "" }), false);
    assert.equal(outcomeComplete({ what: "确认邮件已发送至 sue@example.com", next: "添加到日历" }), true);
  });
});

describe("stageSnapshot", () => {
  it("fills values only; naive versus clear is the state's job", () => {
    const label = stageSnapshot("label", "naive");
    assert.equal(identityLost(false, label.typed), true);
    assert.deepEqual(stageSnapshot("label", "clear").typed, label.typed);

    const helperNaive = stageSnapshot("helper", "naive");
    const helperClear = stageSnapshot("helper", "clear");
    assert.equal(helperNaive.phone, SHORT_PHONE);
    assert.equal(helperClear.phone, SHORT_PHONE);
    assert.equal(phoneRepair(helperClear.phone).remain, 3);

    const repair = stageSnapshot("repair", "clear");
    assert.equal(repair.phone, SHORT_PHONE);
    assert.equal(repairPlacement(true), "field");

    const done = stageSnapshot("done", "clear");
    assert.equal(done.email.includes("@"), true);
  });
});
