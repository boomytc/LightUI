import { create } from "zustand";
import { DEMO_DOCS, PRESET_QUERIES } from "./bm25/corpus.ts";
import { DEFAULT_OPTIONS, search } from "./bm25/engine.ts";
import type { EngineOptions, FusionMode, LabDocument, SearchBundle } from "./bm25/types.ts";

export type TabId = "compare" | "score" | "pipeline";

export interface LabState extends EngineOptions {
  documents: LabDocument[];
  query: string;
  tab: TabId;
  selectedDocId: string;
  docsOpen: boolean;
  setQuery: (query: string) => void;
  setTab: (tab: TabId) => void;
  setSelectedDocId: (id: string) => void;
  setK1: (k1: number) => void;
  setB: (b: number) => void;
  setRrfK: (rrfK: number) => void;
  setSubword: (subword: boolean) => void;
  setDropStopwords: (dropStopwords: boolean) => void;
  setFusion: (fusion: FusionMode) => void;
  setBm25Weight: (bm25Weight: number) => void;
  setDocsOpen: (open: boolean) => void;
  upsertDoc: (doc: LabDocument) => void;
  removeDoc: (id: string) => void;
  resetCorpus: () => void;
}

export const useLabStore = create<LabState>()((set) => ({
  documents: DEMO_DOCS,
  query: PRESET_QUERIES[0]!.q,
  tab: "compare",
  selectedDocId: "d2",
  docsOpen: false,
  ...DEFAULT_OPTIONS,
  setQuery: (query) => set({ query }),
  setTab: (tab) => set({ tab }),
  setSelectedDocId: (selectedDocId) => set({ selectedDocId }),
  setK1: (k1) => set({ k1 }),
  setB: (b) => set({ b }),
  setRrfK: (rrfK) => set({ rrfK }),
  setSubword: (subword) => set({ subword }),
  setDropStopwords: (dropStopwords) => set({ dropStopwords }),
  setFusion: (fusion) => set({ fusion }),
  setBm25Weight: (bm25Weight) => set({ bm25Weight }),
  setDocsOpen: (docsOpen) => set({ docsOpen }),
  upsertDoc: (doc) =>
    set((s) => {
      const i = s.documents.findIndex((d) => d.id === doc.id);
      if (i === -1) return { documents: [...s.documents, doc] };
      const next = s.documents.slice();
      next[i] = doc;
      return { documents: next };
    }),
  removeDoc: (id) =>
    set((s) => ({
      documents: s.documents.filter((d) => d.id !== id),
      selectedDocId: s.selectedDocId === id ? (s.documents.find((d) => d.id !== id)?.id ?? "") : s.selectedDocId,
    })),
  resetCorpus: () =>
    set({
      documents: DEMO_DOCS,
      query: PRESET_QUERIES[0]!.q,
      selectedDocId: "d2",
      ...DEFAULT_OPTIONS,
    }),
}));

export function useBundle(): SearchBundle {
  const documents = useLabStore((s) => s.documents);
  const query = useLabStore((s) => s.query);
  const k1 = useLabStore((s) => s.k1);
  const b = useLabStore((s) => s.b);
  const rrfK = useLabStore((s) => s.rrfK);
  const subword = useLabStore((s) => s.subword);
  const dropStopwords = useLabStore((s) => s.dropStopwords);
  const fusion = useLabStore((s) => s.fusion);
  const bm25Weight = useLabStore((s) => s.bm25Weight);
  return search(documents, query, { k1, b, rrfK, subword, dropStopwords, fusion, bm25Weight });
}
