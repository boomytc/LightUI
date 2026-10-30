# 事件时间轴

日期事件串成时间轴，播放只改变可见节点，不改变业务事实。

`make dev-study STUDY=event-timeline` → http://127.0.0.1:5236/

播放、暂停、逐条展开、重播；减少动态效果时全部显示。Lab: `/s/event-timeline`。
舞台：`/s/event-timeline/stage?kind=history&state=mid`。

`npm run typecheck`、`npm run build` 检查源码。播放逻辑改动在操场核对暂停、完成与重播。
