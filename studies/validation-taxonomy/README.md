# validation-taxonomy

「做个表单校验」不是同一种东西。先问错误该在什么时候说：失焦、行内，还是提交时一次说完。

理念说明见 [idea.md](idea.md)。

## 运行

独立 playground：

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5185/`。

在 Lab 里打开：`make dev` → `http://127.0.0.1:5173/s/validation-taxonomy`。

建议按这个顺序点一遍，对照会最清楚：

1. 失焦：活动名称输入「夏日」，再点到表单空白处
2. 行内：打开活动时间，点一个已经过去的日子
3. 提交：空表单去点看起来置灰的「保存并发布」，一次标出全部
