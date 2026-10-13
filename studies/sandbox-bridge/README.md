# @lightui/sandbox-bridge

宿主和 iframe 沙盒之间的消息桥。流按 `initialHeight`、`placeholderMessages`、`css`、`html`、`jsFunctions`、`jsExpressions` 长大。`html` 和 `jsExpressions` 是字符串数组。样式没完成前只显示占位；高度只采用沙盒报上来、并且落在 50–4000 里的有限数字；回传只有 `sendPrompt` 和 `openLink` 能过校验。

页面回放离线样例，不在浏览器里调用模型。

## Commands

```bash
npm run dev -w @lightui/sandbox-bridge
npm test -w @lightui/sandbox-bridge
npm run typecheck -w @lightui/sandbox-bridge
```

Binds to `http://127.0.0.1:5234`.
Stage fixture: `http://127.0.0.1:5234/?stage=1`

Lab: `/s/sandbox-bridge`.

## Record a model sample

`npm run record -w @lightui/sandbox-bridge` reads `DEEPSEEK_API_KEY` and, on a successful streamed completion, writes `src/lib/recorded-sample.ts`. Without that variable the script exits and leaves the hand-authored stream in place.
