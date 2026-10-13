# @lightui/render-route

One generated turn, shown three ways: plain text, a native component from the genui v0 contract, or an iframe document. An unknown name returns `unknown_component` and props that fail the schema return `invalid_props`, both in place, with nothing mounted. Unclosed JSON waits until it closes.

## Commands

```bash
npm run dev -w @lightui/render-route
npm test -w @lightui/render-route
npm run typecheck -w @lightui/render-route
```

Binds to `http://127.0.0.1:5233`.
Stage fixture: `http://127.0.0.1:5233/?stage=1`

`npm run accept -w @lightui/render-route` calls DeepSeek when `DEEPSEEK_API_KEY` is set and rewrites `src/lib/recording-data.ts`. The playground does not read that variable.

## 验收记录里的模型名

记录和脚本输出里分开记两个模型名：

- `requestedModel`：这次请求发出去的名字，取自环境变量 `DEEPSEEK_MODEL`，没有设置时是 `deepseek-chat`。
- `model`：响应体里实际返回的 `model`。同一接口会把请求名 `deepseek-chat` 回报成 `deepseek-flash`，这是服务端别名。

响应里没有 `model` 时，脚本打印错误并以非零状态退出，不改 `src/lib/recording-data.ts`。没有 `DEEPSEEK_API_KEY` 时同样直接退出，不改文件。页面继续用离线样例。
