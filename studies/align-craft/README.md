# align-craft

对齐不是看起来正。先问对齐的是基线、焦点，还是盒子。

理念说明见 [idea.md](idea.md)。

## 运行

独立 playground：

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5193/`。

在 Lab 里打开：`make dev` → `http://127.0.0.1:5173/s/align-craft`。

舞台（一种咒语、一种对/错，无教学铬）：

```
http://127.0.0.1:5193/?stage=1&kind=baseline&state=right
```

建议按这个顺序把七句对错对照看一遍：

1. 基线：大小字按文字基线，不是 items-center 外框
2. 封面：cover 填满，object-position 跟着主体，不要 contain 留空
3. 交叉轴：图标+文字垂直居中
4. 间距：父级 gap，不要随机 margin
5. 贴边：padding-top 对行高 / 帽高
6. 光学：视觉居中不是几何中心
7. 嵌入：inset 对齐，不要 translate 猜
