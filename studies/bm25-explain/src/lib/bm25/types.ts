export type TokenKind = "cjk" | "latin" | "number";
export type FusionMode = "rrf" | "weighted";

export interface Token {
  raw: string;
  term: string;
  start: number;
  end: number;
  kind: TokenKind;
  stopped: boolean;
  subword: boolean;
}

export interface LabDocument {
  id: string;
  title: string;
  body: string;
  note?: string;
  noteEn?: string;
}

export interface Posting {
  docId: string;
  tf: number;
  positions: number[];
}

export interface InvertedIndex {
  postings: Map<string, Posting[]>;
  docLen: Map<string, number>;
  avgdl: number;
  nDocs: number;
  df: Map<string, number>;
  tokensByDoc: Map<string, Token[]>;
}

export interface TermContribution {
  term: string;
  raw: string;
  tf: number;
  df: number;
  idf: number;
  tfNorm: number;
  contribution: number;
}

export interface RankedHit {
  docId: string;
  score: number;
  rank: number;
  matchedTerms: string[];
  missingTerms: string[];
  contributions: TermContribution[];
  cosine?: number;
  rrf?: number;
  bm25Rank?: number;
  vectorRank?: number;
  bm25Norm?: number;
  vectorNorm?: number;
}

export interface SearchBundle {
  query: string;
  queryTokens: Token[];
  queryTerms: string[];
  index: InvertedIndex;
  bm25: RankedHit[];
  vector: RankedHit[];
  hybrid: RankedHit[];
  k1: number;
  b: number;
  rrfK: number;
  fusion: FusionMode;
  bm25Weight: number;
  /** Boolean AND: every query term present. */
  candidates: string[];
  /** Boolean OR: at least one query term — the set BM25 actually scores above 0. */
  orCandidates: string[];
}

export interface EngineOptions {
  k1: number;
  b: number;
  rrfK: number;
  subword: boolean;
  dropStopwords: boolean;
  fusion: FusionMode;
  bm25Weight: number;
}
