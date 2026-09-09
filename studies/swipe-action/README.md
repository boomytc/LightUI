# Swipe Action (列表侧滑)

> 列表行向左侧滑时，8px 矢量消歧区分纵向滚动与横向侧滑；释放时依据位移与阻尼裁定回弹、吸附露出快捷操作，或超过深滑阈值直接全滑提交删除。

## Structure

- `idea.md` / `idea.en.md` — Core design rationale and interaction models
- `study.json` — Catalog entry and graph relations
- `src/lib/machines.ts` — Pure mathematical algorithms and snap quantization
- `src/lib/machines.test.ts` — Unit tests (`tsx --test`)
- `src/StudyView.tsx` — Educational interactive playground
- `src/StageView.tsx` — Clean fixture view (`?stage=1`)

## Development

```bash
npm run dev --workspace=@lightui/swipe-action
# or
make dev-study STUDY=swipe-action
```

Runs the standalone playground at `http://127.0.0.1:5218/`.
Add `?stage=1` to view the stage fixture.
