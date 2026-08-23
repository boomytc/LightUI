import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  accordionWeights,
  angleToIndex,
  clampIndex,
  coverflowHidden,
  defaultAutoplay,
  dotsIndex,
  fadeUsesOpacityOnly,
  isRotateNotSlide,
  KIND_IDS,
  parallaxOffset,
  reducedAdvance,
  shouldAutoplay,
  shortestOffset,
  SLIDE_COUNT,
  spinAngle,
  stackLayer,
  stageIndex,
  stepIndex,
  transitionProps,
  wrapIndex,
} from "./machines";

describe("stepIndex", () => {
  it("wraps by default so classic can loop", () => {
    assert.equal(stepIndex(0, 1, 4), 1);
    assert.equal(stepIndex(3, 1, 4), 0);
    assert.equal(stepIndex(0, -1, 4), 3);
  });

  it("clamps when asked to stop at the ends", () => {
    assert.equal(stepIndex(0, -1, 4, "clamp"), 0);
    assert.equal(stepIndex(3, 1, 4, "clamp"), 3);
    assert.equal(stepIndex(1, 1, 4, "clamp"), 2);
  });

  it("returns 0 for an empty set", () => {
    assert.equal(stepIndex(2, 1, 0), 0);
    assert.equal(wrapIndex(5, 0), 0);
    assert.equal(clampIndex(-2, 0), 0);
  });
});

describe("shouldAutoplay", () => {
  it("runs only when not hovering and motion is allowed", () => {
    assert.equal(shouldAutoplay(false, false), true);
    assert.equal(shouldAutoplay(true, false), false);
    assert.equal(shouldAutoplay(false, true), false);
    assert.equal(shouldAutoplay(true, true), false);
  });
});

describe("defaultAutoplay", () => {
  it("is on for track-like cuts, off for peel / turn / spin / accordion", () => {
    assert.equal(defaultAutoplay("classic"), true);
    assert.equal(defaultAutoplay("fade"), true);
    assert.equal(defaultAutoplay("coverflow"), true);
    assert.equal(defaultAutoplay("parallax"), true);
    assert.equal(defaultAutoplay("stack"), false);
    assert.equal(defaultAutoplay("flip"), false);
    assert.equal(defaultAutoplay("accordion"), false);
    assert.equal(defaultAutoplay("spin"), false);
  });
});

describe("fadeUsesOpacityOnly", () => {
  it("is the fade contract: opacity, no layout jump", () => {
    assert.equal(fadeUsesOpacityOnly(), true);
    assert.deepEqual(transitionProps("fade"), { property: "opacity", opacityOnly: true });
  });
});

describe("transitionProps", () => {
  it("keeps classic / coverflow / stack / flip / spin / parallax on transform", () => {
    for (const id of ["classic", "coverflow", "stack", "flip", "spin", "parallax"] as const) {
      assert.deepEqual(transitionProps(id), { property: "transform", opacityOnly: false });
    }
  });

  it("lets accordion retune columns", () => {
    assert.deepEqual(transitionProps("accordion"), {
      property: "grid-template-columns",
      opacityOnly: false,
    });
  });
});

describe("isRotateNotSlide", () => {
  it("is only spin — a product turn, not a slide list", () => {
    assert.equal(isRotateNotSlide("spin"), true);
    for (const id of KIND_IDS) {
      if (id === "spin") continue;
      assert.equal(isRotateNotSlide(id), false);
    }
  });
});

describe("reducedAdvance", () => {
  it("keeps fade on opacity and jumps every other cut", () => {
    assert.equal(reducedAdvance("fade", true), "fade");
    assert.equal(reducedAdvance("classic", true), "jump");
    assert.equal(reducedAdvance("coverflow", true), "jump");
    assert.equal(reducedAdvance("classic", false), "tween");
    assert.equal(reducedAdvance("fade", false), "tween");
  });
});

describe("dotsIndex", () => {
  it("stays in range so dots sync the current frame", () => {
    assert.equal(dotsIndex(1, 4), 1);
    assert.equal(dotsIndex(4, 4), 0);
    assert.equal(dotsIndex(-1, 4), 3);
  });
});

describe("stageIndex", () => {
  it("defaults to 1 so a non-first slide is visible", () => {
    assert.equal(stageIndex(""), 1);
    assert.equal(stageIndex("0"), 0);
    assert.equal(stageIndex("2"), 2);
    assert.equal(stageIndex("9"), SLIDE_COUNT - 1);
    assert.equal(stageIndex("nope"), 1);
  });
});

describe("coverflow offset", () => {
  it("wraps the shortest way so side cards stay in view", () => {
    assert.equal(shortestOffset(0, 0, 4), 0);
    assert.equal(shortestOffset(1, 0, 4), 1);
    assert.equal(shortestOffset(3, 0, 4), -1);
    assert.equal(coverflowHidden(0), false);
    assert.equal(coverflowHidden(1), false);
    assert.equal(coverflowHidden(2), true);
  });
});

describe("stackLayer", () => {
  it("peels only the top card; cards below sit back", () => {
    assert.deepEqual(stackLayer(0), { y: 0, rotate: 0, scale: 1 });
    assert.ok(stackLayer(1).scale < 1);
    assert.ok(stackLayer(2).y > stackLayer(1).y);
  });
});

describe("accordionWeights", () => {
  it("expands one column and shrinks the rest", () => {
    assert.deepEqual(accordionWeights(0, 4), [4, 1, 1, 1]);
    assert.deepEqual(accordionWeights(2, 4), [1, 1, 4, 1]);
  });
});

describe("spinAngle", () => {
  it("maps index onto 90° faces", () => {
    assert.equal(spinAngle(0), 0);
    assert.equal(spinAngle(1), 90);
    assert.equal(spinAngle(2), 180);
    assert.equal(angleToIndex(90), 1);
    assert.equal(angleToIndex(350), 0);
  });
});

describe("parallaxOffset", () => {
  it("moves layers at 0.3 / 0.7 / 1.0", () => {
    assert.equal(parallaxOffset(1, 0.3, 100), -30);
    assert.equal(parallaxOffset(1, 0.7, 100), -70);
    assert.equal(parallaxOffset(1, 1, 100), -100);
  });
});
