# Sling Throw (弹弓抛掷)

> 沿轨道调值时，离轨该夹回一维，还是变成弹弓按落点改值？拉过离轨阈值，松手把球送到抛物线与轨道的交点。

## Structure

- `idea.md` / `idea.en.md` — Core design rationale and naive alternatives
- `study.json` — Catalog entry and graph relations
- `src/lib/machines.ts` — Pull cap, intercept, prediction, and quantization
- `src/lib/machines.test.ts` — Unit tests (`tsx --test`)
- `src/StudyView.tsx` — Educational playground (sling / clamp)
- `src/StageView.tsx` — Clean fixture view (`?stage=1`)

## Development

```bash
npm run dev --workspace=@lightui/sling-throw
# or
make dev-study STUDY=sling-throw
```

Runs the standalone playground at `http://127.0.0.1:5228/`.
Add `?stage=1` to view the stage fixture.
