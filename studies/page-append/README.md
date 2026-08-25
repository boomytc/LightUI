# page-append

一批记录先问整页替换还是末尾追加。翻页会丢掉上一页并回到顶部；追加只增加 visibleCount，旧节点不卸。

理念说明见 [idea.md](idea.md)。

## 运行

独立 playground：

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5207/`。

在 Lab 里打开：`make dev` → `http://127.0.0.1:5173/s/page-append`。

建议按这个顺序点一遍，对照会最清楚：

1. 翻页：滚一下列表，点第 2 页。上一页的卡片卸掉，列表回到顶部，高亮滑到 2。范围是 showing a–b of n
2. 追加：点「加载更多」。旧卡还在（同一个 id），新卡出现在末尾，不要回到顶部。到底后按钮变成「已加载全部」。范围是 showing 1–k of n

舞台查询：`?stage=1&kind=page|append&state=page1|page2|partial|exhausted`，默认 `page` / `page1`。
