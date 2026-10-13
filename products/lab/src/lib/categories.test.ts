import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  CATEGORIES,
  categoryLabel,
  filterStudies,
  getStudyCategory,
} from "./categories";
import type { StudyMeta } from "./study";

function loadActualStudySlugs(): string[] {
  const dir = studiesDir();
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(dir, d.name, "study.json")))
    .map((d) => d.name)
    .sort();
}

function studiesDir(): string {
  return join(fileURLToPath(new URL(".", import.meta.url)), "../../../../studies");
}

function loadStudy(slug: string): StudyMeta {
  return JSON.parse(readFileSync(join(studiesDir(), slug, "study.json"), "utf8")) as StudyMeta;
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
      category: "craft",
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

describe("study.json categories", () => {
  const domainIds = ["pointer", "layout", "controls", "feedback", "craft"] as const;

  it("gives every study a domain category the lab can read", () => {
    const slugs = loadActualStudySlugs();
    assert.ok(slugs.length > 0);
    for (const slug of slugs) {
      const meta = loadStudy(slug);
      assert.equal(meta.slug, slug);
      assert.ok(
        (domainIds as readonly string[]).includes(meta.category),
        `${slug} category ${meta.category} is not a lab domain`,
      );
      assert.equal(getStudyCategory(meta), meta.category);
    }
  });

  it("keeps the previously reassigned studies", () => {
    assert.equal(loadStudy("wheel-picker").category, "pointer");
    assert.equal(loadStudy("locator-taxonomy").category, "layout");
    assert.equal(loadStudy("guide-interrupt").category, "feedback");
    assert.equal(loadStudy("container-morph").category, "craft");
  });

  it("falls back to craft when category is missing or invalid", () => {
    assert.equal(getStudyCategory(undefined), "craft");
    assert.equal(getStudyCategory({ category: "" }), "craft");
    assert.equal(getStudyCategory({ category: "nope" }), "craft");
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
      category: "pointer",
      title: "滚轮选择器",
      titleEn: "Wheel Picker",
      summary: "拨动连续滚动并吸附基线",
      summaryEn: "Continuous scroll with baseline snapping",
      tags: ["picker", "gesture"],
    }),
    mockStudy("locator-taxonomy", {
      category: "layout",
      title: "定位器",
      titleEn: "Locator",
      summary: "大纲目录与定位导览",
      summaryEn: "Outline catalog and navigation",
      tags: ["toc", "navigation"],
    }),
    mockStudy("guide-interrupt", {
      category: "feedback",
      title: "引导打断",
      titleEn: "Guide Interrupt",
      summary: "聚光挖孔教学",
      summaryEn: "Spotlight tour",
      tags: ["guide", "interrupt"],
    }),
    mockStudy("button-taxonomy", {
      category: "controls",
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

  it("filters by the category stored on the study, not by slug", () => {
    const moved = mockStudy("wheel-picker", { category: "layout", title: "滚轮选择器" });
    assert.equal(filterStudies([moved], "", "layout").length, 1);
    assert.equal(filterStudies([moved], "", "pointer").length, 0);
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
