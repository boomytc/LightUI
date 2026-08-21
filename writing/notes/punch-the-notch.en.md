---
title: Do not stitch an inverted corner
date: 2026-08-21
summary: Nesting a chip in a card means punching the parent. A matching-color patch shows a seam when the background changes.
related: inverted-notch
---

A lock chip sits in the top-left, with a gap so the page shows through. Stitching the notch with a pseudo-element and a same-color shadow fails as soon as the fill changes or the card goes translucent.

`corner-shape: scoop` is the shortest CSS. It only scoops one radius corner. It cannot nest a control.

Walk the rounded rect, then reverse around the chip. The hole follows chip size, so hover can grow both. If the page shows through the gap, the clip is real.
