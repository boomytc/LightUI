import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEMO_DOCS } from "./corpus.ts";
import { search } from "./engine.ts";
import { idfBreakdown, insight, sumContributions } from "./explain.ts";
import { intersectPostings, luceneIdf, unionPostings } from "./index-builder.ts";
import { previewCuts, tokenize } from "./tokenize.ts";
import { stemEnglish } from "./stemmer.ts";
import { tfNorm } from "./score.ts";

describe("stemmer", () => {
  it("stems learning → learn", () => {
    assert.equal(stemEnglish("learning"), "learn");
  });
  it("stems algorithms → algorithm", () => {
    assert.equal(stemEnglish("algorithms"), "algorithm");
  });
});

describe("tokenize", () => {
  it("keeps 自然语言处理 as one word when in dict", () => {
    const tokens = tokenize("自然语言处理可以分为分词", { dropStopwords: true });
    const terms = tokens.filter((t) => !t.subword).map((t) => t.raw);
    assert.ok(terms.includes("自然语言处理"));
  });

  it("normalizes 二零二四年 and 第三季度", () => {
    const tokens = tokenize("二零二四年第三季度营收", { dropStopwords: true });
    const terms = tokens.filter((t) => !t.subword).map((t) => t.term);
    assert.ok(terms.includes("2024"));
    assert.ok(terms.includes("q3"));
    assert.ok(terms.includes("营收"));
  });

  it("emits 语言 as a subword of 自然语言处理", () => {
    const tokens = tokenize("自然语言处理", { dropStopwords: true, subword: true });
    assert.ok(tokens.some((t) => t.subword && t.raw === "语言"));
  });

  it("keeps 如何 as one word then drops it as a stopword", () => {
    const kept = tokenize("如何评估", { dropStopwords: false });
    assert.ok(kept.some((t) => t.raw === "如何"));
    const dropped = tokenize("如何评估", { dropStopwords: true });
    assert.ok(!dropped.some((t) => t.raw === "如何"));
  });

  it("keeps getQ3Revenue as one identifier", () => {
    const tokens = tokenize("export function getQ3Revenue(year = 2024)", { dropStopwords: true });
    assert.ok(tokens.some((t) => t.raw === "getQ3Revenue"));
  });

  it("produces bilingual previewCuts labels and hints", () => {
    const zhCuts = previewCuts("自然语言处理", "zh");
    const enCuts = previewCuts("自然语言处理", "en");
    assert.equal(zhCuts[0]?.label, "正向最大匹配");
    assert.equal(enCuts[0]?.label, "Forward Max Match (FMM)");
    assert.ok(enCuts[1]?.hint.toLowerCase().includes("subwords"));
  });
});

describe("insight explanations", () => {
  it("provides localized insights in zh and en", () => {
    const r = search(DEMO_DOCS, "二零二四年第三季度营收");
    const zh = insight(r, DEMO_DOCS, "zh");
    const en = insight(r, DEMO_DOCS, "en");
    assert.ok(zh.kicker.length > 0);
    assert.ok(en.kicker.length > 0);
    assert.notEqual(zh.kicker, en.kicker);
    assert.ok(en.kicker === "Exact Matching is Irreplaceable" || en.kicker === "Both Lanes Agree" || en.kicker === "Most Failures Lie in Retrieval");
  });

  it("branches insight body on fusion mode when both lanes agree", () => {
    const rWeighted = search(DEMO_DOCS, "苹果手机评测", { fusion: "weighted", bm25Weight: 0.6 });
    const zhW = insight(rWeighted, DEMO_DOCS, "zh");
    const enW = insight(rWeighted, DEMO_DOCS, "en");
    assert.ok(zhW.body.includes("最大值归一加权") || zhW.body.includes("BM25"));
    assert.ok(enW.body.includes("Max-norm weighted") || enW.body.includes("BM25"));
  });
});

describe("lucene IDF and saturation", () => {
  it("stays positive when Robertson IDF is negative", () => {
    const n = 11;
    const df = 10;
    const parts = idfBreakdown(n, df);
    assert.ok(parts.robertson < 0);
    assert.ok(parts.lucene > 0);
    assert.equal(parts.lucene, luceneIdf(n, df));
  });

  it("k1=0 reduces tf component to binary", () => {
    assert.equal(tfNorm(0, 10, 10, 0, 0.75), 0);
    assert.equal(tfNorm(5, 10, 10, 0, 0.75), 1);
  });

  it("sum of term contributions equals BM25 score", () => {
    const r = search(DEMO_DOCS, "苹果手机评测");
    for (const h of r.bm25) {
      assert.ok(Math.abs(sumContributions(h) - h.score) < 1e-9);
    }
  });
});

describe("search demo corpus", () => {
  it("ranks the exact Q3 revenue doc first for BM25", () => {
    const r = search(DEMO_DOCS, "二零二四年第三季度营收", { subword: false });
    assert.equal(r.bm25[0]?.docId, "d2");
    const d1 = r.bm25.find((h) => h.docId === "d1");
    assert.equal(d1?.score, 0);
    assert.ok((r.bm25[0]?.score ?? 0) > 1);
    assert.ok(r.candidates.includes("d2"));
    assert.ok(!r.candidates.includes("d1"));
  });

  it("vector ranks 收入提升 high for 营收增长", () => {
    const r = search(DEMO_DOCS, "营收增长", { subword: false });
    const d6 = r.vector.find((h) => h.docId === "d6");
    assert.ok(d6);
    assert.ok((d6?.rank ?? 99) <= 3);
  });

  it("short 苹果手机评测 beats the long diluted article", () => {
    const r = search(DEMO_DOCS, "苹果手机评测", { subword: false, b: 0.75 });
    const short = r.bm25.find((h) => h.docId === "d9")!;
    const long = r.bm25.find((h) => h.docId === "d10")!;
    assert.ok(short.score > long.score);
  });

  it("missing 手机 drops a chunk of IDF", () => {
    const r = search(DEMO_DOCS, "苹果手机评测");
    const a = r.bm25.find((h) => h.docId === "d4")!;
    const b = r.bm25.find((h) => h.docId === "d5")!;
    assert.ok(a.matchedTerms.includes("手机"));
    assert.ok(b.missingTerms.includes("手机"));
    assert.ok(a.score > b.score);
  });

  it("hybrid fuses both lists", () => {
    const r = search(DEMO_DOCS, "二零二四年第三季度营收");
    assert.equal(r.hybrid[0]?.docId, "d2");
    assert.ok(r.hybrid[0]?.rrf && r.hybrid[0].rrf > 0);
  });

  it("code identifier prefers BM25", () => {
    const r = search(DEMO_DOCS, "getQ3Revenue");
    assert.equal(r.bm25[0]?.docId, "d11");
  });

  it("weighted fusion still surfaces the exact Q3 doc", () => {
    const r = search(DEMO_DOCS, "二零二四年第三季度营收", {
      fusion: "weighted",
      bm25Weight: 0.7,
    });
    assert.equal(r.hybrid[0]?.docId, "d2");
  });

  it("posting intersection of 苹果 ∩ 手机 contains the review docs", () => {
    const r = search(DEMO_DOCS, "苹果手机评测");
    const ids = intersectPostings(r.index, ["苹果", "手机"]);
    assert.ok(ids.includes("d4"));
    assert.ok(ids.includes("d9"));
    assert.ok(!ids.includes("d5"));
  });

  it("OR candidates include partial matches that AND drops", () => {
    const r = search(DEMO_DOCS, "苹果手机评测");
    assert.ok(r.orCandidates.includes("d5"));
    assert.ok(!r.candidates.includes("d5"));
    const uni = unionPostings(r.index, r.queryTerms);
    assert.deepEqual(uni, r.orCandidates);
  });

  it("dropStopwords toggle changes query terms, postings and scores", () => {
    const query = "如何评估财务分析方法论";
    const withDrop = search(DEMO_DOCS, query, { dropStopwords: true });
    const withoutDrop = search(DEMO_DOCS, query, { dropStopwords: false });

    // With stopwords dropped, "如何" is excluded
    assert.ok(!withDrop.queryTerms.includes("如何"));
    // With stopwords kept, "如何" is retained in query and index postings
    assert.ok(withoutDrop.queryTerms.includes("如何"));
    assert.ok(withoutDrop.queryTerms.length > withDrop.queryTerms.length);

    // d1 contains "如何" ("如何用贴现现金流与可比公司估值评估企业价值")
    const d1With = withDrop.bm25.find((h) => h.docId === "d1")!;
    const d1Without = withoutDrop.bm25.find((h) => h.docId === "d1")!;

    assert.ok(d1Without.matchedTerms.includes("如何"));
    assert.ok(!d1With.matchedTerms.includes("如何"));
    // Score should differ because "如何" contributes to the score when kept
    assert.notEqual(d1With.score, d1Without.score);
    assert.ok(d1Without.contributions.some((c) => c.term === "如何"));
  });

  it("k1=0 gives identical tf saturation for single vs multiple occurrences", () => {
    // d10 repeats 苹果 multiple times while d9 has it once
    const rK1Zero = search(DEMO_DOCS, "苹果", { k1: 0, b: 0 });
    const d9 = rK1Zero.bm25.find((h) => h.docId === "d9")!;
    const d10 = rK1Zero.bm25.find((h) => h.docId === "d10")!;
    // With k1=0 and b=0, both get identical binary tf score (tfNorm=1)
    assert.equal(d9.score, d10.score);
  });
});
