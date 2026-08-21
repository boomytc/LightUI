import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  GRADIENT_SIZE,
  PER_CHAR_DEFAULT,
  PER_CHAR_FAST,
  PER_CHAR_SLOW,
  SPREAD_UNIT,
  bandStops,
  buildSnippet,
  durationSeconds,
  paceFromSecondsPerChar,
  secondsPerCharFromPace,
  spreadCh,
  spreadOffsetCss,
} from "./shimmer";

describe("durationSeconds", () => {
  it("scales with character count times seconds per character", () => {
    assert.equal(durationSeconds(10, 0.12), 1.2);
    assert.equal(durationSeconds(24, 0.12), durationSeconds(12, 0.12) * 2);
    assert.equal(durationSeconds(1, 0.2), 0.2);
  });

  it("treats empty copy as one character", () => {
    assert.equal(durationSeconds(0, 0.12), durationSeconds(1, 0.12));
  });
});

describe("secondsPerCharFromPace", () => {
  it("maps slider right to fewer seconds per character", () => {
    assert.equal(secondsPerCharFromPace(0), PER_CHAR_SLOW);
    assert.equal(secondsPerCharFromPace(1), PER_CHAR_FAST);
    assert.ok(secondsPerCharFromPace(1) < secondsPerCharFromPace(0));
    assert.ok(durationSeconds(10, secondsPerCharFromPace(1)) < durationSeconds(10, secondsPerCharFromPace(0)));
  });

  it("round-trips the default seconds-per-character", () => {
    const pace = paceFromSecondsPerChar(PER_CHAR_DEFAULT);
    assert.ok(Math.abs(secondsPerCharFromPace(pace) - PER_CHAR_DEFAULT) < 1e-9);
    assert.ok(pace > 0 && pace < 1);
  });
});

describe("spread in ch", () => {
  it("expresses half-width in ch so the band tracks type size", () => {
    assert.equal(SPREAD_UNIT, "ch");
    assert.equal(spreadCh(3), "1.5ch");
    assert.equal(spreadCh(4), "2ch");
    assert.match(spreadOffsetCss(3), /0\.5ch|0\.5\*ch|0\.5ch/);
    assert.match(spreadOffsetCss(3), /ch/);
    assert.equal(spreadOffsetCss(3).includes("px"), false);
  });
});

describe("band", () => {
  it("uses a 300% gradient so the highlight can sit fully off-canvas", () => {
    assert.equal(GRADIENT_SIZE, "300% 100%");
    const snippet = buildSnippet({ style: "classic", spread: 3, angle: 295, secondsPerChar: 0.12 });
    assert.match(snippet, /300%\s*100%/);
    assert.match(snippet, /background-clip:\s*text/);
    assert.match(snippet, /calc\(var\(--len\) \* var\(--per-char\)\)/);
    assert.match(snippet, /0\.5ch/);
    assert.equal(snippet.includes("--speed"), false);
  });

  it("classic band is a single highlight, not a box fill", () => {
    const stops = bandStops("classic");
    assert.match(stops, /50%/);
    assert.equal(stops.includes("canvas"), false);
  });
});
