# drag-commit

同一抓取手势，松手提交的不是同一种结果。先定是新顺序、一次接收、跨组转移，还是无效回弹。

理念说明见 [idea.md](idea.md)。

## 运行

独立 playground：

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5203/`。

在 Lab 里打开：`make dev` → `http://127.0.0.1:5173/s/drag-commit`。

建议按这个顺序点一遍，对照会最清楚：

1. 同列排序：五张卡，抬起后其余项让出洞，松手交新顺序；靠近边缘列表自滚
2. 投放区：左侧筹码，右侧虚线区只有指针在内才亮；区外松手回弹、不改数据
3. 跨组转移：从队列拖到今日，源列幽灵留着，松手两列一起变
4. 无效回弹：拖到只读托盘变红，路径倒回，数组不变

舞台查询：`?stage=1&kind=reorder|dropzone|transfer|snapback&state=idle|lift`，默认 `reorder` / `idle`。`lift` 显示一张已经抬起的卡。
