# 溢出定位

比较原始越界、仅隐藏、修复根因。容器可调宽，检测实际几何边界。

`make dev-study STUDY=overflow-trace` → http://127.0.0.1:5235/

`npm test` 验证左右边界与舍入容差；`npm run typecheck`、`npm run build` 检查源码。

Lab: `/s/overflow-trace`。舞台：`/s/overflow-trace/stage?kind=all&state=hide`。
