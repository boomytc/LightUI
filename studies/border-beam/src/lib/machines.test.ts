import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BEAM_DURATION,
  KIND_IDS,
  PARK_ANGLE,
  beamAngleCss,
  buildSnippet,
  isKindId,
  isNaive,
  isRunning,
  isStageState,
  pathOf,
  shouldAnimate,
  usesStaticStroke,
} from "./machines";

describe("pathOf", () => {
  it("maps beam to the border and fill to the face", () => {
    assert.equal(pathOf("beam"), "border");
    assert.equal(pathOf("fill"), "fill");
  });

  it("treats only fill as the naive flood", () => {
    assert.equal(isNaive("beam"), false);
    assert.equal(isNaive("fill"), true);
    assert.equal(KIND_IDS.length, 2);
  });
});

describe("shouldAnimate", () => {
  it("is false when reduced motion is on", () => {
    assert.equal(shouldAnimate(true), false);
    assert.equal(shouldAnimate(false), true);
  });

  it("run state still parks when reduced", () => {
    assert.equal(isRunning("run", false), true);
    assert.equal(isRunning("run", true), false);
    assert.equal(isRunning("park", false), false);
    assert.equal(isRunning("park", true), false);
  });

  it("reduced beam is a static stroke, not a frozen flood", () => {
    assert.equal(usesStaticStroke("beam", true), true);
    assert.equal(usesStaticStroke("beam", false), false);
    assert.equal(usesStaticStroke("fill", true), false);
    assert.equal(usesStaticStroke("fill", false), false);
  });
});

describe("ids", () => {
  it("accepts the two kinds and run|park", () => {
    assert.equal(isKindId("beam"), true);
    assert.equal(isKindId("fill"), true);
    assert.equal(isKindId("classic"), false);
    assert.equal(isStageState("run"), true);
    assert.equal(isStageState("park"), true);
    assert.equal(isStageState("open"), false);
  });
});

describe("park angle", () => {
  it("pins a degree value when parked so the arc stays on the stroke", () => {
    assert.equal(beamAngleCss(true), `${PARK_ANGLE}deg`);
    assert.equal(beamAngleCss(false), "0deg");
    assert.match(beamAngleCss(true), /deg/);
  });
});

describe("snippet", () => {
  it("spins a registered angle on a conic stacked in a transparent border", () => {
    const snippet = buildSnippet();
    assert.match(snippet, /@property\s+--beam-angle/);
    assert.match(snippet, /syntax:\s*"<angle>"/);
    assert.match(snippet, /conic-gradient/);
    assert.match(snippet, /padding-box/);
    assert.match(snippet, /border-box/);
    assert.match(snippet, /transparent/);
    assert.match(snippet, new RegExp(BEAM_DURATION.replace(".", "\\.")));
    assert.equal(snippet.includes("rainbow"), false);
    assert.equal(/hsl\(/i.test(snippet), false);
    assert.equal(/#[0-9a-f]{3,8}/i.test(snippet), false);
  });
});
