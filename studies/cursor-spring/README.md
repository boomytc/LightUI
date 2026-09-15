# Cursor Spring (协作光标)

> 网络只能丢稀疏坐标，协作光标如何平滑跟手？解耦网络采样与屏幕刷新，用二阶弹簧半隐式欧拉积分重建连续轨迹与自然微过冲。

## Structure

- `idea.md` — Core design rationale, dynamics equations, and failure modes of naive alternatives
- `study.json` — Catalog entry and graph relations
- `src/lib/machines.ts` — Pure spring physics, damping ratio formulas, and trail math
- `src/lib/machines.test.ts` — Unit tests (`tsx --test`)
- `src/StudyView.tsx` — Educational interactive comparative playground
- `src/StageView.tsx` — Clean fixture view (`?stage=1`)

## Development

```bash
npm run dev --workspace=@lightui/cursor-spring
# or
make dev-study STUDY=cursor-spring
```

Runs the standalone playground at `http://127.0.0.1:5226/`.
Add `?stage=1` to view the stage fixture.
