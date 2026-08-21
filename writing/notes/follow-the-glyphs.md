---
title: 扫光跟字走
date: 2026-08-21
summary: 扫光该裁进字形。宽度用 ch，时长等于字数乘每字秒数，不要去扫整块盒子。
related: glyph-sweep
---

给标题加一道光，常见是扫整块元素，或用固定像素宽的高光。短词和长句对不齐，改字号光带就错位。

字保持透明，用 `background-clip: text` 把 300% 宽的光带裁进字形。只动 `background-position`。半宽是 `spread × 0.5ch`，时长是字数乘每字秒数。短词先结束，长句仍跟得上。速度往右是更快。
