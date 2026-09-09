# Touch Context Menu (长按上下文)

> 触控长按不是简单弹窗。原地按住约 460ms 且位移在 10px 容差内触发；位移超标立即销毁定时器让路给滚动；菜单紧贴触控点就近浮现并在视口边界自动翻转避让。

## Structure

- `idea.md` / `idea.en.md` — Core design rationale and interaction models
- `study.json` — Catalog entry and graph relations
- `src/lib/machines.ts` — Pure mathematical algorithms and snap quantization
- `src/lib/machines.test.ts` — Unit tests (`tsx --test`)
- `src/StudyView.tsx` — Educational interactive playground
- `src/StageView.tsx` — Clean fixture view (`?stage=1`)

## Development

```bash
npm run dev --workspace=@lightui/touch-context
# or
make dev-study STUDY=touch-context
```

Runs the standalone playground at `http://127.0.0.1:5219/`.
Add `?stage=1` to view the stage fixture.
