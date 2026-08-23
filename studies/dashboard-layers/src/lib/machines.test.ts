import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  KIND_IDS,
  canExpand,
  layerOf,
  selectionForStage,
  showsAll,
  showsChart,
  showsDetail,
  showsDimTable,
  stageState,
  type KindId,
  type Selection,
} from "./machines";

const none: Selection = { kpi: null, dim: null };
const kpiOnly: Selection = { kpi: "dau", dim: null };
const drilled: Selection = { kpi: "dau", dim: "feed" };

describe("layerOf", () => {
  it("starts at kpi until a result is chosen", () => {
    assert.equal(layerOf("layered", none), "kpi");
  });

  it("opens dim after a kpi is chosen", () => {
    assert.equal(layerOf("layered", kpiOnly), "dim");
  });

  it("opens detail after a dim row is chosen", () => {
    assert.equal(layerOf("layered", drilled), "detail");
  });

  it("serves the last layer on a platter even with empty selection", () => {
    assert.equal(layerOf("platter", none), "detail");
    assert.equal(layerOf("platter", kpiOnly), "detail");
    assert.equal(layerOf("platter", drilled), "detail");
  });
});

describe("showsAll", () => {
  it("is true only for platter", () => {
    assert.equal(showsAll("platter"), true);
    assert.equal(showsAll("layered"), false);
  });
});

describe("canExpand", () => {
  it("is true only for layered", () => {
    assert.equal(canExpand("layered"), true);
    assert.equal(canExpand("platter"), false);
  });
});

describe("visibility", () => {
  it("keeps the mini chart on the platter only", () => {
    assert.equal(showsChart("platter"), true);
    assert.equal(showsChart("layered"), false);
  });

  it("hides the dim table until a layered kpi is chosen", () => {
    assert.equal(showsDimTable("layered", none), false);
    assert.equal(showsDimTable("layered", kpiOnly), true);
    assert.equal(showsDimTable("layered", drilled), true);
    assert.equal(showsDimTable("platter", none), true);
  });

  it("shows short detail only after a layered row click", () => {
    assert.equal(showsDetail("layered", none), false);
    assert.equal(showsDetail("layered", kpiOnly), false);
    assert.equal(showsDetail("layered", drilled), true);
    assert.equal(showsDetail("platter", drilled), false);
  });
});

describe("stageState", () => {
  it("defaults layered to dim so a drill is visible", () => {
    assert.equal(stageState("", "layered"), "dim");
    assert.equal(stageState("kpi"), "kpi");
    assert.equal(stageState("all"), "all");
  });

  it("defaults platter to all", () => {
    assert.equal(stageState("", "platter"), "all");
  });
});

describe("selectionForStage", () => {
  it("maps kpi / dim / all onto a selection", () => {
    assert.deepEqual(selectionForStage("kpi", "dau", "feed"), none);
    assert.deepEqual(selectionForStage("dim", "dau", "feed"), kpiOnly);
    assert.deepEqual(selectionForStage("all", "dau", "feed"), drilled);
  });
});

describe("KIND_IDS", () => {
  it("is the two leaves", () => {
    const ids: readonly KindId[] = KIND_IDS;
    assert.deepEqual(ids, ["layered", "platter"]);
  });
});
