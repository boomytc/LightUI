# LightUI site (`products/lab`)

Public face of the workspace: portfolio of studies, graph, notes.
This directory is a product root.

## Commands

```bash
npm run dev          # http://127.0.0.1:5173/
npm test
npm run typecheck
npm run build
```

From workspace root: `make dev`.

## Rules

- Discover studies via `src/lib/catalog.ts`. Discover notes via
  `src/lib/notes.ts` (`writing/notes/*.md`). No hand-written registries.
- The judgment graph is assembled from `study.json` `asks` + `links`
  (`src/lib/graph.ts`) and shown at `/graph`. Do not keep a second map.
- Study playgrounds stay in `studies/<slug>/`. Writing stays in `writing/`.
- Tokens come from `design/tokens.css`.
- Bind to `127.0.0.1`.
- Keep routing in `src/lib/nav.ts`.
- `/s/<slug>/stage` is the fixture stage. Do not add it to the site nav.

See `docs/study-contract.md`, `docs/writing.md`, and `skills/lightui-lab/SKILL.md`.
