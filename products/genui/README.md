# @lightui/genui

生成式 UI 的产品根，与 `products/lab` 平级。这里放可供 agent 选用的原生组件、组件注册表，以及带版本号的契约。

当前组件只有示例 `Text`，用来证明入口、注册表和 `components.json` 是同一条链路。渲染路由错误和沙盒活动的协议在 `contract/v0/render-route.json`、`contract/v0/sandbox.json`，对应的类型和校验从本包入口导出。页面仍在 `studies/render-route` 与 `studies/sandbox-bridge`。

## 公开入口

外部只引用包名：

```ts
import { registry, Text } from "@lightui/genui";
```

它指向 `src/index.ts`。`package.json` 的 `exports` 只暴露这一条。不要引用 `src/components/*`、`src/registry.ts` 或 `contract/*`。

`products/genui` 不引用 `studies/*` 或 `products/lab`。study 和 lab 也不能钻进本包的内部路径。`npm test` 与 `npm run typecheck` 会检查这三条方向，违规即失败。

## 契约

`contract/v0/` 是外部 agent（LightAgent）读取的契约，协议版本 **v0**。不要从实现里生成这些 JSON。`components.json` 对照 `src/registry.ts`；`render-route.json` 与 `sandbox.json` 对照 `src/render-route.ts`、`src/sandbox.ts`。测试不一致即失败。说明见 `docs/protocol-v0.md`。

版本规则见 `contract/README.md`。

## 样式

只用仓库根目录 `design/tokens.css` 里的变量。本包不另起主题。

## 命令

在仓库根目录：

```bash
npm install
npm test
npm run typecheck
npm run build
```

只跑本包：`npm test -w @lightui/genui`。
