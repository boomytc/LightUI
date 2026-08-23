import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  KIND_IDS,
  STEP_COUNT,
  clampStep,
  isKindId,
  isStepped,
  needsRole,
  paneCount,
  parseStepState,
  type KindId,
} from "./machines";

const ONE_PANE: KindId[] = ["centered", "immersive", "roles", "steps"];

describe("isKindId", () => {
  it("accepts the five stagings", () => {
    assert.deepEqual([...KIND_IDS], ["centered", "split", "immersive", "roles", "steps"]);
    for (const id of KIND_IDS) {
      assert.equal(isKindId(id), true);
    }
  });

  it("rejects unknown slugs", () => {
    assert.equal(isKindId("hero"), false);
    assert.equal(isKindId("layout"), false);
    assert.equal(isKindId(""), false);
  });
});

describe("paneCount", () => {
  it("is 2 only for the brand / form split", () => {
    assert.equal(paneCount("split"), 2);
    for (const id of ONE_PANE) {
      assert.equal(paneCount(id), 1);
    }
  });
});

describe("isStepped", () => {
  it("is true only for steps", () => {
    assert.equal(isStepped("steps"), true);
    for (const id of KIND_IDS) {
      if (id === "steps") continue;
      assert.equal(isStepped(id), false);
    }
  });
});

describe("needsRole", () => {
  it("is true only for the role gate", () => {
    assert.equal(needsRole("roles"), true);
    for (const id of KIND_IDS) {
      if (id === "roles") continue;
      assert.equal(needsRole(id), false);
    }
  });
});

describe("clampStep", () => {
  it("locks the teaching flow to two screens", () => {
    assert.equal(STEP_COUNT, 2);
    assert.equal(clampStep(1), 1);
    assert.equal(clampStep(2), 2);
    assert.equal(clampStep(0), 1);
    assert.equal(clampStep(9), 2);
    assert.equal(clampStep(Number.NaN), 1);
  });
});

describe("parseStepState", () => {
  it("reads 2; default and 1 stay on the email screen", () => {
    assert.equal(parseStepState("2"), 2);
    assert.equal(parseStepState("1"), 1);
    assert.equal(parseStepState("default"), 1);
    assert.equal(parseStepState(""), 1);
    assert.equal(parseStepState(" 2 "), 2);
  });
});
