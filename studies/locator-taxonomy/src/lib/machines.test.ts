import assert from "node:assert/strict";
import test, { describe } from "node:test";
import {
  calculateProgressRatio,
  canNavigateStep,
  computeSearchScore,
  countByStatus,
  shouldShowBackToTop,
} from "./machines";

describe("calculateProgressRatio", () => {
  test("returns 0 at top of scroller", () => {
    assert.equal(calculateProgressRatio(0, 1000, 400), 0);
  });

  test("returns 0.5 halfway down", () => {
    // max = 1000 - 400 = 600
    assert.equal(calculateProgressRatio(300, 1000, 400), 0.5);
  });

  test("returns 1 at bottom of scroller", () => {
    assert.equal(calculateProgressRatio(600, 1000, 400), 1);
  });

  test("clamps negative scroll and overscroll within [0, 1]", () => {
    assert.equal(calculateProgressRatio(-50, 1000, 400), 0);
    assert.equal(calculateProgressRatio(800, 1000, 400), 1);
  });

  test("returns 1 when content does not exceed container height", () => {
    assert.equal(calculateProgressRatio(0, 300, 400), 1);
  });
});

describe("shouldShowBackToTop", () => {
  test("returns false when below default threshold", () => {
    assert.equal(shouldShowBackToTop(100), false);
    assert.equal(shouldShowBackToTop(240), false);
  });

  test("returns true when beyond default threshold", () => {
    assert.equal(shouldShowBackToTop(241), true);
    assert.equal(shouldShowBackToTop(500), true);
  });

  test("respects custom threshold", () => {
    assert.equal(shouldShowBackToTop(150, 100), true);
    assert.equal(shouldShowBackToTop(80, 100), false);
  });
});

describe("canNavigateStep", () => {
  test("allows navigating to current or previous steps", () => {
    assert.equal(canNavigateStep(0, 2, 4), true);
    assert.equal(canNavigateStep(1, 2, 4), true);
    assert.equal(canNavigateStep(2, 2, 4), true);
  });

  test("rejects skipping forward beyond current step", () => {
    assert.equal(canNavigateStep(3, 2, 4), false);
  });

  test("rejects out-of-bounds indices", () => {
    assert.equal(canNavigateStep(-1, 0, 4), false);
    assert.equal(canNavigateStep(4, 2, 4), false);
  });
});

describe("computeSearchScore", () => {
  const item = {
    id: "01",
    title: "设计系统与定位器",
    tags: ["组件", "导航"],
    excerpt: "长页面中定位器可以大幅提升查找效率",
  };

  test("gives high score for exact title/query match", () => {
    assert.ok(computeSearchScore("定位器", item) > 0);
    assert.ok(computeSearchScore("设计系统", item) > 0);
  });

  test("returns 0 for irrelevant terms", () => {
    assert.equal(computeSearchScore("量子计算黑客", item), 0);
  });
});

describe("countByStatus", () => {
  test("tallies items by status correctly", () => {
    const items = [
      { id: "1", status: "doing" },
      { id: "2", status: "doing" },
      { id: "3", status: "done" },
    ];
    const counts = countByStatus(items);
    assert.equal(counts.all, 3);
    assert.equal(counts.doing, 2);
    assert.equal(counts.done, 1);
  });
});
