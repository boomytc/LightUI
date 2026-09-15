# Cone Reveal (锥光揭密)

> 密文该整段揭开，还是只让锥光碰到的字形现身？指针从固定原点射出锥光，只有落在锥内的字形变成明文。

## Structure

- `idea.md` / `idea.en.md` — Core design rationale and naive alternatives
- `study.json` — Catalog entry and graph relations
- `src/lib/machines.ts` — Pure cone coverage, reveal, and search-angle math
- `src/lib/machines.test.ts` — Unit tests (`tsx --test`)
- `src/StudyView.tsx` — Educational playground (cone / whole-string / nearest)
- `src/StageView.tsx` — Clean fixture view (`?stage=1`)

## Development

```bash
npm run dev --workspace=@lightui/cone-reveal
# or
make dev-study STUDY=cone-reveal
```

Runs the standalone playground at `http://127.0.0.1:5227/`.
Add `?stage=1` to view the stage fixture.
