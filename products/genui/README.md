# @lightui/genui

生成式 UI 的产品根，与 `products/lab` 平级。这里放可供 agent 选用的原生组件、组件注册表，以及带版本号的契约。

当前是骨架：只有一个示例组件 `Text`，用来证明入口、注册表和契约文件是同一条链路。没有组件库，没有 iframe 沙盒。

## 公开入口

外部只引用包名：

```ts
import { registry, Text } from "@lightui/genui";
```

它指向 `src/index.ts`。`package.json` 的 `exports` 只暴露这一条。不要引用 `src/components/*`、`src/registry.ts` 或 `contract/*`。

`products/genui` 不引用 `studies/*` 或 `products/lab`。study 和 lab 也不能钻进本包的内部路径。`npm test` 与 `npm run typecheck` 会检查这三条方向，违规即失败。

## 契约

`contract/v0/components.json` 是外部 agent（LightAgent）读取的唯一契约，协议版本 **v0**。不要从实现里临时导出这份清单。实现侧注册表在 `src/registry.ts`，测试会对照契约文件，不一致即失败。

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
