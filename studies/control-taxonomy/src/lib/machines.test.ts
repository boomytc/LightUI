import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  answersFor,
  chooseControl,
  filterMembers,
  isCapped,
  nextStep,
  toggleCapped,
  withCardinality,
  withDemand,
  withFind,
  withLength,
} from "./machines";

const MEMBERS = [
  { id: "sue", name: "Sue", email: "sue@studio.co" },
  { id: "susan", name: "Susan", email: "susan@example.com" },
  { id: "lin", name: "Lin Xiao", email: "linxiao@example.com" },
];

describe("nextStep", () => {
  it("starts by asking fill vs pick", () => {
    assert.equal(nextStep({}), "demand");
  });

  it("asks length only after fill, then lands", () => {
    assert.equal(nextStep(withDemand("fill")), "length");
    assert.equal(nextStep(withLength("short")), "result");
    assert.equal(nextStep(withLength("long")), "result");
  });

  it("asks cardinality after pick, and find only when it is one", () => {
    assert.equal(nextStep(withDemand("choose")), "cardinality");
    assert.equal(nextStep(withCardinality("many")), "result");
    assert.equal(nextStep(withCardinality("one")), "find");
    assert.equal(nextStep(withFind("scan")), "result");
  });
});

describe("chooseControl", () => {
  it("returns null until the tree is complete", () => {
    assert.equal(chooseControl({}), null);
    assert.equal(chooseControl(withDemand("fill")), null);
    assert.equal(chooseControl(withCardinality("one")), null);
  });

  it("splits fill by length", () => {
    assert.equal(chooseControl(withLength("short")), "text-field");
    assert.equal(chooseControl(withLength("long")), "textarea");
  });

  it("sends many to checkbox and ignores find", () => {
    assert.equal(chooseControl({ demand: "choose", cardinality: "many", find: "search" }), "checkbox");
  });

  it("splits a single pick by how you find it", () => {
    assert.equal(chooseControl(withFind("compare")), "radio");
    assert.equal(chooseControl(withFind("scan")), "select");
    assert.equal(chooseControl(withFind("search")), "combobox");
  });

  it("round-trips each leaf through answersFor", () => {
    for (const id of ["text-field", "textarea", "select", "combobox", "radio", "checkbox"] as const) {
      assert.equal(chooseControl(answersFor(id)), id);
    }
  });
});

describe("filterMembers", () => {
  it("returns everyone when the query is empty", () => {
    assert.equal(filterMembers(MEMBERS, "  ").length, 3);
  });

  it("matches name or email, case-insensitive", () => {
    assert.deepEqual(
      filterMembers(MEMBERS, "SU").map((m) => m.id),
      ["sue", "susan"],
    );
    assert.deepEqual(
      filterMembers(MEMBERS, "linxiao").map((m) => m.id),
      ["lin"],
    );
  });

  it("returns an empty list when nothing matches", () => {
    assert.deepEqual(filterMembers(MEMBERS, "zzz"), []);
  });
});

describe("toggleCapped", () => {
  it("adds until the cap, then peels one off", () => {
    const one = toggleCapped([], "design", 3);
    const two = toggleCapped(one, "write", 3);
    const three = toggleCapped(two, "code", 3);
    const blocked = toggleCapped(three, "focus", 3);
    assert.deepEqual(one, ["design"]);
    assert.deepEqual(three, ["design", "write", "code"]);
    assert.deepEqual(blocked, ["design", "write", "code"]);
    assert.deepEqual(toggleCapped(three, "write", 3), ["design", "code"]);
  });

  it("locks only the items that are not already on", () => {
    const atCap = ["a", "b", "c"];
    assert.equal(isCapped(atCap, "d", 3), true);
    assert.equal(isCapped(atCap, "a", 3), false);
  });
});
