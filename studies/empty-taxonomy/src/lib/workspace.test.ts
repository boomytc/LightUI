import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SEARCH_MISS } from "./fixtures";
import { emptyCause, snapshotOf } from "./machines";
import { causeOf, reduceWorkspace, sceneSeed } from "./workspace";

describe("sceneSeed", () => {
  it("first-use is an empty library on the customer list", () => {
    const state = sceneSeed("first-use");
    assert.equal(state.view, "customers");
    assert.equal(causeOf(state), "first-use");
  });

  it("search seeds a near-miss query against a full library", () => {
    const state = sceneSeed("search");
    assert.equal(state.query, SEARCH_MISS);
    assert.equal(causeOf(state), "search");
  });

  it("filter seeds stacked chips that match nobody", () => {
    assert.equal(causeOf(sceneSeed("filter")), "filter");
  });

  it("error seeds existing rows plus a failed refresh", () => {
    const state = sceneSeed("error");
    assert.ok(state.customers.length > 0);
    assert.equal(state.loadStatus, "error");
    assert.equal(causeOf(state), "error");
  });

  it("done seeds a cleared inbox with history still there", () => {
    const state = sceneSeed("done");
    assert.equal(state.view, "followups");
    assert.ok(state.followUps.every((item) => item.done));
    assert.equal(causeOf(state), "done");
  });
});

describe("reduceWorkspace", () => {
  it("save adds a named customer and closes the composer in one update", () => {
    const next = reduceWorkspace(
      { ...sceneSeed("first-use"), composing: true, draftName: " 林悦 " },
      { type: "save" },
    );
    assert.equal(next.customers[0]?.name, "林悦");
    assert.equal(next.composing, false);
    assert.equal(next.draftName, "");
    assert.equal(causeOf(next), "populated");
  });

  it("save with a blank name is a no-op", () => {
    const start = { ...sceneSeed("first-use"), composing: true, draftName: "   " };
    assert.equal(reduceWorkspace(start, { type: "save" }), start);
  });

  it("import fills customers and follow-ups together", () => {
    const next = reduceWorkspace(sceneSeed("first-use"), { type: "import" });
    assert.ok(next.customers.length > 0);
    assert.ok(next.followUps.length > 0);
    assert.equal(causeOf(next), "populated");
  });

  it("dropping 已成交 from the filter seed restores a match", () => {
    const next = reduceWorkspace(sceneSeed("filter"), {
      type: "removeFilter",
      id: "closed",
    });
    assert.equal(causeOf(next), "populated");
    assert.ok(snapshotOf(next).visible > 0);
  });

  it("revising the search seed query restores rows", () => {
    const next = reduceWorkspace(sceneSeed("search"), { type: "query", query: "张" });
    assert.equal(causeOf(next), "populated");
  });

  it("complete clears the last pending follow-up into done", () => {
    const seeded = sceneSeed("search");
    const pending = seeded.followUps.find((item) => !item.done);
    assert.ok(pending);
    const next = reduceWorkspace(
      { ...seeded, view: "followups" },
      { type: "complete", id: pending.id },
    );
    assert.equal(emptyCause(snapshotOf(next)), "done");
  });

  it("setView closes composer and filter menu atomically", () => {
    const next = reduceWorkspace(
      { ...sceneSeed("search"), composing: true, filterOpen: true },
      { type: "setView", view: "followups" },
    );
    assert.equal(next.view, "followups");
    assert.equal(next.composing, false);
    assert.equal(next.filterOpen, false);
  });

  it("composeFromFollowups opens the customer composer in one update", () => {
    const next = reduceWorkspace(sceneSeed("first-use"), { type: "composeFromFollowups" });
    assert.equal(next.view, "customers");
    assert.equal(next.composing, true);
    assert.equal(next.draftName, "");
  });
});
