import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultChild, toggleBranch } from "./accordion";

describe("toggleBranch", () => {
  it("opens a closed parent", () => {
    assert.deepEqual(toggleBranch(["goods"], "orders"), ["goods", "orders"]);
  });

  it("closes an open parent without touching siblings", () => {
    assert.deepEqual(toggleBranch(["goods", "orders"], "goods"), ["orders"]);
  });
});

describe("defaultChild", () => {
  it("picks the first child when the parent only files", () => {
    assert.equal(
      defaultChild({ id: "goods", children: [{ id: "goods-all" }, { id: "goods-stock" }] }),
      "goods-all",
    );
  });

  it("uses the leaf itself when there are no children", () => {
    assert.equal(defaultChild({ id: "home" }), "home");
  });
});
