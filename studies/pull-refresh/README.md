# @lightui/pull-refresh

> 下拉手势何时接管滚动、何时提交刷新？顶边且向下才接管；位移应用阻尼并设上限；松手超阈值才提交刷新，未达阈值弹性复位。

Playground 把接管条件、0.42 阻尼、56px 阈值和刷新吸顶摊在列表旁边读。手势计算仍走 `src/lib/machines.ts`。

## Run

```bash
make dev-study STUDY=pull-refresh
```
Port: `5211`.
