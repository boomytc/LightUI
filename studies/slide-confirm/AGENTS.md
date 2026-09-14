# Slide Confirm Study Instructions

Read repository root `AGENTS.md` first.

## Scope

This study examines continuous physical displacement confirmation (Slide to Confirm) for high-stakes irreversible actions, focusing on damping resistance, directional commitment, release rollback, and threshold adjudication.

## Local verification

```bash
npm test             # run pure machines tests
npm run typecheck    # verify typescript
npm run dev          # standalone playground at 127.0.0.1:5220
```

## Boundaries

- Pure algorithms live in `src/lib/machines.ts` without DOM dependencies.
- `StudyView.tsx` uses relative imports only.
- Tokens are imported from repository `design/tokens.css`.
