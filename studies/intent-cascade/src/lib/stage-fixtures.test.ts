import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FILTER_TREE, findNode } from "./menu-data";
import { STAGE_FIXTURES, STAGE_IDS, stageFixture } from "./stage-fixtures";

function assertPath(path: string[]) {
  let nodes = FILTER_TREE;
  for (const id of path) {
    const node = nodes.find((n) => n.id === id);
    assert.ok(node, `missing ${id}`);
    nodes = node.children ?? [];
  }
}

describe("stage fixtures", () => {
  it("covers the four locked menu states", () => {
    assert.deepEqual(
      STAGE_FIXTURES.map((f) => f.id),
      ["status", "diagonal", "project", "third"],
    );
  });

  it("falls back to status", () => {
    assert.equal(stageFixture("nope").id, "status");
    assert.ok(STAGE_IDS.has("diagonal"));
  });

  for (const fixture of STAGE_FIXTURES) {
    it(`${fixture.id} path exists`, () => {
      assertPath(fixture.path);
      assert.ok(findNode(FILTER_TREE, fixture.hoveredId));
    });

    it(`${fixture.id} pin nodes exist`, () => {
      assert.ok(fixture.pin, `${fixture.id} must show a corridor`);
      assert.ok(findNode(FILTER_TREE, fixture.pin.parent));
      assert.ok(findNode(FILTER_TREE, fixture.pin.toward));
      if (fixture.pin.mouseOn) assert.ok(findNode(FILTER_TREE, fixture.pin.mouseOn));
    });
  }
});
