import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  KIND_IDS,
  contentAfterContainer,
  contentVisible,
  fixtureBox,
  isKindId,
  keepsIdentity,
  locksSize,
  morphAnchor,
  morphAxis,
  morphBox,
  morphMs,
  opensExtra,
  reverseBeat,
  reverseBox,
  reverseName,
  reverseOrder,
  reverseStage,
  sameNodes,
  stageState,
  type KindId,
} from "./machines";

describe("KIND_IDS", () => {
  it("is the seven leaves in table order", () => {
    const ids: readonly KindId[] = KIND_IDS;
    assert.deepEqual(ids, [
      "circle-pill",
      "pill-card",
      "compact",
      "radius",
      "size",
      "reflow",
      "reverse",
    ]);
  });
});

describe("isKindId", () => {
  it("accepts the seven leaves", () => {
    for (const id of KIND_IDS) assert.equal(isKindId(id), true);
  });

  it("rejects overlay / scale / empty slugs", () => {
    assert.equal(isKindId("drawer"), false);
    assert.equal(isKindId("scale"), false);
    assert.equal(isKindId(""), false);
  });
});

describe("morphAxis", () => {
  it("maps each kind to the axis it is allowed to change", () => {
    assert.equal(morphAxis("circle-pill"), "width");
    assert.equal(morphAxis("pill-card"), "height");
    assert.equal(morphAxis("compact"), "size");
    assert.equal(morphAxis("radius"), "radius");
    assert.equal(morphAxis("size"), "size");
    assert.equal(morphAxis("reflow"), "layout");
    assert.equal(morphAxis("reverse"), "reverse");
  });
});

describe("morphAnchor", () => {
  it("pins growth: circle-pill center, pill-card top, size top-left, radius none", () => {
    assert.equal(morphAnchor("circle-pill"), "center");
    assert.equal(morphAnchor("pill-card"), "top");
    assert.equal(morphAnchor("size"), "top-left");
    assert.equal(morphAnchor("radius"), "none");
  });

  it("pins compact top-left, reverse center, reflow none", () => {
    assert.equal(morphAnchor("compact"), "top-left");
    assert.equal(morphAnchor("reverse"), "center");
    assert.equal(morphAnchor("reflow"), "none");
  });
});

describe("locksSize", () => {
  it("is true only for radius — hierarchy, not scale", () => {
    for (const id of KIND_IDS) {
      assert.equal(locksSize(id), id === "radius");
    }
  });
});

describe("keepsIdentity", () => {
  it("is true for every leaf, including the check in the reverse dot", () => {
    for (const id of KIND_IDS) assert.equal(keepsIdentity(id), true);
  });
});

describe("reverseOrder", () => {
  it("is true only for reverse", () => {
    for (const id of KIND_IDS) {
      assert.equal(reverseOrder(id), id === "reverse");
    }
  });
});

describe("reverseBeat", () => {
  it("is content, then height, then width", () => {
    assert.equal(reverseBeat(0), "content");
    assert.equal(reverseBeat(1), "height");
    assert.equal(reverseBeat(2), "width");
  });
});

describe("reverseName / reverseStage", () => {
  it("names the three beats without a UI snapshot", () => {
    assert.equal(reverseName(0), "card");
    assert.equal(reverseName(1), "pill");
    assert.equal(reverseName(2), "dot");
    assert.equal(reverseStage("card"), 0);
    assert.equal(reverseStage("pill"), 1);
    assert.equal(reverseStage("dot"), 2);
  });
});

describe("contentAfterContainer", () => {
  it("holds body copy until the box has grown for pill-card, compact, size", () => {
    assert.equal(contentAfterContainer("pill-card"), true);
    assert.equal(contentAfterContainer("compact"), true);
    assert.equal(contentAfterContainer("size"), true);
  });

  it("is sync for radius, and content-first on reverse collapse", () => {
    assert.equal(contentAfterContainer("radius"), false);
    assert.equal(contentAfterContainer("reverse"), false);
  });
});

describe("opensExtra / sameNodes", () => {
  it("opens a 0fr track only on compact", () => {
    for (const id of KIND_IDS) assert.equal(opensExtra(id), id === "compact");
  });

  it("keeps the same nodes only on reflow", () => {
    for (const id of KIND_IDS) assert.equal(sameNodes(id), id === "reflow");
  });
});

describe("morphBox", () => {
  it("grows circle-pill on width only, radius 999 both ways", () => {
    const collapsed = morphBox("circle-pill", false);
    const expanded = morphBox("circle-pill", true);
    assert.equal(collapsed.height, expanded.height);
    assert.ok(expanded.width > collapsed.width);
    assert.equal(collapsed.radius, 999);
    assert.equal(expanded.radius, 999);
  });

  it("locks radius width and height, and changes only the corner", () => {
    const collapsed = morphBox("radius", false);
    const expanded = morphBox("radius", true);
    assert.equal(collapsed.width, expanded.width);
    assert.equal(collapsed.height, expanded.height);
    assert.notEqual(collapsed.radius, expanded.radius);
  });

  it("matches reverse expanded to the card, collapsed to the dot", () => {
    assert.deepEqual(morphBox("reverse", true), reverseBox(0));
    assert.deepEqual(morphBox("reverse", false), reverseBox(2));
  });
});

describe("reverseBox", () => {
  it("stage 0 is the card, stage 2 is a 48×48 dot", () => {
    const card = reverseBox(0);
    const dot = reverseBox(2);
    assert.ok(card.width > dot.width);
    assert.ok(card.height > dot.height);
    assert.equal(dot.width, 48);
    assert.equal(dot.height, 48);
    assert.notEqual(card.radius, 999);
    assert.equal(dot.radius, 999);
  });

  it("mid stage is a pill: height dropped, width still open", () => {
    const card = reverseBox(0);
    const pill = reverseBox(1);
    const dot = reverseBox(2);
    assert.ok(pill.height < card.height);
    assert.ok(pill.width > dot.width);
    assert.equal(pill.radius, 999);
  });
});

describe("stageState", () => {
  it("defaults non-reverse kinds to expanded", () => {
    assert.equal(stageState("circle-pill", ""), "expanded");
    assert.equal(stageState("radius", "collapsed"), "collapsed");
    assert.equal(stageState("size", "open"), "expanded");
  });

  it("maps reverse to card / pill / dot", () => {
    assert.equal(stageState("reverse", ""), "card");
    assert.equal(stageState("reverse", "pill"), "pill");
    assert.equal(stageState("reverse", "dot"), "dot");
    assert.equal(stageState("reverse", "collapsed"), "dot");
  });
});

describe("fixtureBox / contentVisible", () => {
  it("reads reverse boxes from reverseBox, others from morphBox", () => {
    assert.deepEqual(fixtureBox("reverse", "card"), reverseBox(0));
    assert.deepEqual(fixtureBox("reverse", "pill"), reverseBox(1));
    assert.deepEqual(fixtureBox("reverse", "dot"), reverseBox(2));
    assert.deepEqual(fixtureBox("circle-pill", "expanded"), morphBox("circle-pill", true));
    assert.deepEqual(fixtureBox("circle-pill", "collapsed"), morphBox("circle-pill", false));
  });

  it("hides reverse body except on the card", () => {
    assert.equal(contentVisible("reverse", "card"), true);
    assert.equal(contentVisible("reverse", "pill"), false);
    assert.equal(contentVisible("reverse", "dot"), false);
  });
});

describe("morphMs", () => {
  it("is zero when motion is reduced", () => {
    assert.equal(morphMs(true), 0);
    assert.ok(morphMs(false) > 0);
  });
});
