import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ARC_BASE,
  FORK_HALF,
  H_POWER,
  MAX_PULL,
  SLING_GRAVITY,
  SLING_THRESHOLD,
  clamp,
  dragMode,
  flightSpeed,
  interceptTimes,
  limitPull,
  predictThrow,
  projectileAt,
  quantize,
  valueFromX,
  xFromValue,
} from "./machines.js";

describe("sling-throw machines", () => {
  describe("dragMode / clamp / quantize", () => {
    it("stays on-track below the threshold", () => {
      assert.equal(dragMode(SLING_THRESHOLD - 1), "slide");
      assert.equal(dragMode(0), "slide");
      assert.equal(dragMode(SLING_THRESHOLD), "sling");
      assert.equal(dragMode(40), "sling");
    });

    it("clamps and quantizes", () => {
      assert.equal(clamp(5, 0, 10), 5);
      assert.equal(clamp(-2, 0, 10), 0);
      assert.equal(quantize(43.2, 0, 100, 1), 43);
      assert.equal(quantize(47, 0, 100, 10), 50);
      assert.equal(quantize(3, 0, 10, 0), 3);
    });
  });

  describe("limitPull", () => {
    it("passes through pulls under the cap", () => {
      const p = limitPull({ x: 30, y: 40 });
      assert.equal(p.x, 30);
      assert.equal(p.y, 40);
    });

    it("soft-stretches past MAX_PULL", () => {
      const p = limitPull({ x: 0, y: MAX_PULL * 2 });
      const len = Math.hypot(p.x, p.y);
      assert.ok(len > MAX_PULL);
      assert.ok(len < MAX_PULL * 2);
      assert.ok(Math.abs(len - (MAX_PULL + MAX_PULL * 0.32)) < 1e-6);
    });
  });

  describe("value mapping", () => {
    it("round-trips x and value", () => {
      const x = xFromValue(42, 100, 300, 0, 100);
      assert.equal(x, 100 + 0.42 * 200);
      assert.ok(Math.abs(valueFromX(x, 100, 300, 0, 100) - 42) < 1e-9);
    });
  });

  describe("projectile / intercept", () => {
    it("projectileAt follows x = x0 + vx t, y = y0 + vy t + 1/2 g t^2", () => {
      const p = projectileAt({ x: 10, y: 20 }, { x: 3, y: -4 }, 10, 2);
      assert.equal(p.x, 10 + 6);
      assert.equal(p.y, 20 + -8 + 0.5 * 10 * 4);
    });

    it("interceptTimes finds the later crossing from below", () => {
      const originY = 140;
      const trackY = 100;
      const dist = 40;
      const peak = ARC_BASE + dist * 0.34;
      const g = SLING_GRAVITY;
      const vy = -Math.sqrt(2 * g * (dist + peak));
      const times = interceptTimes(originY, vy, g, trackY);
      assert.ok(times.length >= 2);
      assert.ok(times[0]! < times[1]!);
    });
  });

  describe("predictThrow", () => {
    const track = { trackY: 100, trackMinX: 0, trackMaxX: 400 };

    it("lands on the rail from a pull below", () => {
      const pred = predictThrow({
        origin: { x: 120, y: 180 },
        anchor: { x: 160, y: 100 },
        ...track,
      });
      assert.ok(pred);
      assert.equal(pred!.landing.y, 100);
      assert.ok(pred!.landing.x >= 0 && pred!.landing.x <= 400);
      assert.ok(pred!.tHit > pred!.tFork);
      assert.ok(pred!.samples.length > 2);
      assert.equal(pred!.forkA.x, 160 - FORK_HALF);
      assert.equal(pred!.velocity.x, -limitPull({ x: 120 - 160, y: 180 - 100 }).x * H_POWER);
    });

    it("clamps a landing that would fly past the rail", () => {
      const pred = predictThrow({
        origin: { x: 380, y: 220 },
        anchor: { x: 40, y: 100 },
        ...track,
      });
      assert.ok(pred);
      assert.equal(pred!.landing.x, track.trackMinX);
      assert.ok(pred!.rawLanding.x < track.trackMinX);
    });

    it("flightSpeed compresses long throws", () => {
      assert.equal(flightSpeed(0.4), 1);
      assert.ok(Math.abs(flightSpeed(1.4) - 1.4 / 0.7) < 1e-9);
    });
  });
});
