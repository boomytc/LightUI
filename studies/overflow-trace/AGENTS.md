# overflow-trace

Read root AGENTS.md. This study compares geometry, clipping, and constraint repair.

- Pure boundary decisions live in src/lib/machines.ts; DOM measurement stays in Fixture.tsx.
- Only the fixture may intentionally overflow. Keep the teaching page usable at 375px.
- Stage locks kind=width|negative|text|fixed|absolute|all, state=bug|hide|fix.
- Relative imports; tokens from design/tokens.css. No auth, API, or router.
- Dev: 127.0.0.1:5235. npm test, npm run typecheck, npm run build.
