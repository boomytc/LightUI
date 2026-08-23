# carousel-taxonomy

一组画面不是同一种东西。先定这一组怎么切，再谈外观。

理念说明见 [idea.md](idea.md)。

## 运行

独立 playground：

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5188/`。

在 Lab 里打开：`make dev` → `http://127.0.0.1:5173/s/carousel-taxonomy`。

建议按这个顺序点一遍，对照会最清楚：

1. 经典左右滑：整页平移，圆点跟着当前页，悬停暂停
2. 淡入式：叠在原位，只改透明度，布局不跳
3. 3D 旋转木马：中间大、两侧转，点侧卡回到中间
4. 卡片堆叠：把顶卡剥走，下一张抬起来
5. 翻页式：沿书脊翻，左右两页同时在
6. 手风琴画廊：一项展开，旁边还露一条
7. 360°：转的是产品，不是幻灯片
8. 视差：远的慢、近的快

舞台查询：`?stage=1&kind=classic|fade|coverflow|stack|flip|accordion|spin|parallax&state=0|1|2`，默认 `classic` / `1`。
