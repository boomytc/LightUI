import { tokenize } from "./tokenize.ts";
import type { InvertedIndex, LabDocument, Posting, Token } from "./types.ts";

export function buildIndex(
  documents: LabDocument[],
  opts: { subword: boolean; dropStopwords: boolean },
): InvertedIndex {
  const postings = new Map<string, Map<string, Posting>>();
  const docLen = new Map<string, number>();
  const tokensByDoc = new Map<string, Token[]>();

  for (const doc of documents) {
    const text = `${doc.title} ${doc.body}`;
    const tokens = tokenize(text, opts);
    tokensByDoc.set(doc.id, tokens);
    const primary = tokens.filter((t) => !t.subword);
    docLen.set(doc.id, primary.length || tokens.length);

    const byTerm = new Map<string, Posting>();
    primary.forEach((t, i) => {
      let p = byTerm.get(t.term);
      if (!p) {
        p = { docId: doc.id, tf: 0, positions: [] };
        byTerm.set(t.term, p);
      }
      p.tf += 1;
      p.positions.push(i);
    });
    for (const t of tokens) {
      if (!t.subword) continue;
      let p = byTerm.get(t.term);
      if (!p) {
        p = { docId: doc.id, tf: 0, positions: [] };
        byTerm.set(t.term, p);
      }
      p.tf += 1;
    }
    for (const [term, p] of byTerm) {
      let bucket = postings.get(term);
      if (!bucket) {
        bucket = new Map();
        postings.set(term, bucket);
      }
      bucket.set(doc.id, p);
    }
  }

  const flat = new Map<string, Posting[]>();
  const df = new Map<string, number>();
  for (const [term, bucket] of postings) {
    const list = [...bucket.values()];
    flat.set(term, list);
    df.set(term, list.length);
  }

  const nDocs = documents.length;
  let sum = 0;
  for (const len of docLen.values()) sum += len;
  const avgdl = nDocs === 0 ? 0 : sum / nDocs;

  return { postings: flat, docLen, avgdl, nDocs, df, tokensByDoc };
}

export function luceneIdf(nDocs: number, df: number): number {
  // Always-positive IDF used by Elasticsearch / Lucene BM25Similarity.
  // Math.log is ln, matching java.lang.Math.log.
  return Math.log(1 + (nDocs - df + 0.5) / (df + 0.5));
}

/** Boolean AND — docs that contain every query term. */
export function intersectPostings(index: InvertedIndex, terms: string[]): string[] {
  if (terms.length === 0) return [];
  const lists = terms.map((t) => new Set((index.postings.get(t) ?? []).map((p) => p.docId)));
  const first = lists[0]!;
  return [...first].filter((id) => lists.every((s) => s.has(id))).sort();
}

/** Boolean OR — Lucene/ES default SHOULD: any query term is enough to be scored. */
export function unionPostings(index: InvertedIndex, terms: string[]): string[] {
  if (terms.length === 0) return [];
  const ids = new Set<string>();
  for (const t of terms) {
    for (const p of index.postings.get(t) ?? []) ids.add(p.docId);
  }
  return [...ids].sort();
}
