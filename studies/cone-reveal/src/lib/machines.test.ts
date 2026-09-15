import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_BEAM_WIDTH,
  IN_CONE,
  NEAR_DIST,
  PARK_ANGLE,
  angleTo,
  beamHalfAngle,
  coneCoverage,
  fieldAim,
  peekAim,
  inCone,
  lerpAngle,
  nearestIndex,
  revealGlyphs,
  searchAngle,
  shortestAngle,
  sameReveal,
  toggleReveal,
} from "./machines.js";

const origin = { x: 0, y: 0 };

describe("cone-reveal machines", () => {
  describe("angles", () => {
    it("wraps shortestAngle across ±π", () => {
      assert.ok(Math.abs(shortestAngle(Math.PI - 0.1, -Math.PI + 0.1) - 0.2) < 1e-9);
      assert.ok(Math.abs(shortestAngle(-Math.PI + 0.1, Math.PI - 0.1) + 0.2) < 1e-9);
    });

    it("lerpAngle takes the short arc", () => {
      const mid = lerpAngle(Math.PI - 0.2, -Math.PI + 0.2, 0.5);
      assert.ok(Math.abs(Math.abs(mid) - Math.PI) < 1e-9);
    });

    it("angleTo is atan2 of the offset", () => {
      assert.equal(angleTo(origin, { x: 10, y: 0 }), 0);
      assert.ok(Math.abs(angleTo(origin, { x: 0, y: 10 }) - Math.PI / 2) < 1e-9);
      assert.ok(Math.abs(angleTo(origin, { x: -10, y: 0 }) - Math.PI) < 1e-9);
    });
  });

  describe("beamHalfAngle", () => {
    it("converts degrees to half-radians", () => {
      assert.ok(Math.abs(beamHalfAngle(60) - Math.PI / 6) < 1e-9);
      assert.ok(Math.abs(beamHalfAngle(DEFAULT_BEAM_WIDTH) - ((DEFAULT_BEAM_WIDTH / 2) * Math.PI) / 180) < 1e-9);
    });

    it("clamps and falls back", () => {
      assert.equal(beamHalfAngle(NaN), beamHalfAngle(DEFAULT_BEAM_WIDTH));
      assert.ok(beamHalfAngle(1) > 0);
      assert.ok(beamHalfAngle(400) <= beamHalfAngle(80));
    });
  });

  describe("coneCoverage", () => {
    const half = Math.PI / 6;
    const reach = 200;

    it("is 1 in the lamp neighborhood", () => {
      assert.equal(coneCoverage({ x: NEAR_DIST - 1, y: 0 }, origin, 0, half, reach), 1);
    });

    it("falls off with distance on-axis", () => {
      const near = coneCoverage({ x: 40, y: 0 }, origin, 0, half, reach);
      const far = coneCoverage({ x: 160, y: 0 }, origin, 0, half, reach);
      assert.ok(near > IN_CONE);
      assert.ok(far > IN_CONE);
      assert.ok(near > far);
    });

    it("is 0 beyond maxDist and well outside the half-angle", () => {
      assert.equal(coneCoverage({ x: 250, y: 0 }, origin, 0, half, reach), 0);
      assert.equal(coneCoverage({ x: 80, y: 80 }, origin, 0, half, reach), 0);
    });

    it("soft-edges between inside and outside", () => {
      const rim = coneCoverage({ x: 80, y: Math.tan(half) * 80 }, origin, 0, half, reach);
      assert.ok(rim >= 0 && rim <= 1);
    });
  });

  describe("inCone / revealGlyphs", () => {
    const half = Math.PI / 6;
    const reach = 400;
    const left = { x: -80, y: 0 };

    it("counts on-axis points inside", () => {
      assert.equal(inCone(left, origin, PARK_ANGLE, half, reach), true);
    });

    it("narrows the test cone relative to the painted cone", () => {
      const halfWide = Math.PI / 6;
      const dist = 80;
      const off = 25 * (Math.PI / 180);
      const p = { x: -Math.cos(off) * dist, y: Math.sin(off) * dist };
      assert.equal(inCone(p, origin, PARK_ANGLE, halfWide, reach), true);
      assert.deepEqual(revealGlyphs([p], origin, PARK_ANGLE, halfWide, reach), [false]);
    });
  });

  describe("nearestIndex / toggleReveal / searchAngle", () => {
    const glyphs = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 0 },
    ];

    it("picks the closest glyph", () => {
      assert.equal(nearestIndex(glyphs, { x: 19, y: 1 }), 2);
      assert.equal(nearestIndex([], { x: 0, y: 0 }), -1);
    });

    it("toggleReveal is all-on or all-off", () => {
      assert.deepEqual(toggleReveal(4, true), [true, true, true, true]);
      assert.deepEqual(toggleReveal(3, false), [false, false, false]);
      assert.deepEqual(toggleReveal(-2, true), []);
    });

    it("searchAngle sways around PARK_ANGLE", () => {
      const a = searchAngle(0, 0.7);
      assert.ok(Math.abs(a - PARK_ANGLE) < 0.6);
      assert.notEqual(searchAngle(1.4, 0.7), a);
    });

    it("fieldAim sits on the row", () => {
      const p = fieldAim({ left: 10, top: 20, width: 100, height: 10 }, 0.32);
      assert.equal(p.x, 42);
      assert.equal(p.y, 25);
    });
  });

  describe("perched origin can cut a horizontal row", () => {
    const half = beamHalfAngle(DEFAULT_BEAM_WIDTH);
    const reach = 400;
    const field = { left: 20, top: 28, width: 180, height: 16 };
    const glyphs = Array.from({ length: 13 }, (_, i) => ({
      x: 28 + i * 14,
      y: 36,
    }));

    it("cannot mix when the lamp sits on the glyph line", () => {
      const origin = { x: 220, y: 36 };
      const angle = angleTo(origin, fieldAim(field));
      const lit = revealGlyphs(glyphs, origin, angle, half, reach).filter(Boolean).length;
      assert.equal(lit, 13);
    });

    it("mixes when the lamp is perched above the baseline", () => {
      const origin = { x: 220, y: 8 };
      const angle = angleTo(origin, fieldAim(field));
      const flags = revealGlyphs(glyphs, origin, angle, half, reach);
      const lit = flags.filter(Boolean).length;
      assert.ok(lit > 0 && lit < 13, `expected a cut row, got ${lit} / 13`);
    });

    it("peekAim cuts more of the row than fieldAim", () => {
      const origin = { x: 220, y: 8 };
      const onRow = revealGlyphs(glyphs, origin, angleTo(origin, fieldAim(field)), half, reach);
      const peek = revealGlyphs(glyphs, origin, angleTo(origin, peekAim(field)), half, reach);
      const a = onRow.filter(Boolean).length;
      const b = peek.filter(Boolean).length;
      assert.ok(b > 0 && b < 13, `peek should mix, got ${b}`);
      assert.ok(b <= a, `peek should not light more than on-row (${b} vs ${a})`);
    });
  });

  describe("sameReveal", () => {
    it("compares by value", () => {
      assert.equal(sameReveal([true, false], [true, false]), true);
      assert.equal(sameReveal([true], [false]), false);
      assert.equal(sameReveal([true], [true, true]), false);
    });
  });
});
