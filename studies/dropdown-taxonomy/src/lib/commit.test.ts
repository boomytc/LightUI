import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { closeOf, commitOf, firstKindOf, modelOf } from "./commit";

describe("commitOf", () => {
  it("names what each kind commits", () => {
    assert.equal(commitOf("select"), "value");
    assert.equal(commitOf("grouped"), "value");
    assert.equal(commitOf("multi"), "set");
    assert.equal(commitOf("cascader"), "path");
    assert.equal(commitOf("split"), "action");
    assert.equal(commitOf("mega"), "hop");
    assert.equal(commitOf("date"), "span");
  });
});

describe("closeOf", () => {
  it("keeps grouped with select, and cascader on the leaf", () => {
    assert.equal(closeOf("select"), "pick");
    assert.equal(closeOf("grouped"), "pick");
    assert.equal(closeOf("cascader"), "leaf");
    assert.equal(closeOf("multi"), "stay");
  });
});

describe("modelOf", () => {
  it("files grouped under one value, not a path", () => {
    assert.equal(modelOf("grouped").id, "value");
    assert.equal(firstKindOf("value"), "select");
    assert.equal(firstKindOf("path"), "cascader");
  });
});
