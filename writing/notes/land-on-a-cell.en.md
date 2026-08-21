---
title: Gaze lands on a cell
date: 2026-08-21
summary: A looking face should not invent a continuous turn. Smooth inside the radius, then quantize to an atlas cell; a blink is the other row.
related: look-quantize
---

An atlas only has discrete angles. Rotating with the pointer invents frames that are not there. Jumping to the farthest cell on every move makes nearby motion flicker.

Divide the offset by the radius, clamp onto the circle, smooth, then land on a 13×3 cell. Center is the middle cell. A hop cuts; it does not dissolve. A blink does not change the look vector — it is the other row of the same cell.
