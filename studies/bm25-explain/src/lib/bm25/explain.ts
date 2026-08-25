import { luceneIdf } from "./index-builder.ts";
import { tfNorm } from "./score.ts";
import type { LabDocument, RankedHit, SearchBundle, TermContribution } from "./types.ts";

export function fmt(n: number, digits = 3): string {
  if (!Number.isFinite(n)) return "–";
  if (Math.abs(n) >= 100) return n.toFixed(1);
  if (Math.abs(n) >= 10) return n.toFixed(2);
  return n.toFixed(digits);
}

export function docMap(docs: LabDocument[]): Map<string, LabDocument> {
  return new Map(docs.map((d) => [d.id, d]));
}

/** Lucene BM25 IDF vs the Robertson / Sparck-Jones original. */
export function idfBreakdown(nDocs: number, df: number) {
  const num = nDocs - df + 0.5;
  const den = df + 0.5;
  const ratio = den === 0 ? Number.POSITIVE_INFINITY : num / den;
  return {
    nDocs,
    df,
    num,
    den,
    ratio,
    lucene: luceneIdf(nDocs, df),
    robertson: ratio <= 0 ? Number.NEGATIVE_INFINITY : Math.log(ratio),
  };
}

/** Length-normalized saturation term used by Lucene BM25Similarity. */
export function saturationBreakdown(
  tf: number,
  dl: number,
  avgdl: number,
  k1: number,
  b: number,
) {
  const lengthRatio = avgdl === 0 ? 0 : dl / avgdl;
  const K = k1 * (1 - b + b * lengthRatio);
  return {
    lengthRatio,
    K,
    denom: tf + K,
    tfSat: tfNorm(tf, dl, avgdl, k1, b),
  };
}

export function rrfBreakdown(k: number, bm25Rank?: number, vectorRank?: number) {
  const bm25Term = bm25Rank != null ? 1 / (k + bm25Rank) : 0;
  const vectorTerm = vectorRank != null ? 1 / (k + vectorRank) : 0;
  return { k, bm25Rank, vectorRank, bm25Term, vectorTerm, score: bm25Term + vectorTerm };
}

export function sumContributions(hit: RankedHit | undefined): number {
  if (!hit) return 0;
  return hit.contributions.reduce((s, c) => s + c.contribution, 0);
}

export function topContribution(contribs: TermContribution[]): TermContribution | undefined {
  const hit = contribs.filter((c) => c.tf > 0).sort((a, b) => b.contribution - a.contribution)[0];
  return hit;
}

export function insight(
  bundle: SearchBundle,
  docs: LabDocument[],
  locale: "zh" | "en" = "zh",
): { kicker: string; body: string } {
  if (!bundle.query) {
    return locale === "en"
      ? {
          kicker: "Enter a Query",
          body: "Run a query first. BM25 targets exact keywords, dense vectors capture conceptual semantics, and hybrid fusion merges their ranks via RRF.",
        }
      : {
          kicker: "输入查询",
          body: "先搜一条。BM25 吃精确词，向量吃意思，混合用 Reciprocal Rank Fusion 按排名融合。",
        };
  }
  const byId = docMap(docs);
  const topB = bundle.bm25[0];
  const topV = bundle.vector[0];
  const topH = bundle.hybrid[0];
  if (!topB || !topV || !topH) {
    return locale === "en"
      ? { kicker: "Empty Corpus", body: "Add a few documents first." }
      : { kicker: "语料为空", body: "先加几篇文档。" };
  }
  const bDoc = byId.get(topB.docId);
  const vDoc = byId.get(topV.docId);
  const allHit = topB.matchedTerms.length === bundle.queryTerms.length && bundle.queryTerms.length > 0;
  const same = topB.docId === topV.docId;
  const vectorOnly = bundle.vector.find(
    (h) => h.docId !== topB.docId && (h.cosine ?? 0) > 0.05,
  );
  const vOnlyDoc = vectorOnly ? byId.get(vectorOnly.docId) : undefined;
  const codeLike = bundle.queryTerms.some(
    (t) => /[a-z]{3,}\d|[a-z]+[A-Z]/.test(t) || t.includes("get") || t.includes("revenueby"),
  );

  if (codeLike && topB.score > 0) {
    return locale === "en"
      ? {
          kicker: "Code Search: Boost BM25",
          body: `Identifier "${bundle.query}" is ranked #1 by BM25 to "${bDoc?.title ?? topB.docId}". Dense vectors struggle here—exact tokens are the answer.`,
        }
      : {
          kicker: "搜代码，把 BM25 调高",
          body: `标识符「${bundle.query}」被 BM25 排到「${bDoc?.title ?? topB.docId}」。向量几乎帮不上——精确 token 就是答案。`,
        };
  }

  if (allHit && !same) {
    return locale === "en"
      ? {
          kicker: "Exact Matching is Irreplaceable",
          body: `BM25 #1 "${bDoc?.title ?? topB.docId}" hits all query terms (${topB.matchedTerms.join(" · ")}). Meanwhile vector #1 is "${vDoc?.title ?? topV.docId}"—conceptually close, but missing key keywords.`,
        }
      : {
          kicker: "精确匹配仍无可替代",
          body: `BM25 第一名「${bDoc?.title ?? topB.docId}」同时命中 ${topB.matchedTerms.join(" · ")}。向量第一名却是「${vDoc?.title ?? topV.docId}」——意思近，词不一定在。`,
        };
  }
  if (!allHit && topB.missingTerms.length > 0 && topV.docId !== topB.docId) {
    return locale === "en"
      ? {
          kicker: "Missing Keywords Hurt Sparse Scores",
          body: `BM25 missed ${topB.missingTerms.join(", ")}, losing a chunk of IDF. Dense vector rescued "${vDoc?.title ?? topV.docId}" to rank #${topV.rank} (term overlap ${topV.matchedTerms.length}). Combining both sparse and dense is the standard for robust RAG.`,
        }
      : {
          kicker: "词对不上就搜不到",
          body: `BM25 缺了 ${topB.missingTerms.join("、")}，少掉一块 IDF。向量把「${vDoc?.title ?? topV.docId}」捞到了第 ${topV.rank}（词重叠 ${topV.matchedTerms.length}）。两路一起走，才是 RAG 该有的姿势。`,
        };
  }
  if (same && vectorOnly && vOnlyDoc && vectorOnly.matchedTerms.length < bundle.queryTerms.length) {
    return locale === "en"
      ? {
          kicker: "Exact Matching is Irreplaceable",
          body: `Both lanes placed "${bDoc?.title}" first, hitting ${topB.matchedTerms.join(" · ")}. Yet vector still placed "${vOnlyDoc.title}" at #${vectorOnly.rank} despite ${vectorOnly.matchedTerms.length ? "only partial term overlap" : "zero exact term overlap"}. The sparse BM25 half remains indispensable.`,
        }
      : {
          kicker: "精确匹配仍无可替代",
          body: `两路都把「${bDoc?.title}」放第一，它同时命中 ${topB.matchedTerms.join(" · ")}。但向量仍把「${vOnlyDoc.title}」排在第 ${vectorOnly.rank}——${vectorOnly.matchedTerms.length ? "词只对上一部分" : "词一项都没对上"}。稀疏那一半，至今无可替代。`,
        };
  }
  if (same) {
    const isRrf = bundle.fusion === "rrf";
    return locale === "en"
      ? {
          kicker: "Both Lanes Agree",
          body: isRrf
            ? `"${bDoc?.title ?? topB.docId}" is ranked #1 in both BM25 and vector lanes. Rank fusion (RRF k=${bundle.rrfK}) is robust against score distribution differences.`
            : `"${bDoc?.title ?? topB.docId}" is ranked #1 in both BM25 and vector lanes. Max-norm weighted fusion (α=${bundle.bm25Weight.toFixed(2)}) firmly keeps it at the top.`,
        }
      : {
          kicker: "这一次两路同意",
          body: isRrf
            ? `「${bDoc?.title ?? topB.docId}」在 BM25 与向量都排第一。混合（RRF k=${bundle.rrfK}）按排名融合，往往比简单加权更稳。`
            : `「${bDoc?.title ?? topB.docId}」在 BM25 与向量都排第一。最大值归一加权（α=${bundle.bm25Weight.toFixed(2)}）后仍稳居首位。`,
        };
  }
  return locale === "en"
    ? {
        kicker: "Most Failures Lie in Retrieval",
        body: `BM25 leader "${bDoc?.title}", vector leader "${vDoc?.title}", and hybrid result is "${byId.get(topH.docId)?.title}". Without accurate retrieval, downstream LLMs hallucinate.`,
      }
    : {
        kicker: "九成问题出在检索",
        body: `BM25 头名「${bDoc?.title}」，向量头名「${vDoc?.title}」，混合后是「${byId.get(topH.docId)?.title}」。召回不到正确文档，再强的模型也只能一本正经地胡说。`,
      };
}
