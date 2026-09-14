# Slide Confirm (滑动确认)

> 高危不可逆操作，如何用连续物理位移杜绝误触疲劳？滑动确认强制用户执行一段明确矢量位移，中途释放弹性回弹，超过临界阈值完成承诺锁定。

## Structure

- `idea.md` / `idea.en.md` — Core design rationale and interaction models
- `study.json` — Catalog entry and graph relations
- `src/lib/machines.ts` — Pure mathematical algorithms and damping formulas
- `src/lib/machines.test.ts` — Unit tests (`tsx --test`)
- `src/StudyView.tsx` — Educational interactive playground
- `src/StageView.tsx` — Clean fixture view (`?stage=1`)

## Development

```bash
npm run dev --workspace=@lightui/slide-confirm
# or
make dev-study STUDY=slide-confirm
```

Runs the standalone playground at `http://127.0.0.1:5220/`.
Add `?stage=1` to view the stage fixture.
