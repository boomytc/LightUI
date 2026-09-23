import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  KIND_IDS,
  STICKY_SCROLL_TOP,
  actionPlace,
  actionTone,
  bulkVisible,
  canSaveCustomer,
  chipsOf,
  clearFacets,
  columnOn,
  cycleSort,
  draftPending,
  duplicateCustomer,
  facetOfColumn,
  filterOptions,
  formatAmount,
  isKindId,
  missCause,
  parseAmount,
  prime,
  reduceDesk,
  resolveState,
  resting,
  rowMatches,
  selectionMark,
  stageDesk,
  stageScroll,
  todayStamp,
  toggleColumn,
  toggleVisible,
  visibleCustomers,
  type Customer,
  type Facets,
  type KindId,
} from "./machines";
import { SEED } from "./seed";

const NONE: Facets = { tags: [], owners: [], statuses: [] };

function row(partial: Partial<Customer> & Pick<Customer, "id" | "name">): Customer {
  return {
    tags: [],
    amount: 0,
    owner: "林悦",
    status: "待跟进",
    updatedAt: "2026-09-01",
    note: "",
    ...partial,
  };
}

describe("KIND_IDS", () => {
  it("is the seven layers, in lesson order", () => {
    const ids: readonly KindId[] = KIND_IDS;
    assert.deepEqual(ids, ["filter", "sort", "sticky", "actions", "columns", "bulk", "chips"]);
  });
});

describe("isKindId", () => {
  it("accepts the seven leaves and rejects paging or a dashboard", () => {
    assert.equal(isKindId("filter"), true);
    assert.equal(isKindId("chips"), true);
    assert.equal(isKindId("page"), false);
    assert.equal(isKindId("drill"), false);
    assert.equal(isKindId(""), false);
  });
});

describe("rowMatches", () => {
  const rows = [
    row({ id: "a", name: "青禾花艺", tags: ["重点客户", "零售"], status: "待跟进", owner: "林悦" }),
    row({ id: "b", name: "山岚咖啡", tags: ["餐饮"], status: "已联系", owner: "陈晨" }),
    row({ id: "c", name: "南风书店", tags: ["零售"], status: "已完成", owner: "陈晨" }),
  ];

  it("ORs inside a facet and ANDs across facets", () => {
    const facets: Facets = { tags: ["重点客户", "餐饮"], owners: [], statuses: ["待跟进"] };
    assert.equal(rowMatches(rows[0]!, facets, ""), true);
    assert.equal(rowMatches(rows[1]!, facets, ""), false);
    assert.equal(rowMatches(rows[2]!, facets, ""), false);
  });

  it("keeps the name query off the facet chips", () => {
    assert.equal(rowMatches(rows[0]!, NONE, "花"), true);
    assert.equal(rowMatches(rows[1]!, NONE, "花"), false);
    assert.deepEqual(chipsOf(NONE), []);
  });
});

describe("visibleCustomers", () => {
  const rows = [
    row({ id: "a", name: "甲", amount: 10 }),
    row({ id: "b", name: "乙", amount: 30 }),
    row({ id: "c", name: "丙", amount: 30 }),
    row({ id: "d", name: "丁", amount: 5 }),
  ];

  it("sorts amount without changing the count", () => {
    const desc = visibleCustomers(rows, NONE, "", "desc");
    const asc = visibleCustomers(rows, NONE, "", "asc");
    assert.equal(desc.length, rows.length);
    assert.equal(asc.length, rows.length);
    assert.deepEqual(desc.map((item) => item.id), ["b", "c", "a", "d"]);
    assert.deepEqual(asc.map((item) => item.id), ["d", "a", "b", "c"]);
  });

  it("cycles none → desc → asc → none", () => {
    assert.equal(cycleSort("none"), "desc");
    assert.equal(cycleSort("desc"), "asc");
    assert.equal(cycleSort("asc"), "none");
  });
});

describe("chips", () => {
  it("removes one value and clear leaves the query alone", () => {
    const start = resting([row({ id: "a", name: "甲" })]);
    const applied = reduceDesk(start, { type: "openFacet", facet: "statuses" });
    const drafted = reduceDesk(applied, { type: "toggleDraft", value: "待跟进" });
    const on = reduceDesk(drafted, { type: "applyDraft" });
    const queried = reduceDesk(on, { type: "query", query: "甲" });
    assert.equal(chipsOf(queried.facets).length, 1);
    const cleared = reduceDesk(queried, { type: "clearFacets" });
    assert.equal(cleared.query, "甲");
    assert.deepEqual(cleared.facets, clearFacets());
    assert.equal(cleared.rows.length, 1);
  });

  it("does not apply a facet draft until apply", () => {
    const start = resting(SEED);
    const open = reduceDesk(start, { type: "openFacet", facet: "tags" });
    const drafted = reduceDesk(open, { type: "toggleDraft", value: "重点客户" });
    assert.equal(draftPending(drafted), true);
    assert.equal(visibleCustomers(drafted.rows, drafted.facets, drafted.query, drafted.sort).length, SEED.length);
    const applied = reduceDesk(drafted, { type: "applyDraft" });
    assert.ok(applied.rows.length === SEED.length);
    assert.ok(visibleCustomers(applied.rows, applied.facets, "", "none").length < SEED.length);
  });
});

describe("columns", () => {
  it("refuses to hide the name column", () => {
    const hidden = toggleColumn({ ...resting().visibility, name: true }, "name");
    assert.equal(columnOn(hidden, "name"), true);
    assert.equal(columnOn(toggleColumn(hidden, "updatedAt"), "updatedAt"), true);
    assert.equal(columnOn({ ...hidden, name: false }, "name"), true);
  });
});

describe("bulk", () => {
  it("shows the bar only after a selection, and select-all stays on the visible rows", () => {
    assert.equal(bulkVisible(0), false);
    assert.equal(bulkVisible(2), true);
    const visible = ["a", "b"];
    assert.equal(selectionMark([], visible), "none");
    assert.equal(selectionMark(["a"], visible), "some");
    assert.equal(selectionMark(["a", "b", "hidden"], visible), "all");
    assert.deepEqual(toggleVisible(["hidden"], visible, true), ["hidden", "a", "b"]);
    const start = resting(SEED);
    const filtered = reduceDesk(
      reduceDesk(
        reduceDesk(start, { type: "openFacet", facet: "statuses" }),
        { type: "toggleDraft", value: "已完成" },
      ),
      { type: "applyDraft" },
    );
    const all = reduceDesk(filtered, { type: "toggleAllVisible" });
    const visibleIds = visibleCustomers(all.rows, all.facets, "", "none").map((item) => item.id);
    assert.deepEqual(all.selected, visibleIds);
    assert.ok(!all.selected.includes("c1"));
    assert.equal(all.rows.length, SEED.length);
  });

  it("drops rows from the selection once a bulk edit leaves the filter", () => {
    const filtered = reduceDesk(
      reduceDesk(
        reduceDesk(resting(SEED), { type: "openFacet", facet: "statuses" }),
        { type: "toggleDraft", value: "待跟进" },
      ),
      { type: "applyDraft" },
    );
    const picked = visibleCustomers(filtered.rows, filtered.facets, "", "none")
      .slice(0, 2)
      .map((row) => row.id);
    const selected = { ...filtered, selected: picked };
    const next = reduceDesk(selected, {
      type: "bulkStatus",
      status: "已完成",
      updatedAt: "2026-09-23",
    });
    assert.deepEqual(next.selected, []);
    for (const id of picked) {
      assert.equal(next.rows.find((row) => row.id === id)?.status, "已完成");
    }
    assert.equal(next.rows.length, SEED.length);
    assert.ok(visibleCustomers(next.rows, next.facets, "", "none").every((row) => row.status === "待跟进"));
  });

  it("drops a saved row from the selection when the name leaves the query", () => {
    const queried = { ...reduceDesk(resting(SEED), { type: "query", query: "青禾" }), selected: ["c1"] };
    const row = queried.rows.find((item) => item.id === "c1");
    assert.ok(row);
    const next = reduceDesk(queried, {
      type: "save",
      customer: { ...row, name: "南风书店分号" },
    });
    assert.deepEqual(next.selected, []);
    assert.equal(next.rows.find((item) => item.id === "c1")?.name, "南风书店分号");
  });
});

describe("facetOfColumn", () => {
  it("maps owner and status onto the plural facets", () => {
    assert.equal(facetOfColumn("tags"), "tags");
    assert.equal(facetOfColumn("owner"), "owners");
    assert.equal(facetOfColumn("status"), "statuses");
    assert.equal(facetOfColumn("name"), null);
    assert.equal(facetOfColumn("amount"), null);
    assert.equal(facetOfColumn("updatedAt"), null);
  });
});

describe("row actions", () => {
  it("keeps view on the row and delete in the overflow", () => {
    assert.equal(actionPlace("view"), "primary");
    assert.equal(actionPlace("edit"), "overflow");
    assert.equal(actionPlace("duplicate"), "overflow");
    assert.equal(actionPlace("delete"), "overflow");
    assert.equal(actionTone("delete"), "danger");
    assert.equal(actionTone("edit"), "default");
  });

  it("copies the row to the front as 待跟进", () => {
    const src = SEED.find((item) => item.id === "c5")!;
    const copy = duplicateCustomer(src, "copy", "2026-09-22");
    assert.equal(copy.name, "南风书店（副本）");
    assert.equal(copy.status, "待跟进");
    assert.equal(copy.amount, src.amount);
    assert.notEqual(copy.tags, src.tags);
    const next = reduceDesk(resting(), {
      type: "duplicate",
      id: "c5",
      nextId: "copy",
      updatedAt: "2026-09-22",
    });
    assert.equal(next.rows[0]?.id, "copy");
    assert.equal(next.rows.length, SEED.length + 1);
    assert.equal(SEED.length, 16);
  });
});

describe("stageDesk", () => {
  it("locks one complete state per leaf", () => {
    const filter = stageDesk("filter", "open");
    assert.deepEqual(filter.draft, ["重点客户"]);
    assert.equal(filter.facets.tags.length, 0);
    assert.equal(stageDesk("sort", "desc").sort, "desc");
    assert.equal(stageDesk("sort", "").sort, "desc");
    assert.equal(stageDesk("actions", "open").panel.type, "row");
    assert.equal(stageDesk("columns", "open").panel.type, "columns");
    assert.equal(columnOn(stageDesk("columns", "open").visibility, "updatedAt"), false);
    assert.deepEqual(stageDesk("bulk", "selected").selected, ["c1", "c3"]);
    assert.equal(chipsOf(stageDesk("chips", "applied").facets).length, 2);
    assert.equal(stageScroll("sticky", "scrolled").top, STICKY_SCROLL_TOP);
    assert.equal(stageScroll("filter", "open").top, 0);
    assert.equal(resolveState("bulk", "nope"), "selected");
  });
});

describe("prime", () => {
  it("opens the leaf without dropping records", () => {
    const base = resting();
    const filter = prime("filter", base);
    assert.equal(filter.panel.type, "facet");
    assert.equal(filter.rows.length, 16);
    const sorted = prime("sort", base);
    assert.equal(sorted.sort, "desc");
    assert.equal(visibleCustomers(sorted.rows, sorted.facets, "", sorted.sort).length, 16);
    const bulk = prime("bulk", base);
    assert.equal(bulk.selected.length, 2);
    assert.equal(bulkVisible(bulk.selected.length), true);
    const chips = prime("chips", base);
    assert.deepEqual(chips.facets.tags, ["重点客户"]);
    const again = prime("chips", chips);
    assert.deepEqual(again.facets.tags, ["重点客户"]);
  });

  it("keeps the filter, query, and selection when opening sticky", () => {
    const filtered = reduceDesk(
      reduceDesk(
        reduceDesk(resting(SEED), { type: "openFacet", facet: "tags" }),
        { type: "toggleDraft", value: "重点客户" },
      ),
      { type: "applyDraft" },
    );
    const viewing = { ...filtered, query: "花", selected: ["c1"] };
    const next = prime("sticky", viewing);
    assert.deepEqual(next.facets.tags, ["重点客户"]);
    assert.equal(next.query, "花");
    assert.deepEqual(next.selected, ["c1"]);
    assert.equal(next.rows.length, SEED.length);
  });
});

describe("missCause", () => {
  it("names a filtered zero apart from first use and a name miss", () => {
    assert.equal(missCause(16, 0, { ...NONE, tags: ["住宿"] }, ""), "facets");
    assert.equal(missCause(16, 0, NONE, "没有这个名字"), "query");
    assert.equal(missCause(16, 0, { ...NONE, statuses: ["已完成"] }, "没有"), "both");
    assert.equal(missCause(0, 0, NONE, ""), "first-use");
    assert.equal(missCause(16, 4, NONE, ""), "none");
  });
});

describe("save", () => {
  it("requires a name and a whole-yuan amount", () => {
    assert.equal(canSaveCustomer("  ", "10"), false);
    assert.equal(canSaveCustomer("青禾", "12.5"), false);
    assert.equal(canSaveCustomer("青禾", "0"), true);
    assert.equal(parseAmount("12800"), 12800);
    assert.equal(formatAmount(12800), "12,800");
    assert.equal(todayStamp(new Date(2026, 8, 22)), "2026-09-22");
  });

  it("filters a long tag list by the typed query", () => {
    assert.deepEqual(filterOptions(["零售", "餐饮"], "餐", (value) => value), ["餐饮"]);
    assert.deepEqual(filterOptions(["零售"], "retail", () => "Retail"), ["零售"]);
  });
});
