# table-taxonomy

找、看、改，分别落在记录表的哪一层？筛在这一列的表头，条件留在上方；表头钉在表自己的滚动区，名称列不能藏；一行只露出查看；有勾选，批量条才换掉搜索。

理念说明见 [idea.md](idea.md)。

## 运行

独立 playground：

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5231/`。

在 Lab 里打开：`make dev` → `http://127.0.0.1:5173/s/table-taxonomy`。

舞台：`/s/table-taxonomy/stage?kind=filter&state=open`（默认）。排序：`kind=sort&state=desc`。固定表头：`kind=sticky&state=scrolled`。行操作：`kind=actions&state=open`。列：`kind=columns&state=open`。批量：`kind=bulk&state=selected`。已选条件：`kind=chips&state=applied`。

建议按这个顺序点一遍，对照会最清楚：

1. 表头筛选：从标签表头勾「重点客户」，表先不变，点应用才少几行。
2. 列排序：点金额，从高到低，再点一次反过来，条数还是那么多。
3. 固定表头：在表格里面往下翻，列名留在滚动区顶部。
4. 行操作：一行是查看。更多里才有编辑、复制、删除。
5. 自定义列：名称是灰的，关不掉。更新时间可以打开。
6. 批量操作：勾两行，搜索让开，条上写着已选数量。全选不会勾上被筛掉的人。
7. 已选条件：每枚可以单独摘。清空之后，名称搜索还在。
