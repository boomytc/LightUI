import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  CATEGORIES,
  SLUG_CATEGORY_MAP,
  categoryLabel,
  filterStudies,
  getStudyCategory,
} from "./categories";
import type { StudyMeta } from "./study";

function loadActualStudySlugs(): string[] {
  const dir = join(fileURLToPath(new URL(".", import.meta.url)), "../../../../studies");
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(dir, d.name, "study.json")))
    .map((d) => d.name)
    .sort();
}

function mockStudy(slug: string, partial: Partial<StudyMeta> = {}): { meta: StudyMeta } {
  return {
    meta: {
      slug,
      title: partial.title ?? slug,
      summary: partial.summary ?? "",
      asks: partial.asks ?? "",
      asksEn: partial.asksEn ?? "",
      status: "active",
      tags: partial.tags ?? [],
      ...partial,
    },
  };
}

describe("CATEGORIES metadata", () => {
  it("defines the 5 core domain categories plus 'all'", () => {
    const ids = CATEGORIES.map((c) => c.id);
    assert.deepEqual(ids, ["all", "pointer", "layout", "controls", "feedback", "craft"]);
  });

  it("contains complete bilingual titles and descriptions for all categories", () => {
    for (const cat of CATEGORIES) {
      assert.ok(cat.nameZh.length > 0, `Category ${cat.id} has empty nameZh`);
      assert.ok(cat.nameEn.length > 0, `Category ${cat.id} has empty nameEn`);
      assert.ok(cat.descZh.length > 0, `Category ${cat.id} has empty descZh`);
      assert.ok(cat.descEn.length > 0, `Category ${cat.id} has empty descEn`);
    }
  });

  it("has updated names for layout, feedback, and craft", () => {
    const layout = CATEGORIES.find((c) => c.id === "layout");
    assert.equal(layout?.nameZh, "结构与导览");
    assert.equal(layout?.nameEn, "Layout & Navigation");

    const feedback = CATEGORIES.find((c) => c.id === "feedback");
    assert.equal(feedback?.nameZh, "反馈与打断");
    assert.equal(feedback?.nameEn, "Feedback & Interruption");

    const craft = CATEGORIES.find((c) => c.id === "craft");
    assert.equal(craft?.nameZh, "工程与几何");
    assert.equal(craft?.nameEn, "Craft & Geometry");
  });
});

describe("SLUG_CATEGORY_MAP distribution and reassignments", () => {
  it("strictly matches all active studies in the filesystem", () => {
    const actualSlugs = loadActualStudySlugs();
    const mappedSlugs = Object.keys(SLUG_CATEGORY_MAP).sort();
    assert.deepEqual(mappedSlugs, actualSlugs);
    assert.equal(mappedSlugs.length, 50);
  });

  it("correctly maps the three reassigned studies and container-morph", () => {
    assert.equal(getStudyCategory("wheel-picker"), "pointer");
    assert.equal(getStudyCategory("locator-taxonomy"), "layout");
    assert.equal(getStudyCategory("guide-interrupt"), "feedback");
    assert.equal(getStudyCategory("container-morph"), "craft");
  });

  it("has the exact expected count per domain (15 / 11 / 6 / 10 / 8)", () => {
    const counts = {
      pointer: 0,
      layout: 0,
      controls: 0,
      feedback: 0,
      craft: 0,
    };

    for (const slug of Object.keys(SLUG_CATEGORY_MAP)) {
      const cat = getStudyCategory(slug);
      assert.ok(cat in counts, `Unexpected category: ${cat}`);
      counts[cat as keyof typeof counts]++;
    }

    assert.deepEqual(counts, {
      pointer: 15,
      layout: 11,
      controls: 6,
      feedback: 10,
      craft: 8,
    });
  });

  it("falls back to craft for unknown slug", () => {
    assert.equal(getStudyCategory("non-existent-study"), "craft");
  });
});

describe("categoryLabel", () => {
  it("returns localized category names", () => {
    assert.equal(categoryLabel("pointer", "zh"), "指针与手势");
    assert.equal(categoryLabel("pointer", "en"), "Pointer & Gesture");
    assert.equal(categoryLabel("layout", "zh"), "结构与导览");
    assert.equal(categoryLabel("layout", "en"), "Layout & Navigation");
    assert.equal(categoryLabel("feedback", "zh"), "反馈与打断");
    assert.equal(categoryLabel("feedback", "en"), "Feedback & Interruption");
    assert.equal(categoryLabel("craft", "zh"), "工程与几何");
    assert.equal(categoryLabel("craft", "en"), "Craft & Geometry");
  });

  it("returns localized 'all' label", () => {
    assert.equal(categoryLabel("all", "zh"), "全部");
    assert.equal(categoryLabel("all", "en"), "All");
  });

  it("returns id when category is not found", () => {
    assert.equal(categoryLabel("unknown", "zh"), "unknown");
    assert.equal(categoryLabel("unknown", "en"), "unknown");
  });
});

describe("filterStudies", () => {
  const studies = [
    mockStudy("wheel-picker", {
      title: "滚轮选择器",
      titleEn: "Wheel Picker",
      summary: "拨动连续滚动并吸附基线",
      summaryEn: "Continuous scroll with baseline snapping",
      tags: ["picker", "gesture"],
    }),
    mockStudy("locator-taxonomy", {
      title: "定位器",
      titleEn: "Locator",
      summary: "大纲目录与定位导览",
      summaryEn: "Outline catalog and navigation",
      tags: ["toc", "navigation"],
    }),
    mockStudy("guide-interrupt", {
      title: "引导打断",
      titleEn: "Guide Interrupt",
      summary: "聚光挖孔教学",
      summaryEn: "Spotlight tour",
      tags: ["guide", "interrupt"],
    }),
    mockStudy("button-taxonomy", {
      title: "按钮",
      titleEn: "Button",
      summary: "操作重量",
      summaryEn: "Action weight",
      tags: ["button", "action"],
    }),
  ];

  it("returns all studies when category is 'all' and query is empty", () => {
    const res = filterStudies(studies, "", "all");
    assert.equal(res.length, 4);
  });

  it("filters accurately by updated category", () => {
    const pointerList = filterStudies(studies, "", "pointer");
    assert.equal(pointerList.length, 1);
    assert.equal(pointerList[0].meta.slug, "wheel-picker");

    const layoutList = filterStudies(studies, "", "layout");
    assert.equal(layoutList.length, 1);
    assert.equal(layoutList[0].meta.slug, "locator-taxonomy");

    const feedbackList = filterStudies(studies, "", "feedback");
    assert.equal(feedbackList.length, 1);
    assert.equal(feedbackList[0].meta.slug, "guide-interrupt");
  });

  it("filters by Chinese and English text search queries and tags", () => {
    const searchedZh = filterStudies(studies, "滚轮", "all");
    assert.equal(searchedZh.length, 1);
    assert.equal(searchedZh[0].meta.slug, "wheel-picker");

    const searchedEn = filterStudies(studies, "Wheel Picker", "all");
    assert.equal(searchedEn.length, 1);
    assert.equal(searchedEn[0].meta.slug, "wheel-picker");

    const searchedSummaryEn = filterStudies(studies, "Continuous scroll", "all");
    assert.equal(searchedSummaryEn.length, 1);
    assert.equal(searchedSummaryEn[0].meta.slug, "wheel-picker");

    const tagged = filterStudies(studies, "", "all", "toc");
    assert.equal(tagged.length, 1);
    assert.equal(tagged[0].meta.slug, "locator-taxonomy");
  });

  it("filters by category name search term", () => {
    const searchedCatZh = filterStudies(studies, "结构与导览", "all");
    assert.equal(searchedCatZh.length, 1);
    assert.equal(searchedCatZh[0].meta.slug, "locator-taxonomy");

    const searchedCatEn = filterStudies(studies, "Pointer & Gesture", "all");
    assert.equal(searchedCatEn.length, 1);
    assert.equal(searchedCatEn[0].meta.slug, "wheel-picker");
  });
});
