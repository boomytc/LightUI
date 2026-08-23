# Tabs

A row of labels only says you can switch. First decide **which selection model tells you “you are here.”**

## The problem

“Make some tabs” describes the look: titles in a row, click, swap a panel. What actually breaks is a **selection and switch feedback that does not match the machine**:

- The underline spans the whole cell, so it feels like scanning buttons, not words
- Card tabs keep a bottom edge, so a seam sits between the tab and the panel
- An ordered flow is drawn as sibling views, so done-ness disappears
- A slice of the same dataset is built as a page change, so the layout jumps
- Folder tabs do not stack, so the bevel is only decoration
- The thumbnail and the hero are different assets, so the cut does not match

One underline for all of these either shows a seam, hides progress, or relayouts the page when the view changes.

## The rule

Pick the model by *what selection changes* and *how content swaps*. Skin comes after.

| Model | Selection | On switch |
| --- | --- | --- |
| Linear slider | Equal-width labels; a **2px bar follows the text span**, not the cell | Transition only `left` / `width`; content fades. Disable the transition on the first measure so it does not slide in from 0 |
| Card | Idle tabs are independent light cards; the current one matches the panel, **drops the bottom edge**, and `margin-bottom: -1px` covers the panel’s top | When the first tab is current, drop the panel’s top-left radius so a seam does not open beside it |
| Chevron steps | Arrows bite each other; **done / current / todo**, current filled with the accent | Steps are clickable, but the machine is order, not sibling views |
| Segmented | One rounded track; a **white pill slides to the click** | Swap a slice of the same data, not the page structure; four options or fewer |
| Folder | Left 90°, right 30° bevel; the current tab has the **highest z-index** and shares the list’s fill | Idle tabs sit on a light strip, like stacked paper |
| Image preview | The thumbnail *is* the tab; the current one lifts with a stroke | Hero and thumb share one asset; the hero crossfades |

The three pairs people mix up:

- **Linear is not segmented.** Linear is a row of sections; the bar measures the text. Segmented is a slice in one track; the pill measures the whole item.
- **Card is not folder.** Card drops the bottom edge and joins the panel. Folder is stacked, beveled paper; the current tab sits on top.
- **Chevron is not sibling tabs.** Done / current / todo is a sequence. Four mutually exclusive views should not bite with arrows.

To specify one of these, say three things:

1. **Name** — not “tabs”
2. **Scene** — sibling sections, an ordered flow, a slice of one dataset, or looking at pictures
3. **Rules** — bar follows text, join the panel, three-state arrows, pill in a track, stacked paper, or the thumbnail itself

## Versus always adding an underline

| | Always an underline | Split by selection model |
| --- | --- | --- |
| Sibling admin sections | The bar fills the cell and scans buttons | The bar slides under the words |
| Members / roles | Tabs float above the panel with a seam | The current tab turns white, loses its bottom edge, and joins the panel |
| Checkout | You cannot see which step is done | Arrows bite; done / current / todo |
| Today / this month | The page becomes another report | A pill slides in one track; the numbers are a slice |
| Project files | The bevel is decoration | The current tab covers the ones below and shares the list fill |
| Space preview | Thumbnails are a second set of pictures | The banner *is* the thumbnail you clicked |

## The machines

Indicator and pill geometry live in DOM-free modules: `textIndicator`, `equalPill`, `stepKind`, `cardPanelRadius`, `folderLayer`.
