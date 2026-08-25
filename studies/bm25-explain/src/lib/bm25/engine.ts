import { reciprocalRankFusion, weightedFusion } from "./hybrid.ts";
import { buildIndex, intersectPostings, unionPostings } from "./index-builder.ts";
import { scoreBm25 } from "./score.ts";
import { scoreVector } from "./semantic.ts";
import { tokenize, uniqueTerms } from "./tokenize.ts";
import type { EngineOptions, LabDocument, SearchBundle } from "./types.ts";

export const DEFAULT_OPTIONS: EngineOptions = {
  k1: 1.2,
  b: 0.75,
  rrfK: 60,
  subword: false,
  dropStopwords: true,
  fusion: "rrf",
  bm25Weight: 0.55,
};

export function search(
  documents: LabDocument[],
  query: string,
  options: Partial<EngineOptions> = {},
): SearchBundle {
  const opts: EngineOptions = { ...DEFAULT_OPTIONS, ...options };
  const q = query.trim();
  const queryTokens = q
    ? tokenize(q, { dropStopwords: opts.dropStopwords, subword: opts.subword })
    : [];
  const queryTerms = uniqueTerms(queryTokens.filter((t) => !t.subword));
  const index = buildIndex(documents, {
    subword: opts.subword,
    dropStopwords: opts.dropStopwords,
  });
  const emptyHits = documents.map((d, i) => ({
    docId: d.id,
    score: 0,
    rank: i + 1,
    matchedTerms: [] as string[],
    missingTerms: [] as string[],
    contributions: [],
  }));
  const bm25 = q
    ? scoreBm25(index, queryTerms, documents, opts.k1, opts.b)
    : emptyHits;
  const vector = q
    ? scoreVector(documents, q, {
        subword: false,
        dropStopwords: opts.dropStopwords,
      })
    : bm25.map((h) => ({ ...h, cosine: 0 }));
  const hybrid = !q
    ? bm25
    : opts.fusion === "weighted"
      ? weightedFusion(bm25, vector, opts.bm25Weight)
      : reciprocalRankFusion(bm25, vector, opts.rrfK);
  const candidates = q ? intersectPostings(index, queryTerms) : [];
  const orCandidates = q ? unionPostings(index, queryTerms) : [];

  return {
    query: q,
    queryTokens,
    queryTerms,
    index,
    bm25,
    vector,
    hybrid,
    k1: opts.k1,
    b: opts.b,
    rrfK: opts.rrfK,
    fusion: opts.fusion,
    bm25Weight: opts.bm25Weight,
    candidates,
    orCandidates,
  };
}

export { tokenize, uniqueTerms };
