import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  clamp,
  createSpring,
  criticalDamping,
  dampingRatio,
  demoAt,
  hypot2,
  integrateSpring,
  pruneTrail,
  pushSample,
  pushSpaced,
  stepSpring,
  zetaLabel,
  PRESETS,
  DEFAULT_PRESET,
} from "./machines.js";

describe("cursor-spring machines", () => {
  describe("clamp", () => {
    it("clamps values within range", () => {
      assert.equal(clamp(0.5, 0, 1), 0.5);
      assert.equal(clamp(-0.2, 0, 1), 0);
      assert.equal(clamp(1.5, 0, 1), 1);
    });

    it("handles reversed min/max and NaN safely", () => {
      assert.equal(clamp(0.5, 1, 0), 0.5);
      assert.equal(clamp(NaN, 0, 1), 0);
    });
  });

  describe("criticalDamping & dampingRatio", () => {
    it("calculates critical damping: 2 * sqrt(k * m)", () => {
      // k = 100, m = 1 => 2 * sqrt(100) = 20
      assert.equal(criticalDamping(100, 1), 20);
      // k = 400, m = 4 => 2 * sqrt(1600) = 80
      assert.equal(criticalDamping(400, 4), 80);
    });

    it("handles boundary values for mass and stiffness", () => {
      assert.ok(criticalDamping(0, 1) === 0);
      assert.ok(criticalDamping(-10, 1) === 0);
      assert.ok(criticalDamping(100, 0) > 0); // mass falls back to 0.0001
      assert.ok(criticalDamping(NaN, 1) === 0);
    });

    it("computes damping ratio zeta = damping / critical", () => {
      const zeta = dampingRatio({ stiffness: 100, damping: 20, mass: 1 });
      assert.equal(zeta, 1.0); // critically damped
    });

    it("labels zeta appropriately", () => {
      assert.match(zetaLabel(0.5), /欠阻尼/);
      assert.match(zetaLabel(1.0), /临界阻尼/);
      assert.match(zetaLabel(1.5), /过阻尼/);
      assert.match(zetaLabel(0), /无阻尼/);
      assert.match(zetaLabel(NaN), /无阻尼/);
    });
  });

  describe("Spring state & integration", () => {
    it("initializes a spring state with zero velocity", () => {
      const s = createSpring(0.3, 0.7);
      assert.equal(s.x, 0.3);
      assert.equal(s.y, 0.7);
      assert.equal(s.vx, 0);
      assert.equal(s.vy, 0);
    });

    it("moves towards target on integrateSpring step", () => {
      const s0 = createSpring(0, 0);
      const target = { x: 100, y: 100 };
      const cfg = { stiffness: 150, damping: 16, mass: 1 };

      const s1 = integrateSpring(s0, target, 0.016, cfg);
      assert.ok(s1.x > 0 && s1.x < 100, "spring should advance towards target x");
      assert.ok(s1.y > 0 && s1.y < 100, "spring should advance towards target y");
      assert.ok(s1.vx > 0, "velocity should be positive");
      assert.ok(s1.vy > 0, "velocity should be positive");
    });

    it("converges towards target over multiple steps", () => {
      let s = createSpring(0, 0);
      const target = { x: 50, y: 50 };
      const cfg = { stiffness: 200, damping: 25, mass: 1 };

      // Simulate 1 second at ~60fps
      for (let i = 0; i < 60; i++) {
        s = integrateSpring(s, target, 0.016, cfg);
      }

      assert.ok(Math.abs(s.x - 50) < 0.1, `x should be settled near 50, got ${s.x}`);
      assert.ok(Math.abs(s.y - 50) < 0.1, `y should be settled near 50, got ${s.y}`);
    });

    it("settles into deadband and zeros velocity when close", () => {
      // In normalized [0, 1] space: dx < 0.001, v < 0.01
      const almostThere = { x: 0.4996, y: 0.5002, vx: 0.004, vy: -0.004 };
      const target = { x: 0.5, y: 0.5 };
      const cfg = { stiffness: 150, damping: 16, mass: 1 };

      const settled = integrateSpring(almostThere, target, 0.016, cfg);
      assert.equal(settled.x, 0.5);
      assert.equal(settled.y, 0.5);
      assert.equal(settled.vx, 0);
      assert.equal(settled.vy, 0);

      // Verify it does NOT prematurely settle when distance is perceptible (e.g. 5% of screen)
      const midway = { x: 0.45, y: 0.5, vx: 0.005, vy: 0 };
      const active = integrateSpring(midway, target, 0.016, cfg);
      assert.notEqual(active.x, 0.5);
      assert.ok(active.x > 0.45 && active.x < 0.5);
    });

    it("sub-stepping preserves numerical stability even with large dt", () => {
      const s0 = createSpring(0, 0);
      const target = { x: 500, y: 500 };
      const cfg = { stiffness: 350, damping: 20, mass: 1 };

      // Unstable naive Euler would blow up with dt = 0.5, but integrateSpring clamps dt to MAX_DT
      // and subdivides into 8ms sub-steps.
      const sNext = integrateSpring(s0, target, 0.5, cfg);
      assert.ok(Number.isFinite(sNext.x), "x must remain finite");
      assert.ok(Number.isFinite(sNext.y), "y must remain finite");
      assert.ok(Number.isFinite(sNext.vx), "vx must remain finite");
      assert.ok(Number.isFinite(sNext.vy), "vy must remain finite");
      assert.ok(sNext.x < 1000, "spring should not explode exponentially");
    });

    it("stepSpring executes a single Euler integration step", () => {
      const s0 = createSpring(0, 0);
      const target = { x: 10, y: 20 };
      const cfg = { stiffness: 100, damping: 10, mass: 1 };
      const s1 = stepSpring(s0, target, 0.01, cfg);
      assert.ok(s1.vx > 0);
      assert.ok(s1.vy > 0);
      assert.ok(s1.x > 0);
      assert.ok(s1.y > 0);
    });

    it("safely handles non-finite targets and invalid states", () => {
      const s0 = createSpring(0, 0);
      const invalidTarget = { x: NaN, y: Infinity };
      const cfg = { stiffness: 100, damping: 10, mass: 1 };
      const s1 = integrateSpring(s0, invalidTarget, 0.016, cfg);
      assert.deepEqual(s1, s0);
    });

    it("hypot2 calculates squared Euclidean distance", () => {
      assert.equal(hypot2({ x: 0, y: 0 }, { x: 3, y: 4 }), 25);
      assert.equal(hypot2({ x: 1, y: 1 }, { x: 1, y: 1 }), 0);
    });
  });

  describe("Trail management", () => {
    it("prunes points older than TTL", () => {
      const trail = [
        { x: 1, y: 1, t: 100 },
        { x: 2, y: 2, t: 200 },
        { x: 3, y: 3, t: 800 },
        { x: 4, y: 4, t: 950 },
      ];
      // now = 1000, ttl = 500 => cutoff = 500 => t < 500 removed
      const pruned = pruneTrail(trail, 1000, 500);
      assert.equal(pruned.length, 2);
      assert.equal(pruned[0]?.t, 800);
      assert.equal(pruned[1]?.t, 950);
    });

    it("caps max trail length to 480 points", () => {
      const trail = Array.from({ length: 600 }, (_, i) => ({
        x: i,
        y: i,
        t: 1000 + i,
      }));
      const pruned = pruneTrail(trail, 2000, 2000);
      assert.equal(pruned.length, 480);
      assert.equal(pruned[pruned.length - 1]?.t, 1599);
    });

    it("pushSpaced interpolates intermediate points when distance exceeds spacing", () => {
      const trail = [{ x: 0, y: 0, t: 100 }];
      // Spacing 10, distance 40 => should interpolate 4 points
      pushSpaced(trail, 40, 0, 120, 10);
      assert.equal(trail.length, 5);
      assert.equal(trail[1]?.x, 10);
      assert.equal(trail[2]?.x, 20);
      assert.equal(trail[3]?.x, 30);
      assert.equal(trail[4]?.x, 40);
    });

    it("pushSample avoids duplicate points within 0.4px distance", () => {
      const trail = [{ x: 10, y: 10, t: 100 }];
      pushSample(trail, 10.1, 10.1, 110);
      assert.equal(trail.length, 1, "micro movement within 0.4px should be deduplicated");

      pushSample(trail, 15, 15, 120);
      assert.equal(trail.length, 2, "significant movement should be pushed");

      // Non-finite coords should be rejected
      pushSample(trail, NaN, 20, 130);
      assert.equal(trail.length, 2);
    });

    it("pushSpaced handles zero or negative spacing safely without hanging", () => {
      const trail = [{ x: 0, y: 0, t: 100 }];
      // spacing <= 0 should fall back to default spacing and not cause infinite loop
      pushSpaced(trail, 20, 0, 110, 0);
      assert.ok(trail.length > 1);

      // non-finite spacing
      pushSpaced(trail, 30, 0, 120, NaN);
      assert.ok(trail.length > 2);
    });

    it("pruneTrail safely handles non-finite ttl or timestamp", () => {
      const trail = [{ x: 0, y: 0, t: 100 }];
      const res = pruneTrail(trail, NaN, NaN);
      assert.equal(res.length, 1);
    });
  });

  describe("demoAt trajectory", () => {
    it("returns coordinates within normalized bounds [0.08, 0.92] x [0.16, 0.86]", () => {
      for (let t = 0; t <= 10; t += 0.2) {
        const p = demoAt(t);
        assert.ok(p.x >= 0.08 && p.x <= 0.92, `x=${p.x} out of range at t=${t}`);
        assert.ok(p.y >= 0.16 && p.y <= 0.86, `y=${p.y} out of range at t=${t}`);
      }
    });

    it("handles non-finite time inputs safely", () => {
      const p = demoAt(NaN);
      assert.ok(Number.isFinite(p.x));
      assert.ok(Number.isFinite(p.y));
    });
  });

  describe("PRESETS", () => {
    it("contains 4 valid presets with soft as default", () => {
      assert.equal(PRESETS.length, 4);
      assert.equal(DEFAULT_PRESET.id, "soft");
      for (const p of PRESETS) {
        assert.ok(p.stiffness > 0);
        assert.ok(p.damping > 0);
        assert.ok(p.mass > 0);
        assert.ok(p.label.length > 0);
      }
    });
  });
});
