import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  KIND_IDS,
  autoDismissMs,
  badgeLabel,
  hideBadge,
  interruptsTask,
  needsAction,
  persists,
  stageBadgeCount,
  stageOn,
  weight,
  type KindId,
} from "./machines";

describe("weight", () => {
  it("is weak for glance-only notices", () => {
    assert.equal(weight("badge"), "weak");
    assert.equal(weight("toast"), "weak");
  });

  it("is mid when they can miss it or come back", () => {
    assert.equal(weight("snackbar"), "mid");
    assert.equal(weight("marquee"), "mid");
    assert.equal(weight("inbox"), "mid");
  });

  it("is strong when they must see it", () => {
    assert.equal(weight("alert"), "strong");
    assert.equal(weight("banner"), "strong");
  });
});

describe("autoDismissMs", () => {
  it("dismisses toast at 2.4s and snackbar at 5s", () => {
    assert.equal(autoDismissMs("toast"), 2400);
    assert.equal(autoDismissMs("snackbar"), 5000);
  });

  it("does not auto-dismiss the other leaves", () => {
    for (const kind of KIND_IDS) {
      if (kind === "toast" || kind === "snackbar") continue;
      assert.equal(autoDismissMs(kind), 0);
    }
  });
});

describe("persists", () => {
  it("keeps inbox, alert, and banner", () => {
    assert.equal(persists("inbox"), true);
    assert.equal(persists("alert"), true);
    assert.equal(persists("banner"), true);
  });

  it("does not log the glance rungs", () => {
    assert.equal(persists("badge"), false);
    assert.equal(persists("toast"), false);
    assert.equal(persists("snackbar"), false);
    assert.equal(persists("marquee"), false);
  });
});

describe("needsAction", () => {
  it("is true only for snackbar undo and alert handle", () => {
    assert.equal(needsAction("snackbar"), true);
    assert.equal(needsAction("alert"), true);
    assert.equal(needsAction("banner"), false);
    assert.equal(needsAction("toast"), false);
  });
});

describe("hideBadge", () => {
  it("unloads at zero or below, and keeps a positive count", () => {
    assert.equal(hideBadge(0), true);
    assert.equal(hideBadge(-1), true);
    assert.equal(hideBadge(1), false);
    assert.equal(hideBadge(3), false);
  });
});

describe("badgeLabel", () => {
  it("is empty when the badge should unload", () => {
    assert.equal(badgeLabel(0), "");
    assert.equal(badgeLabel(-4), "");
  });

  it("prints the count up to 99, then 99+", () => {
    assert.equal(badgeLabel(1), "1");
    assert.equal(badgeLabel(99), "99");
    assert.equal(badgeLabel(100), "99+");
    assert.equal(badgeLabel(120), "99+");
  });
});

describe("interruptsTask", () => {
  it("is false for every leaf, including alert", () => {
    for (const kind of KIND_IDS as readonly KindId[]) {
      assert.equal(interruptsTask(kind), false);
    }
  });
});

describe("stageOn / stageBadgeCount", () => {
  it("treats off and 0 as hidden", () => {
    assert.equal(stageOn("off"), false);
    assert.equal(stageOn("0"), false);
    assert.equal(stageOn("on"), true);
    assert.equal(stageOn(""), true);
    assert.equal(stageOn("3"), true);
  });

  it("reads a badge count from the stage state", () => {
    assert.equal(stageBadgeCount("off"), 0);
    assert.equal(stageBadgeCount("on"), 3);
    assert.equal(stageBadgeCount(""), 3);
    assert.equal(stageBadgeCount("3"), 3);
    assert.equal(stageBadgeCount("120"), 120);
    assert.equal(stageBadgeCount("nope"), 3);
  });
});
