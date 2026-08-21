import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHIP_W_CLOSED,
  CHIP_W_OPEN,
  DEFAULT_GEOM,
  chipWidth,
  notchSize,
  pathStartX,
  prettyShapeCss,
  punchesChipHole,
  scoopCornerCss,
  shapeClipValue,
  svgPath,
  type Geom,
} from "./geometry";

function geom(chipW: number): Geom {
  return { ...DEFAULT_GEOM, chipW };
}

describe("notchSize", () => {
  it("drives the hole from chip size plus gap", () => {
    const closed = notchSize(geom(CHIP_W_CLOSED));
    const open = notchSize(geom(CHIP_W_OPEN));
    assert.equal(closed.nw, CHIP_W_CLOSED + DEFAULT_GEOM.gap);
    assert.equal(closed.nh, DEFAULT_GEOM.chipH + DEFAULT_GEOM.gap);
    assert.ok(open.nw > closed.nw);
    assert.equal(open.nw - closed.nw, CHIP_W_OPEN - CHIP_W_CLOSED);
  });

  it("keeps the inner scoop smaller than the hole", () => {
    const n = notchSize(geom(CHIP_W_CLOSED));
    assert.ok(n.ir < n.nw);
    assert.ok(n.ir < n.nh);
  });
});

describe("clip construction vs scoop", () => {
  it("shape() walks reverse arcs around chip variables", () => {
    const css = shapeClipValue();
    assert.match(css, /var\(--nw\)/);
    assert.match(css, /var\(--nh\)/);
    assert.match(css, /ccw/);
    assert.equal(css.includes("corner-shape"), false);
  });

  it("pretty shape CSS is the same hole, not a single-corner scoop", () => {
    const css = prettyShapeCss();
    assert.match(css, /clip-path:\s*shape/);
    assert.match(css, /var\(--chip-w\)|var\(--nw\)/);
    assert.equal(css.includes("scoop"), false);
  });

  it("svg path start moves when the chip grows", () => {
    const a = pathStartX(300, geom(CHIP_W_CLOSED));
    const b = pathStartX(300, geom(CHIP_W_OPEN));
    assert.equal(a, CHIP_W_CLOSED + DEFAULT_GEOM.gap);
    assert.ok(b > a);
    const pathA = svgPath(300, 248, geom(CHIP_W_CLOSED));
    const pathB = svgPath(300, 248, geom(CHIP_W_OPEN));
    assert.notEqual(pathA, pathB);
    assert.equal(pathA.startsWith(`M ${a} 0`), true);
    assert.equal(pathB.startsWith(`M ${b} 0`), true);
  });

  it("scoop CSS is a single corner and does not mention the chip", () => {
    const css = scoopCornerCss(18);
    assert.match(css, /corner-shape:\s*scoop/);
    assert.equal(css.includes("--nw"), false);
    assert.equal(css.includes("chip"), false);
    assert.equal(css.includes("ccw"), false);
  });

  it("only shape and path punch a chip-sized hole", () => {
    assert.equal(punchesChipHole("shape"), true);
    assert.equal(punchesChipHole("path"), true);
    assert.equal(punchesChipHole("scoop"), false);
  });

  it("chipWidth matches the two locked sizes", () => {
    assert.equal(chipWidth(false), CHIP_W_CLOSED);
    assert.equal(chipWidth(true), CHIP_W_OPEN);
  });
});
