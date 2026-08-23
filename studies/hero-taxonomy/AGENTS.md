# hero-taxonomy

Isolated playground for naming a first fold by the job it answers.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router, auth, or backend.

## Commands

From this directory, or `make dev-study STUDY=hero-taxonomy` at repo root:

```bash
npm run dev          # http://127.0.0.1:5191/
npm test             # questionOf / primaryCtaCount / allowsCarousel / tooManyBanners
npm run typecheck
npm run build
```

The lab mounts `StudyView` at `/s/hero-taxonomy`.

## Layout

- `idea.md` / `study.json` — extracted rule + catalog metadata
- `src/StudyView.tsx` — teaching surface the lab imports
- `src/lib/machines.ts` — first-glance question, one primary, commerce banners (no DOM)
- `src/heroes/` — eight miniature first-folds in a window frame
- `src/StageView.tsx` — one kind, `state=default`, no chrome
- `src/lib/stage-query.ts` — `kind=product|portfolio|event|commerce|media|education|tool|community`, `state=default`

## Rules

- Keep the first-fold machines free of React.
- Relative imports only (`../lib/...`). The lab compiles this tree from
  outside this folder.
- Extra CSS is imported from a file in the `StudyView` tree (`heroes/hero.css`).
- The first-fold job is not “make a fancy hero”. A landing skeleton is not
  what the first glance answers. The first fold is not a login card.
  Commerce must not rotate five posters.
- Bind the standalone server to `127.0.0.1:5191`.
