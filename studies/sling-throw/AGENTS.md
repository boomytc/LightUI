# Sling Throw Study Instructions

Read repository root `AGENTS.md` first.

## Scope

This study examines off-track slingshot throws on a 1-D value rail: a 14px threshold, pull-limited ballistic intercepts, landing quantization, and why clamping back to the track is the wrong grain.

## Local verification

```bash
npm test             # run pure machines tests
npm run typecheck    # verify typescript
npm run dev          # standalone playground at 127.0.0.1:5228
```

## Boundaries

- Pure algorithms live in `src/lib/machines.ts` without DOM dependencies.
- `StudyView.tsx` and `StageView.tsx` use relative imports only.
- Tokens are imported from repository `design/tokens.css`.
