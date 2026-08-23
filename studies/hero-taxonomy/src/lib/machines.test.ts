import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  allowsCarousel,
  KIND_IDS,
  primaryCtaCount,
  questionOf,
  tooManyBanners,
  type KindId,
} from "./machines";

const QUESTIONS: Record<KindId, string> = {
  product: "能解决什么？",
  portfolio: "你是谁、做得怎样？",
  event: "为什么现在参加？",
  commerce: "卖什么、值不值得？",
  media: "发生了什么？",
  education: "能学到什么？",
  tool: "能帮我做什么？",
  community: "谁在这里？",
};

describe("questionOf", () => {
  it("names the first-glance job for each leaf, not a fancy hero", () => {
    for (const kind of KIND_IDS) {
      assert.equal(questionOf(kind), QUESTIONS[kind]);
    }
  });

  it("keeps eight distinct jobs", () => {
    const unique = new Set(KIND_IDS.map((kind) => questionOf(kind)));
    assert.equal(unique.size, KIND_IDS.length);
  });
});

describe("primaryCtaCount", () => {
  it("is 1 for every first-fold kind", () => {
    for (const kind of KIND_IDS) {
      assert.equal(primaryCtaCount(kind), 1);
    }
  });
});

describe("allowsCarousel", () => {
  it("is false for commerce (tooManyBanners)", () => {
    assert.equal(allowsCarousel("commerce"), false);
    assert.equal(tooManyBanners("commerce", 5), true);
    assert.equal(tooManyBanners("commerce", 2), true);
    assert.equal(tooManyBanners("commerce", 1), false);
    assert.equal(tooManyBanners("commerce", 0), false);
  });

  it("is true only for the magazine portfolio banner", () => {
    assert.equal(allowsCarousel("portfolio"), true);
    for (const kind of KIND_IDS) {
      if (kind === "portfolio") continue;
      assert.equal(allowsCarousel(kind), false);
    }
  });

  it("does not flag banners on non-shop leaves", () => {
    assert.equal(tooManyBanners("portfolio", 5), false);
    assert.equal(tooManyBanners("product", 3), false);
    assert.equal(tooManyBanners("media", 2), false);
  });
});
