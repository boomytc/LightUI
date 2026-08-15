---
title: A diagonal should not switch the menu
date: 2026-08-15
summary: When you slide diagonally into a submenu, items you pass through should not steal it. A safe triangle is closer to intent than a flat hover delay.
related: intent-cascade
---

Cascade menus have an old snag: sliding from the first level into the second briefly crosses other items. If hover-to-open is literal, the submenu is stolen on the way.

The usual patch is a 200ms delay on every hover. Vertical scanning becomes sticky, and a diagonal is often still too short. Both failures sit on the same delay.

Another path: the previous pointer sample and the submenu’s leading-edge corners form a corridor. While you stay inside, treat it as heading into the submenu. Moving up and down the list, not toward the submenu, switches immediately.

The third vertex of the test must be the **previous** sample, not the live pointer. The blue overlay uses the live pointer only so the corridor is visible.

[Menu intent](/s/intent-cascade) turns the rule into a playground you can compare: toggle intent, and the corridor is drawn. How the questions chain is on the [map](/graph).
