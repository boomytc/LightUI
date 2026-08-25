# container-morph

同一入口连续变形。先定改宽、高、圆角还是排版；停在展开态，或沿原路收回。

理念说明见 [idea.md](idea.md)。

## 运行

独立 playground：

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5202/`。

在 Lab 里打开：`make dev` → `http://127.0.0.1:5173/s/container-morph`。

建议按这个顺序点一遍，对照会最清楚：

1. 圆→胶囊：高度锁死，从中心长宽，圆角全程 999
2. 胶囊→卡片：从顶往下长高，标题始终挂着，正文后出现
3. 紧凑条：同一份内容，额外控件 0fr→1fr
4. 圆角：宽高锁死，只改圆角——这是层级，不是放大
5. 尺寸：内容层级不变，从左上往右下长
6. 重排：同一组节点，单列变两列，阅读顺序不变
7. 反向收回：正文先走，再收高度成胶囊，再收宽度成圆点

舞台查询：`?stage=1&kind=circle-pill|pill-card|compact|radius|size|reflow|reverse&state=collapsed|expanded`。反向收回用 `state=card|pill|dot`。默认 `circle-pill` / `expanded`。
