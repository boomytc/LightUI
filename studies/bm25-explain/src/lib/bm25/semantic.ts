import { tokenize, uniqueTerms } from "./tokenize.ts";
import type { LabDocument, RankedHit } from "./types.ts";

/**
 * Tiny concept space so the lab can show the video's point:
 * 「营收增长」vs「收入提升」are neighbors in meaning, not in BM25.
 * Not a real embedding model — a transparent, inspectable stand-in.
 */
const CONCEPTS: { name: string; terms: string[] }[] = [
  { name: "finance", terms: ["营收", "收入", "营业收入", "销售额", "财务", "估值", "贴现", "现金流", "毛利率", "净利润", "财务分析", "财务分析方法论"] },
  { name: "revenue", terms: ["营收", "收入", "营业收入", "销售额"] },
  { name: "growth", terms: ["增长", "提升", "上涨", "增加", "同比", "同比增长"] },
  { name: "decline", terms: ["下滑", "下降", "减少"] },
  { name: "q3", terms: ["q3"] },
  { name: "q2", terms: ["q2"] },
  { name: "year", terms: ["2024", "2023"] },
  { name: "apple", terms: ["苹果", "apple", "iphone"] },
  { name: "phone", terms: ["手机", "phone", "smartphone"] },
  { name: "review", terms: ["评测", "测评", "review"] },
  { name: "fin_method", terms: ["财务", "分析", "方法论", "估值", "贴现", "现金流", "可比", "框架", "财务分析", "财务分析方法论", "估值模型"] },
  { name: "nlp", terms: ["自然语言处理", "自然语言", "分词", "nlp", "句法", "语义"] },
  { name: "learn", terms: ["learn", "algorithm", "model", "学习", "算法", "模型"] },
  { name: "code", terms: ["getq3revenue", "revenuebyquarter", "function", "export"] },
];

const TERM_TO_CONCEPT = new Map<string, number[]>();
CONCEPTS.forEach((c, i) => {
  for (const t of c.terms) {
    const list = TERM_TO_CONCEPT.get(t) ?? [];
    list.push(i);
    TERM_TO_CONCEPT.set(t, list);
  }
});

const CONCEPT_N = CONCEPTS.length;
const HASH_N = 24;
const DIM = CONCEPT_N + HASH_N;
const CONCEPT_W = 4;
const HASH_W = 0.2;

function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function embedTerms(terms: string[]): Float64Array {
  const v = new Float64Array(DIM);
  for (const t of terms) {
    const cis = TERM_TO_CONCEPT.get(t);
    if (cis) {
      for (const ci of cis) v[ci] += CONCEPT_W;
      continue;
    }
    const h = hash32(t);
    const dim = CONCEPT_N + (h % HASH_N);
    const sign = h & 1 ? 1 : -1;
    v[dim] += sign * HASH_W;
  }
  return v;
}

export function cosine(a: Float64Array, b: Float64Array): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    na += a[i]! * a[i]!;
    nb += b[i]! * b[i]!;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function conceptHits(terms: string[]): string[] {
  const names: string[] = [];
  const seen = new Set<string>();
  for (const t of terms) {
    const ids = TERM_TO_CONCEPT.get(t);
    if (!ids) continue;
    for (const i of ids) {
      const n = CONCEPTS[i]!.name;
      if (seen.has(n)) continue;
      seen.add(n);
      names.push(n);
    }
  }
  return names;
}

export function scoreVector(
  documents: LabDocument[],
  query: string,
  opts: { subword: boolean; dropStopwords: boolean },
): RankedHit[] {
  const qTerms = uniqueTerms(tokenize(query, { ...opts, subword: false }));
  const qVec = embedTerms(qTerms);
  const hits: RankedHit[] = documents.map((d) => {
    const dTerms = uniqueTerms(
      tokenize(`${d.title} ${d.body}`, { ...opts, subword: false }),
    );
    const sim = cosine(qVec, embedTerms(dTerms));
    const dSet = new Set(dTerms);
    const matched = qTerms.filter((t) => dSet.has(t));
    const missing = qTerms.filter((t) => !dSet.has(t));
    return {
      docId: d.id,
      score: sim,
      rank: 0,
      matchedTerms: matched,
      missingTerms: missing,
      contributions: [],
      cosine: sim,
    };
  });
  hits.sort((a, b) => b.score - a.score || a.docId.localeCompare(b.docId));
  hits.forEach((h, i) => {
    h.rank = i + 1;
  });
  return hits;
}

export { CONCEPTS };
