# sandbox-bridge

Isolated playground for a host/iframe bridge: ordered streaming fields, clamped height reports, and a two-function callback whitelist.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind v4. No router. The page replays a recorded stream and does not call a model.

## Commands

From this directory, or `make dev-study STUDY=sandbox-bridge` at repo root:

```bash
npm run dev          # http://127.0.0.1:5234/
npm test             # stream parser, height clamp, callback whitelist
npm run typecheck
npm run build
npm run record       # optional: DEEPSEEK_API_KEY writes src/lib/recorded-sample.ts
```

The lab mounts `StudyView` at `/s/sandbox-bridge`.

## Layout

- `idea.md` / `study.json` — field order, height clamp, whitelist
- `src/StudyView.tsx` — playback and probes
- `src/lib/machines.ts` — pure stream parser and message decisions
- `src/lib/frame.ts` — sandboxed document shell
- `src/lib/samples.ts` — hand-authored offline stream
- `src/StageView.tsx` — locked fixture
- `src/lib/stage-query.ts` — `kind=stream|bridge`, `state=placeholder|preview|final|rejected`

## Rules

- Keep machines free of React and DOM.
- Relative imports only. The lab compiles this tree from outside this folder.
- The iframe uses `sandbox="allow-scripts"` and the host checks `event.source`.
- Do not import `products/genui` internals or `contract/`. Do not put API keys in the client.
- Bind the standalone server to `127.0.0.1:5234`.
