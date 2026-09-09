# Wheel Picker (滚轮选择器)

> 有序离散数据或时间刻度，不要弹虚拟键盘也不要展开60项长列表。上下拨动连续滑动，松手依据滚动吸附中央基准线，离基准线越远透明度与尺寸沿圆柱面几何递减。

## Structure

- `idea.md` / `idea.en.md` — Core design rationale and interaction models
- `study.json` — Catalog entry and graph relations
- `src/lib/machines.ts` — Pure mathematical algorithms and snap quantization
- `src/lib/machines.test.ts` — Unit tests (`tsx --test`)
- `src/StudyView.tsx` — Educational interactive playground
- `src/StageView.tsx` — Clean fixture view (`?stage=1`)

## Development

```bash
npm run dev --workspace=@lightui/wheel-picker
# or
make dev-study STUDY=wheel-picker
```

Runs the standalone playground at `http://127.0.0.1:5217/`.
Add `?stage=1` to view the stage fixture.
