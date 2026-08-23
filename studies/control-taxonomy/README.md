# control-taxonomy

「做个输入框」不是同一种东西。先问这一格是自己填还是从答案里选。

理念说明见 [idea.md](idea.md)。

## 运行

独立 playground：

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5182/`。

在 Lab 里打开：`make dev` → `http://127.0.0.1:5173/s/control-taxonomy`。

建议按这个顺序点一遍，对照会最清楚：

1. 判断树：先填还是选，再看长短、单多、搜不搜
2. 单行文本：一行，失焦才说空
3. 多行文本：一段，右下字数
4. 下拉 Select：短列表，点中即关
5. Combobox：输入即筛，再点一个
6. 单选组：全部看见，只能一个
7. 复选：可叠，到上限其余禁用
