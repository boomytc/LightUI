import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SAMPLE_CUSTOMERS, SAMPLE_FOLLOWUPS, SEARCH_MISS } from "./fixtures";
import {
  KIND_IDS,
  customerMatchesFilters,
  customerMatchesQuery,
  defaultStageState,
  emptyAction,
  emptyCause,
  isKindId,
  isTrulyEmpty,
  keepsExistingList,
  showsPrimaryCta,
  snapshotOf,
  stageState,
  visibleCustomers,
  type KindId,
} from "./machines";

describe("KIND_IDS", () => {
  it("is the five empty causes", () => {
    const ids: readonly KindId[] = KIND_IDS;
    assert.deepEqual(ids, ["first-use", "search", "filter", "error", "done"]);
  });
});

describe("isKindId", () => {
  it("accepts the leaves and rejects occupancy / notice slugs", () => {
    assert.equal(isKindId("first-use"), true);
    assert.equal(isKindId("search"), true);
    assert.equal(isKindId("empty"), false);
    assert.equal(isKindId("skeleton"), false);
    assert.equal(isKindId("toast"), false);
    assert.equal(isKindId(""), false);
  });
});

describe("matching", () => {
  it("treats 张晓 as a miss against 张小雨 / 张小宁", () => {
    const hits = SAMPLE_CUSTOMERS.filter((c) => customerMatchesQuery(c, SEARCH_MISS));
    assert.equal(hits.length, 0);
    assert.ok(customerMatchesQuery(SAMPLE_CUSTOMERS[3]!, "张"));
    assert.ok(customerMatchesQuery(SAMPLE_CUSTOMERS[3]!, "13900001111"));
  });

  it("requires every filter — 上海 + 本周 + 已成交 matches nobody", () => {
    const stacked = visibleCustomers(SAMPLE_CUSTOMERS, "", [
      "shanghai",
      "this-week",
      "closed",
    ]);
    assert.equal(stacked.length, 0);
    assert.equal(
      customerMatchesFilters(SAMPLE_CUSTOMERS[0]!, ["shanghai", "this-week"]),
      true,
    );
    assert.equal(
      customerMatchesFilters(SAMPLE_CUSTOMERS[0]!, ["shanghai", "this-week", "closed"]),
      false,
    );
  });
});

describe("emptyCause", () => {
  it("names first-use when the library has never started", () => {
    assert.equal(
      emptyCause(
        snapshotOf({
          view: "customers",
          customers: [],
          followUps: [],
          query: "",
          filters: [],
          loadStatus: "idle",
        }),
      ),
      "first-use",
    );
  });

  it("names search before filter when both a query and chips miss", () => {
    assert.equal(
      emptyCause(
        snapshotOf({
          view: "customers",
          customers: SAMPLE_CUSTOMERS,
          followUps: SAMPLE_FOLLOWUPS,
          query: SEARCH_MISS,
          filters: ["shanghai"],
          loadStatus: "idle",
        }),
      ),
      "search",
    );
  });

  it("names filter only when the query is empty and chips miss", () => {
    assert.equal(
      emptyCause(
        snapshotOf({
          view: "customers",
          customers: SAMPLE_CUSTOMERS,
          followUps: SAMPLE_FOLLOWUPS,
          query: "",
          filters: ["shanghai", "this-week", "closed"],
          loadStatus: "idle",
        }),
      ),
      "filter",
    );
  });

  it("names error even at 0 rows — a first-load failure is not first-use", () => {
    assert.equal(
      emptyCause(
        snapshotOf({
          view: "customers",
          customers: [],
          followUps: [],
          query: "",
          filters: [],
          loadStatus: "error",
        }),
      ),
      "error",
    );
  });

  it("names error even when rows exist — a hung refresh is not empty", () => {
    assert.equal(
      emptyCause(
        snapshotOf({
          view: "customers",
          customers: SAMPLE_CUSTOMERS,
          followUps: SAMPLE_FOLLOWUPS,
          query: "",
          filters: [],
          loadStatus: "error",
        }),
      ),
      "error",
    );
  });

  it("names done only when the inbox is clear and history remains", () => {
    assert.equal(
      emptyCause(
        snapshotOf({
          view: "followups",
          customers: SAMPLE_CUSTOMERS,
          followUps: SAMPLE_FOLLOWUPS.map((item) => ({ ...item, done: true })),
          query: "",
          filters: [],
          loadStatus: "idle",
        }),
      ),
      "done",
    );
    assert.equal(
      emptyCause(
        snapshotOf({
          view: "followups",
          customers: [],
          followUps: [],
          query: "",
          filters: [],
          loadStatus: "idle",
        }),
      ),
      "first-use",
    );
  });
});

describe("emptyAction / flags", () => {
  it("gives a primary create only to first-use", () => {
    assert.equal(emptyAction("first-use"), "create");
    assert.equal(showsPrimaryCta("first-use"), true);
    assert.equal(showsPrimaryCta("search"), false);
    assert.equal(showsPrimaryCta("filter"), false);
    assert.equal(showsPrimaryCta("error"), false);
    assert.equal(showsPrimaryCta("done"), false);
  });

  it("keeps the last list on error, and treats error as not truly empty", () => {
    assert.equal(emptyAction("error"), "retry");
    assert.equal(keepsExistingList("error"), true);
    assert.equal(isTrulyEmpty("error"), false);
    assert.equal(keepsExistingList("first-use"), false);
  });

  it("maps search to revise-query, filter to loosen-filter, done to celebrate", () => {
    assert.equal(emptyAction("search"), "revise-query");
    assert.equal(emptyAction("filter"), "loosen-filter");
    assert.equal(emptyAction("done"), "celebrate");
    assert.equal(isTrulyEmpty("search"), true);
    assert.equal(isTrulyEmpty("done"), true);
  });
});

describe("stageState", () => {
  it("locks each kind to its diagnostic empty presentation", () => {
    assert.equal(defaultStageState("first-use"), "empty");
    assert.equal(defaultStageState("search"), "miss");
    assert.equal(defaultStageState("filter"), "miss");
    assert.equal(defaultStageState("error"), "banner");
    assert.equal(defaultStageState("done"), "clear");
    assert.equal(stageState("", "search"), "miss");
    assert.equal(stageState("open", "error"), "banner");
    assert.equal(stageState("empty", "done"), "clear");
  });
});
