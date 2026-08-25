import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  COLLAPSED_LINES,
  KIND_IDS,
  collapsedPx,
  coversPage,
  exclusiveOpen,
  isKindId,
  readMoreHeight,
  rowInFlow,
  toggleAccordion,
  toggleSet,
  treeSelect,
  treeToggleExpand,
  type KindId,
} from "./machines";

describe("KIND_IDS", () => {
  it("is the six in-flow leaves", () => {
    assert.deepEqual([...KIND_IDS], ["accordion", "collapse", "tree", "row", "readmore", "card"]);
  });
});

describe("isKindId", () => {
  it("accepts every shipped kind", () => {
    for (const id of KIND_IDS) assert.equal(isKindId(id), true);
  });

  it("rejects drawer and loadmore", () => {
    assert.equal(isKindId("drawer"), false);
    assert.equal(isKindId("loadmore"), false);
    assert.equal(isKindId("overlay"), false);
  });
});

describe("coversPage", () => {
  it("is false for every KIND_IDS leaf", () => {
    for (const kind of KIND_IDS as readonly KindId[]) {
      assert.equal(coversPage(kind), false);
    }
  });
});

describe("exclusiveOpen", () => {
  it("is only accordion", () => {
    assert.equal(exclusiveOpen("accordion"), true);
    for (const kind of KIND_IDS as readonly KindId[]) {
      if (kind === "accordion") continue;
      assert.equal(exclusiveOpen(kind), false);
    }
  });
});

describe("rowInFlow", () => {
  it("is only row", () => {
    assert.equal(rowInFlow("row"), true);
    for (const kind of KIND_IDS as readonly KindId[]) {
      if (kind === "row") continue;
      assert.equal(rowInFlow(kind), false);
    }
  });
});

describe("toggleAccordion", () => {
  it("opens, closes, and switches", () => {
    assert.equal(toggleAccordion(null, "a"), "a");
    assert.equal(toggleAccordion("a", "a"), null);
    assert.equal(toggleAccordion("a", "b"), "b");
  });
});

describe("toggleSet", () => {
  it("adds and removes independently", () => {
    const a = toggleSet(new Set(), "x");
    assert.equal(a.has("x"), true);
    assert.equal(a.has("y"), false);

    const b = toggleSet(a, "y");
    assert.equal(b.has("x"), true);
    assert.equal(b.has("y"), true);
    assert.equal(a.has("y"), false);

    const c = toggleSet(b, "x");
    assert.equal(c.has("x"), false);
    assert.equal(c.has("y"), true);
  });
});

describe("tree expand vs select", () => {
  it("treeSelect does not change the expanded set", () => {
    const expanded = new Set(["folder"]);
    assert.equal(treeSelect(null, "file"), "file");
    assert.equal(treeSelect("folder", "file"), "file");
    assert.deepEqual([...expanded], ["folder"]);
  });

  it("treeToggleExpand is a separate function from select", () => {
    const expanded = new Set(["folder"]);
    const next = treeToggleExpand(expanded, "file");
    assert.equal(next.has("file"), true);
    assert.equal(next.has("folder"), true);
    assert.equal(expanded.has("file"), false);
    assert.equal(treeSelect("folder", "file"), "file");
    assert.equal(expanded.has("file"), false);
  });
});

describe("readMoreHeight", () => {
  it("uses collapsed px when closed and scrollHeight when open", () => {
    assert.equal(readMoreHeight(false, 72, 200), 72);
    assert.equal(readMoreHeight(true, 72, 200), 200);
  });

  it("never returns a negative height", () => {
    assert.equal(readMoreHeight(false, -8, 200), 0);
    assert.equal(readMoreHeight(true, 72, -4), 0);
  });
});

describe("collapsedPx", () => {
  it("is lineHeight times three by default", () => {
    assert.equal(COLLAPSED_LINES, 3);
    assert.equal(collapsedPx(24), 72);
  });

  it("accepts an explicit line count", () => {
    assert.equal(collapsedPx(24, 2), 48);
  });
});
