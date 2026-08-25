import type { RankedHit } from "./types.ts";

function rankedPositive(hits: RankedHit[]): Map<string, number> {
  const pos = hits.filter((h) => h.score > 1e-12);
  const map = new Map<string, number>();
  pos.forEach((h, i) => map.set(h.docId, i + 1));
  return map;
}

function fuseHit(
  id: string,
  b: RankedHit | undefined,
  v: RankedHit | undefined,
  score: number,
  extra: Partial<RankedHit>,
): RankedHit {
  return {
    docId: id,
    score,
    rank: 0,
    matchedTerms: b?.matchedTerms ?? v?.matchedTerms ?? [],
    missingTerms: b?.missingTerms ?? v?.missingTerms ?? [],
    contributions: b?.contributions ?? [],
    cosine: v?.cosine,
    bm25Rank: extra.bm25Rank,
    vectorRank: extra.vectorRank,
    rrf: extra.rrf,
    bm25Norm: extra.bm25Norm,
    vectorNorm: extra.vectorNorm,
  };
}

/** Reciprocal Rank Fusion — often stabler than raw-score weighted sum. */
export function reciprocalRankFusion(
  bm25: RankedHit[],
  vector: RankedHit[],
  rrfK: number,
): RankedHit[] {
  const k = Math.max(1, rrfK);
  const bm25Rank = rankedPositive(bm25);
  const vecRank = rankedPositive(vector);
  const bm25ById = new Map(bm25.map((h) => [h.docId, h]));
  const vecById = new Map(vector.map((h) => [h.docId, h]));
  const ids = new Set([...bm25Rank.keys(), ...vecRank.keys()]);

  const hits: RankedHit[] = [];
  for (const id of ids) {
    const br = bm25Rank.get(id);
    const vr = vecRank.get(id);
    const rrf = (br ? 1 / (k + br) : 0) + (vr ? 1 / (k + vr) : 0);
    hits.push(
      fuseHit(id, bm25ById.get(id), vecById.get(id), rrf, {
        rrf,
        bm25Rank: br,
        vectorRank: vr,
      }),
    );
  }
  hits.sort((a, b) => b.score - a.score || a.docId.localeCompare(b.docId));
  hits.forEach((h, i) => {
    h.rank = i + 1;
  });
  return hits;
}

/** Max-norm (按最大值归一) 加权融合：两路各自除以最大值后按权重 α 线性加和。 */
export function weightedFusion(
  bm25: RankedHit[],
  vector: RankedHit[],
  bm25Weight: number,
): RankedHit[] {
  const w = Math.min(1, Math.max(0, bm25Weight));
  const maxB = Math.max(...bm25.map((h) => h.score), 1e-12);
  const maxV = Math.max(...vector.map((h) => h.score), 1e-12);
  const bm25Rank = rankedPositive(bm25);
  const vecRank = rankedPositive(vector);
  const bm25ById = new Map(bm25.map((h) => [h.docId, h]));
  const vecById = new Map(vector.map((h) => [h.docId, h]));
  const ids = new Set([...bm25ById.keys(), ...vecById.keys()]);

  const hits: RankedHit[] = [];
  for (const id of ids) {
    const b = bm25ById.get(id);
    const v = vecById.get(id);
    const bn = (b?.score ?? 0) / maxB;
    const vn = (v?.score ?? 0) / maxV;
    const score = w * bn + (1 - w) * vn;
    if (score <= 1e-12) continue;
    hits.push(
      fuseHit(id, b, v, score, {
        bm25Rank: bm25Rank.get(id),
        vectorRank: vecRank.get(id),
        bm25Norm: bn,
        vectorNorm: vn,
      }),
    );
  }
  hits.sort((a, b) => b.score - a.score || a.docId.localeCompare(b.docId));
  hits.forEach((h, i) => {
    h.rank = i + 1;
  });
  return hits;
}
