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

## 录制模型样本

`npm run record -w @lightui/sandbox-bridge` 读取 `DEEPSEEK_API_KEY`，向 DeepSeek 要一段流式 JSON。请求体里的模型名来自环境变量 `DEEPSEEK_MODEL`，没有设置时用 `deepseek-chat`。样本对象里的 `model` 记的是接口实际回报的名字，不是这次请求用的名字。实测这份接口会把请求名 `deepseek-chat` 回报成 `deepseek-flash`，这是服务端别名。

没有 `DEEPSEEK_API_KEY` 时脚本直接退出，不改文件。页面继续用手写离线流。`src/lib/recorded-sample.ts` 在未录制时保持 `recordedSample = null`。

录完之后，脚本用页面同一套解析和状态机逐项校验，并打印每一项是通过还是失败：六个字段是否按序到达，每个 `*Complete` 是否在该字段内容结束时才置位、`generating` 是否最后落下，`jsFunctions` 是否在 `jsFunctionsComplete` 之前不注入，`jsExpressions` 是否只执行已经闭合的条目（未闭合的那一条在字段完成前不执行），`initialHeight` 是否钳在 50–4000，样本里的 `sendPrompt` / `openLink` 是否放行（文本去掉首尾空白后长度 1–4000，链接只允许 https，带未知字段的消息拒绝），以及把样本改成 http 链接或加进未知字段后是否被拒。任一项失败，进程以非零状态退出，并且不写 `src/lib/recorded-sample.ts`。

真录进当前分支：

1. 在有密钥的机器上运行 `npm run record -w @lightui/sandbox-bridge`，确认逐项校验都通过。
2. 在仓库根目录运行 `npm test`。`recordedSample` 不为 null 时，同一组校验会把样本 `source` 切成小块，喂进页面用的解析和状态机；为 null 时这组测试跳过。
3. 把生成的 `studies/sandbox-bridge/src/lib/recorded-sample.ts` 作为普通提交推到当前分支。不要改写历史，不要强推。
