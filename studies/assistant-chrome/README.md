# assistant-chrome

助手不是默认整页聊天。先定它住在对话、侧栏、插件、浮层、画布，还是看不见。

理念说明见 [idea.md](idea.md)。

## 运行

独立 playground：

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5195/`。

在 Lab 里打开：`make dev` → `http://127.0.0.1:5173/s/assistant-chrome`。

舞台：`/s/assistant-chrome/stage?kind=chat&state=default`。插件工具条：`kind=plugin&state=open`。

建议按这个顺序点一遍，对照会最清楚：

1. 对话式：整页消息列表。组字中的 Enter 不发送
2. 面板分割：左干活，右一张建议卡；应用 / 撤销
3. 插件式：划选句子，工具条才出现；宿主页面不动
4. 浮层助手：可拖的小窗，骨架不改
5. 画布：点子是节点，不是聊天窗
6. 看不见：按 K 整理，没有常驻铬
