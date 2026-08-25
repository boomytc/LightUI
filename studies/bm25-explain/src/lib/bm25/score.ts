import { luceneIdf } from "./index-builder.ts";
import type { InvertedIndex, RankedHit, TermContribution } from "./types.ts";

export function tfNorm(tf: number, dl: number, avgdl: number, k1: number, b: number): number {
  const denom = tf + k1 * (1 - b + b * (avgdl === 0 ? 0 : dl / avgdl));
  if (denom === 0) return 0;
  return (tf * (k1 + 1)) / denom;
}

export function scoreBm25(
  index: InvertedIndex,
  queryTerms: string[],
  documents: { id: string }[],
  k1: number,
  b: number,
): RankedHit[] {
  const idf = new Map<string, number>();
  for (const t of queryTerms) {
    idf.set(t, luceneIdf(index.nDocs, index.df.get(t) ?? 0));
  }

  const hits: RankedHit[] = documents.map((d) => {
    const dl = index.docLen.get(d.id) ?? 0;
    const contributions: TermContribution[] = [];
    const matched: string[] = [];
    const missing: string[] = [];
    let score = 0;
    for (const term of queryTerms) {
      const posting = index.postings.get(term)?.find((p) => p.docId === d.id);
      const tf = posting?.tf ?? 0;
      const df = index.df.get(term) ?? 0;
      const idfT = idf.get(term) ?? 0;
      const norm = tf === 0 ? 0 : tfNorm(tf, dl, index.avgdl, k1, b);
      const contribution = idfT * norm;
      score += contribution;
      contributions.push({
        term,
        raw: term,
        tf,
        df,
        idf: idfT,
        tfNorm: norm,
        contribution,
      });
      if (tf > 0) matched.push(term);
      else missing.push(term);
    }
    return {
      docId: d.id,
      score,
      rank: 0,
      matchedTerms: matched,
      missingTerms: missing,
      contributions,
    };
  });

  hits.sort((a, b) => b.score - a.score || a.docId.localeCompare(b.docId));
  hits.forEach((h, i) => {
    h.rank = i + 1;
  });
  return hits;
}
