# overlay-taxonomy

浮在页面上不是同一种东西。先问打不打断当前任务，以及是否贴着触发点。

理念说明见 [idea.md](idea.md)。

## 运行

独立 playground：

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5183/`。

在 Lab 里打开：`make dev` → `http://127.0.0.1:5173/s/overlay-taxonomy`。

建议按这个顺序点一遍，对照会最清楚：

1. 居中弹窗：删除确认，点遮罩关不掉，Esc / 取消 / 确认才关，焦点回到删除
2. 侧边抽屉：编辑商品，列表还在，点遮罩可关
3. 气泡：头像四项，删除账号再唤起弹窗——轻操作和重决策分开
4. 文字提示：悬停信息图标，延迟后出一句，不可点
5. 底部操作层：分享从底下推上来，点遮罩可关，不是右侧抽屉

舞台查询：`?stage=1&kind=modal|drawer|popover|tooltip|sheet&state=open|closed`，默认 `modal` / `open`。
