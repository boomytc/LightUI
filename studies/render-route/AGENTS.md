# render-route

Isolated playground for choosing how one generated turn is presented: plain text, a native component from the genui contract, or an iframe document.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router and no auth.
The page renders recorded fixtures. It does not call a model and does not read API keys.

## Commands

From this directory, or `make dev-study STUDY=render-route` at repo root:

```bash
npm run dev          # http://127.0.0.1:5233/
npm test             # routeTurn / routeBuffer / live v0 catalog
npm run typecheck
npm run build
npm run accept       # optional; reads DEEPSEEK_API_KEY and rewrites the offline recording
```

The lab mounts `StudyView` at `/s/render-route`.

## Layout

- `idea.md` / `study.json` — three surfaces, then in-place errors
- `src/StudyView.tsx` — compare and error teaching surface
- `src/lib/machines.ts` — route object, schema check, partial JSON (no DOM)
- `src/lib/catalog.ts` — component names and props from `@lightui/genui`
- `src/lib/samples.ts` — offline fixtures
- `src/lib/recording-data.ts` — DeepSeek recording, or an explicit not-run marker
- `src/StageView.tsx` — one locked fixture, no lab chrome
- `src/lib/stage-query.ts` — `kind=compare|error`, `state=text|native|iframe|unknown|props|partial`
- `scripts/accept-deepseek.ts` — writes the recording; not part of `npm test`

## Rules

- Keep `routeTurn` and `routeBuffer` free of React.
- Relative imports only inside this study, plus the public package `@lightui/genui`.
- Do not import `products/genui/contract` or any deep path. Names and props come from the registry.
- Do not mount a component until the JSON has closed and the name and props pass.
- An unknown name (`unknown_component`) or props that fail the schema (`invalid_props`) stay an in-place error. Do not paint that turn as plain text.
- Unclosed JSON stays pending. It is not an error.
- An iframe document is `sandbox="allow-scripts"` without the host origin.
- Bind the standalone server to `127.0.0.1:5233`.
