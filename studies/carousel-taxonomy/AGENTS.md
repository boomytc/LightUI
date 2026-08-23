# carousel-taxonomy

Isolated playground for naming a set of frames by how the set advances.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=carousel-taxonomy` at repo root:

```bash
npm run dev          # http://127.0.0.1:5188/
npm test             # step / autoplay / fade / spin machines
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/carousel-taxonomy`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/machines.ts` — wrap, autoplay, fade opacity, spin vs slide (no DOM)
- `src/slides/` — kind switcher + the eight fixtures
- `src/slides/slides.css` — motion CSS, imported from a demo TSX
- `src/StageView.tsx` — one kind, one locked index, no chrome
- `src/lib/stage-query.ts` — `kind=classic|fade|coverflow|stack|flip|accordion|spin|parallax`, `state=0|1|2` (index; default `classic` / `1`)

## Rules

- Keep the advance machines free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder.
- Four slides max. Dots always sync the index. Hover pauses autoplay.
  `prefers-reduced-motion` kills autoplay; fade stays opacity-only, others jump.
- Spin rotates a product. It is not a slide list.
- Advancing frames is not a notice marquee. A carousel is not masonry.
  List pagination is not a ninth kind.
- Bind the standalone server to `127.0.0.1:5188`.
- Playground window fills the content column. Kinds sit in a wrapping
  chip row above the stage; spec sits in a compact strip under it.
  StageView stays 390px for stills. No page-level horizontal scroll.
