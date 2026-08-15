import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { columnsOf, nodeAt, pickCascade, reopenDraft, type CascadeNode } from "./cascader";

const TREE: CascadeNode[] = [
  {
    id: "zj",
    children: [
      { id: "hz", children: [{ id: "xh" }, { id: "bj" }] },
      { id: "nb", children: [{ id: "hs" }] },
    ],
  },
  {
    id: "js",
    children: [{ id: "nj", children: [{ id: "xw" }] }],
  },
];

describe("pickCascade", () => {
  it("expands a parent without committing", () => {
    const first = pickCascade(TREE, [], 0, "zj");
    assert.deepEqual(first, { draft: ["zj"], committed: null, close: false });

    const second = pickCascade(TREE, first.draft, 1, "hz");
    assert.deepEqual(second, { draft: ["zj", "hz"], committed: null, close: false });
  });

  it("commits only on a leaf and asks the panel to close", () => {
    const leaf = pickCascade(TREE, ["zj", "hz"], 2, "xh");
    assert.deepEqual(leaf, {
      draft: ["zj", "hz", "xh"],
      committed: ["zj", "hz", "xh"],
      close: true,
    });
  });

  it("switching a higher level drops the old tail", () => {
    const next = pickCascade(TREE, ["zj", "hz"], 0, "js");
    assert.deepEqual(next.draft, ["js"]);
    assert.equal(next.committed, null);
    assert.equal(nodeAt(TREE, ["js", "hz"]), undefined);
  });
});

describe("columnsOf", () => {
  it("starts with the root column only", () => {
    assert.equal(columnsOf(TREE, []).length, 1);
    assert.equal(columnsOf(TREE, []).at(0)?.length, 2);
  });

  it("grows a column for each parent in the draft", () => {
    assert.equal(columnsOf(TREE, ["zj"]).length, 2);
    assert.equal(columnsOf(TREE, ["zj", "hz"]).length, 3);
    assert.equal(columnsOf(TREE, ["zj", "hz", "xh"]).length, 3);
  });
});

describe("reopenDraft", () => {
  it("restores a committed path so the columns stay on the selection", () => {
    assert.deepEqual(reopenDraft(["zj", "hz", "xh"]), ["zj", "hz", "xh"]);
    assert.deepEqual(reopenDraft(null), []);
  });
});
