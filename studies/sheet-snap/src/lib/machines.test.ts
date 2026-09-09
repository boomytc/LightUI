import test from "node:test";
import assert from "node:assert/strict";
import {
  clampHeight,
  resolveSnapRelease,
  computeVelocity,
  canScrollContent,
  shouldHandoffToDrawer,
  DEFAULT_SNAP_HEIGHTS,
} from "./machines.js";

test("clampHeight within bounds", () => {
  assert.equal(clampHeight(150, 118, 460), 150);
  assert.equal(clampHeight(260, 118, 460), 260);
  assert.equal(clampHeight(400, 118, 460), 400);
});

test("clampHeight overdrag damping above max", () => {
  // 100px over max (460 + 100 = 560), damped by 0.2 => 460 + 20 = 480
  const result = clampHeight(560, 118, 460, 0.2);
  assert.equal(result, 480);
});

test("clampHeight overdrag damping below min", () => {
  // 50px under min (118 - 50 = 68), damped by 0.2 => 118 - 10 = 108
  const result = clampHeight(68, 118, 460, 0.2);
  assert.equal(result, 108);
});

test("resolveSnapRelease with low velocity falls back to nearest", () => {
  // Height 150 is closer to peek (118) than half (260)
  const lowV = resolveSnapRelease(150, 0.1);
  assert.equal(lowV.targetSnap, "peek");
  assert.equal(lowV.targetHeight, DEFAULT_SNAP_HEIGHTS.peek);
  assert.equal(lowV.reason, "nearest");

  // Height 240 is closer to half (260)
  const toHalf = resolveSnapRelease(240, -0.1);
  assert.equal(toHalf.targetSnap, "half");
  assert.equal(toHalf.targetHeight, DEFAULT_SNAP_HEIGHTS.half);
  assert.equal(toHalf.reason, "nearest");

  // Height 420 is closer to full (460)
  const toFull = resolveSnapRelease(420, 0.0);
  assert.equal(toFull.targetSnap, "full");
  assert.equal(toFull.targetHeight, DEFAULT_SNAP_HEIGHTS.full);
  assert.equal(toFull.reason, "nearest");
});

test("resolveSnapRelease with flick up velocity", () => {
  // Height 140 is closer to peek (118), but fast flick up (vy = -0.8) should jump to half!
  const flickUpFromPeek = resolveSnapRelease(140, -0.8);
  assert.equal(flickUpFromPeek.targetSnap, "half");
  assert.equal(flickUpFromPeek.targetHeight, DEFAULT_SNAP_HEIGHTS.half);
  assert.equal(flickUpFromPeek.reason, "velocity_up");

  // Height 280 is closer to half (260), but fast flick up (vy = -0.6) should jump to full!
  const flickUpFromHalf = resolveSnapRelease(280, -0.6);
  assert.equal(flickUpFromHalf.targetSnap, "full");
  assert.equal(flickUpFromHalf.targetHeight, DEFAULT_SNAP_HEIGHTS.full);
  assert.equal(flickUpFromHalf.reason, "velocity_up");
});

test("resolveSnapRelease with flick down velocity", () => {
  // Height 430 is closer to full (460), but fast flick down (vy = 0.7) should jump to half!
  const flickDownFromFull = resolveSnapRelease(430, 0.7);
  assert.equal(flickDownFromFull.targetSnap, "half");
  assert.equal(flickDownFromFull.targetHeight, DEFAULT_SNAP_HEIGHTS.half);
  assert.equal(flickDownFromFull.reason, "velocity_down");

  // Height 240 is closer to half (260), but fast flick down (vy = 0.55) should jump to peek!
  const flickDownFromHalf = resolveSnapRelease(240, 0.55);
  assert.equal(flickDownFromHalf.targetSnap, "peek");
  assert.equal(flickDownFromHalf.targetHeight, DEFAULT_SNAP_HEIGHTS.peek);
  assert.equal(flickDownFromHalf.reason, "velocity_down");
});

test("computeVelocity from samples", () => {
  const samples = [
    { t: 1000, y: 300 },
    { t: 1050, y: 250 },
    { t: 1100, y: 200 },
  ];
  // dy = 200 - 300 = -100, dt = 100ms => -1.0 px/ms
  const v = computeVelocity(samples);
  assert.equal(v, -1.0);
});

test("computeVelocity with insufficient samples", () => {
  assert.equal(computeVelocity([]), 0);
  assert.equal(computeVelocity([{ t: 100, y: 200 }]), 0);
});

test("computeVelocity returns 0 when pointer pauses before release", () => {
  const samples = [
    { t: 1000, y: 300 },
    { t: 1050, y: 250 },
    { t: 1100, y: 200 },
  ];
  // 600ms pause before release at t=1700
  assert.equal(computeVelocity(samples, 1700), 0);

  // With a release sample appended at t=1700
  const withRelease = [...samples, { t: 1700, y: 200 }];
  assert.equal(computeVelocity(withRelease, 1700), 0);
});

test("canScrollContent only allowed in full snap and not dragging", () => {
  assert.equal(canScrollContent("peek", false), false);
  assert.equal(canScrollContent("half", false), false);
  assert.equal(canScrollContent("full", true), false);
  assert.equal(canScrollContent("full", false), true);
});

test("shouldHandoffToDrawer arbitration rules", () => {
  // 1. When started at top (startScrollTop = 0) and dragging down (dy > 0): immediate handoff
  assert.equal(shouldHandoffToDrawer(0, 0, 10), true);
  assert.equal(shouldHandoffToDrawer(0, 0, 1), true);

  // 2. When started at top (startScrollTop = 0) and dragging up (dy <= 0): no handoff, scrolls into list
  assert.equal(shouldHandoffToDrawer(0, 0, 0), false);
  assert.equal(shouldHandoffToDrawer(0, 0, -20), false);

  // 3. When started down in list (startScrollTop = 50) and pulling down but not reached top yet (dy < 50): no handoff
  assert.equal(shouldHandoffToDrawer(50, 20, 30), false);
  assert.equal(shouldHandoffToDrawer(50, 50, -10), false);

  // 4. When started down in list (startScrollTop = 50) and reached top (currentScrollTop = 0) and exceeded displacement (dy > 50): handoff
  assert.equal(shouldHandoffToDrawer(50, 0, 51), true);
  assert.equal(shouldHandoffToDrawer(50, 0, 80), true);

  // 5. When started down in list (startScrollTop = 50) exactly at boundary (dy = 50, currentScrollTop = 0): no handoff yet
  assert.equal(shouldHandoffToDrawer(50, 0, 50), false);

  // 6. Frame lag resilience: even if currentScrollTop in DOM was 10, dy = 60 exceeds startScrollTop so handoff triggers
  assert.equal(shouldHandoffToDrawer(50, 10, 60), true);

  // 7. Fractional pixel at top boundary
  assert.equal(shouldHandoffToDrawer(0, 0, 0.5), true);

  // 8. Resilient with negative startScrollTop (iOS rubberband / overscroll bounce)
  assert.equal(shouldHandoffToDrawer(-5, 0, 1), true);

  // 9. Single large displacement from scrollTop=100 with dy=150 (projected scrollTop=0): handoff
  assert.equal(shouldHandoffToDrawer(100, 0, 150), true);

  // 10. Frame lag resilience for large displacement even if raw scrollTop=100 is passed: handoff
  assert.equal(shouldHandoffToDrawer(100, 100, 150), true);
});

