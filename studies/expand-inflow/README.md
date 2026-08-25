# expand-inflow

多出来的内容先问撑开文档流还是盖一层。互斥还是独立，是流里的第二问。不要把抽屉再做一遍。

理念说明见 [idea.md](idea.md)。

## 运行

独立 playground：

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5206/`。

在 Lab 里打开：`make dev` → `http://127.0.0.1:5173/s/expand-inflow`。

建议按这个顺序点一遍，对照会最清楚：

1. 手风琴：开 B 关 A，两块高度同时走 `0fr` / `1fr`，后面的段落往下让
2. 折叠：三块可以同时开着，看 `OPEN n/total`
3. 树：箭头只展开，名字只选路径，面包屑跟选中走
4. 行详情：点一行，详情插在这一行和下一行之间，后面的行往下移——不是浮层
5. 读更多：三行高到全文，按钮「展开全文」↔「收起」
6. 卡片：同一张卡就地变高，标题还在流里；多出来的块先长高再淡入

舞台查询：`?stage=1&kind=accordion|collapse|tree|row|readmore|card`。手风琴 `state=a|b`，树 `state=expanded|collapsed`，其余 `open|closed`。默认 `accordion` / `a`。
