# bm25-explain

Isolated playground for Lucene BM25 scoring, term saturation, document length penalty, and hybrid search fusion.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4 + Zustand. No router, auth, or server backend.

## Commands

From this directory, or `make dev-study STUDY=bm25-explain` at repo root:

```bash
npm run dev          # http://127.0.0.1:5201/
npm test             # algorithm, tokenizer, and scoring unit tests
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/bm25-explain`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/StageView.tsx` — one locked state fixture for stage capture
- `src/lib/bm25/` — pure TypeScript in-memory IR engine:
  - `types.ts` — token, posting, hit, bundle data structures
  - `stopwords.ts` / `stemmer.ts` / `tokenize.ts` — tokenizer & linguistic analyzers
  - `index-builder.ts` — inverted index construction & postings list
  - `score.ts` — Lucene BM25 math & term contribution breakdown
  - `semantic.ts` — dense vector / cosine similarity simulation
  - `hybrid.ts` — RRF & normalized weighted fusion
  - `explain.ts` — formulas, insight cards, and explanation helpers
  - `engine.ts` — unified `search()` entry
  - `engine.test.ts` — unit tests
- `src/components/` — UI components and views (CompareView, ScoreView, PipelineView, SaturationChart, DocPanel, QueryDock, FormulaSheet, HitList)
- `src/bm25/bm25.css` — scoped study theme tokens (@theme for bm25/vector), slider styling, and animations

## Rules

- Keep the search & scoring engine completely pure (no DOM/React dependencies in `src/lib/bm25/`).
- Relative imports only (`./...` or `../...`). The lab compiles this tree from outside this folder; `@/` aliases will fail when imported by the lab.
- Scoped tokens: align with `design/tokens.css` with dark mode support.
- Bind the standalone dev server to `127.0.0.1:5201`.
