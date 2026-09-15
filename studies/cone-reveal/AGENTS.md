# Cone Reveal Study Instructions

Read repository root `AGENTS.md` first.

## Scope

This study examines per-glyph secret reveal under a directional cone: angular coverage, a soft rim, a tighter test cone than the painted beam, and why a whole-string toggle or nearest-cell hop is the wrong grain.

## Local verification

```bash
npm test             # run pure machines tests
npm run typecheck    # verify typescript
npm run dev          # standalone playground at 127.0.0.1:5227
```

## Boundaries

- Pure algorithms live in `src/lib/machines.ts` without DOM dependencies.
- `StudyView.tsx` and `StageView.tsx` use relative imports only.
- Tokens are imported from repository `design/tokens.css`.
