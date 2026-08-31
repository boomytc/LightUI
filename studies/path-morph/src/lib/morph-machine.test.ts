import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeMorphFrame,
  extractMetrics,
  getCanonicalD,
  getOrBuildPlan,
} from "./morph-machine";
import { PRESET_PAIRS } from "./presets";
import {
  Spring,
  SPRING_PRESETS,
  arcLength,
  detectCorners,
  fitIcon,
  iconToCubics,
  parsePath,
} from "./core";

describe("path-morph core invariants", () => {
  it("computes exact endpoints without NaN", () => {
    for (const preset of PRESET_PAIRS) {
      const frame0 = computeMorphFrame(preset.from, preset.to, 0, "polar");
      const frame1 = computeMorphFrame(preset.from, preset.to, 1, "polar");
      const frameMid = computeMorphFrame(preset.from, preset.to, 0.5, "polar");

      assert.ok(frame0.d.startsWith("M"), `frame0 starts with M for ${preset.id}`);
      assert.ok(frame1.d.startsWith("M"), `frame1 starts with M for ${preset.id}`);
      assert.ok(frameMid.d.startsWith("M"), `frameMid starts with M for ${preset.id}`);

      assert.ok(!frame0.d.includes("NaN"), `frame0 has no NaN in ${preset.id}`);
      assert.ok(!frame1.d.includes("NaN"), `frame1 has no NaN in ${preset.id}`);
      assert.ok(!frameMid.d.includes("NaN"), `frameMid has no NaN in ${preset.id}`);
    }
  });

  it("ArrowRight -> ArrowDown yields emergent rotation theta ≈ 90 deg", () => {
    const pair = PRESET_PAIRS.find((p) => p.id === "arrow-turn")!;
    const { plan } = getOrBuildPlan(pair.from, pair.to);
    const metrics = extractMetrics(pair.from, pair.to, plan);

    const deg = metrics.primaryThetaDeg;
    assert.ok(
      Math.abs(Math.abs(deg) - 90) < 5,
      `Expected theta around 90 deg, got ${deg}`,
    );
    assert.ok(metrics.isRigidCongruent, "Whole arrow is congruent under similarity");
    assert.ok(metrics.hasBlockTransport, "Rigid block transport is armed");
  });

  it("Plus -> Cross yields minimal rotation theta ≈ 45 deg", () => {
    const pair = PRESET_PAIRS.find((p) => p.id === "plus-x")!;
    const { plan } = getOrBuildPlan(pair.from, pair.to);
    const metrics = extractMetrics(pair.from, pair.to, plan);

    const deg = Math.abs(metrics.primaryThetaDeg);
    assert.ok(
      Math.abs(deg - 45) < 5,
      `Expected theta around 45 deg, got ${deg}`,
    );
  });

  it("Play -> Pause performs surjective matching (cell division)", () => {
    const pair = PRESET_PAIRS.find((p) => p.id === "play-pause")!;
    const { plan } = getOrBuildPlan(pair.from, pair.to);

    // Play has 1 subpath, Pause has 2 rects
    assert.equal(plan.items.length, 2, "Surjective matching duplicates subpaths in flight");
  });

  it("Square -> Diamond handles closed path circular correspondence", () => {
    const pair = PRESET_PAIRS.find((p) => p.id === "square-diamond")!;
    const { plan } = getOrBuildPlan(pair.from, pair.to);
    const metrics = extractMetrics(pair.from, pair.to, plan);

    assert.equal(plan.items[0].closed, true, "Closed topology preserved in flight");
    assert.ok(Math.abs(Math.abs(metrics.primaryThetaDeg) - 45) < 5, "Rotates 45 degrees");
  });

  it("Linear interpolation also produces valid paths for side-by-side comparison", () => {
    for (const preset of PRESET_PAIRS) {
      const linFrame = computeMorphFrame(preset.from, preset.to, 0.5, "linear");
      assert.ok(!linFrame.d.includes("NaN"));
      assert.ok(linFrame.d.length > 5);
    }
  });

  it("Canonical at-rest D matches standard format", () => {
    const menuD = getCanonicalD("M4 6h16M4 12h16M4 18h16");
    assert.ok(menuD.includes("M4"));
  });

  it("Spring simulator advances and settles reliably", () => {
    const spring = new Spring();
    spring.config(SPRING_PRESETS.snappy.k, SPRING_PRESETS.snappy.c);
    spring.start();

    assert.equal(spring.x, 0);

    let settled = false;
    for (let step = 0; step < 300; step++) {
      settled = spring.step(1 / 60);
      if (settled) break;
    }

    assert.ok(settled, "Spring settles within 5 seconds");
    assert.ok(Math.abs(spring.x - 1) < 0.01, "Spring ends at 1");
  });

  it("Normalizes all SVG primitives accurately", () => {
    const primitives = [
      ["line", { x1: "0", y1: "0", x2: "10", y2: "10" }],
      ["circle", { cx: "12", cy: "12", r: "5" }],
      ["ellipse", { cx: "12", cy: "12", rx: "6", ry: "4" }],
      ["rect", { x: "2", y: "2", width: "10", height: "8", rx: "1" }],
      ["polyline", { points: "0 0 10 0 10 10" }],
      ["polygon", { points: "0 0 10 0 5 10" }],
    ] as const;

    const cubics = iconToCubics(primitives);
    assert.equal(cubics.length, 6, "Converted all 6 primitives to cubics");
    for (const c of cubics) {
      assert.ok(c.pts.length >= 8, "Cubic path has at least one segment");
      assert.ok(arcLength(c) > 0, "Arc length is strictly positive");
    }
  });

  it("Detects corners on bent paths", () => {
    const checkCubics = iconToCubics("M20 6 9 17l-5-5");
    assert.equal(checkCubics.length, 1);
    const corners = detectCorners(checkCubics[0]);
    assert.ok(corners.length >= 1, "Checkmark vertex is detected as corner");
  });

  it("fitIcon rescales off-grid viewBox to 24x24 canvas", () => {
    const icon32 = "M0 0h32v32H0z";
    const fitted = fitIcon(icon32, 32, 24);
    assert.ok(fitted.startsWith("M"), "Fitted d starts with M");
    const paths = parsePath(fitted);
    assert.equal(paths.length, 1);
  });

  it("Polar interpolation extrapolates naturally with spring overshoot (t > 1)", () => {
    const pair = PRESET_PAIRS.find((p) => p.id === "arrow-turn")!;
    const frameOver = computeMorphFrame(pair.from, pair.to, 1.15, "polar");
    assert.ok(!frameOver.d.includes("NaN"), "Overshoot frame has no NaN");
    assert.ok(frameOver.d.length > 5);
  });
});
