# empty-taxonomy

空白为什么空，该给入口、改关键词、改条件、重试，还是只给完成反馈？创建给入口；搜索改关键词；筛选改条件；失败可重试并保留原列表；完成给反馈不要再催。

理念说明见 [idea.md](idea.md)。

## 运行

独立 playground：

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5229/`。

在 Lab 里打开：`make dev` → `http://127.0.0.1:5173/s/empty-taxonomy`。

舞台：`/s/empty-taxonomy/stage?kind=first-use&state=empty`（默认）。搜索无果：`kind=search&state=miss`。筛选无果：`kind=filter&state=miss`。加载失败：`kind=error&state=banner`。全部完成：`kind=done&state=clear`。

建议按这个顺序点一遍，对照会最清楚：

1. 首次使用：还没有客户，主按钮写清「添加第一位客户」，另留导入。
2. 搜索无果：框里还是「张晓」，框旁写改关键词。空井里不要再放创建主按钮。
3. 筛选无果：上海 + 本周新增 + 已成交还在，点 × 少一个条件。
4. 加载失败：原列表还在，顶部文字重试。不要当成空。
5. 全部完成：今天的跟进已全部完成。不要再催。
