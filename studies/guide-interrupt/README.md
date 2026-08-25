# guide-interrupt

教学不是弹窗，也不是一条提示。先问何时出现、钉在谁身上、靠什么推进、结束后还挡不挡。

理念说明见 [idea.md](idea.md)。

## 运行

独立 playground：

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5204/`。

在 Lab 里打开：`make dev` → `http://127.0.0.1:5173/s/guide-interrupt`。

建议按这个顺序点一遍，对照会最清楚：

1. 漫游：三步挖孔跟着指标卡、标题、发布走，1/3，可下一步或跳过
2. 教练：发布旁气泡，明白了，页面不遮罩
3. 热点：模板上的脉冲圆点，点开再关掉，圆点卸掉
4. 聚光：必须点可见范围，再点发布；没有下一步
5. 清单：勾四项，进度条 scaleX，100% 标题变成入门完成，列表还在
6. 空态：标题空着才提示标题；填了才提示权限；填上就卸掉

舞台查询：`?stage=1&kind=tour|coach|hotspot|spotlight|checklist|hint`。
漫游 `state=step1|step2|done`，热点 `unread|open|read`，其余 `start|mid|done`。默认 `tour` / `step1`。
