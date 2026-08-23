# Layout

“Make a page” only says there are blocks. First decide **which skeleton this page is**.

## The problem

“Make a site” describes the look: a title, some cards, a main area. What actually breaks is a **skeleton that does not match the content**:

- A long read is stretched full-bleed, so Chinese lines become unreadable
- A conversion page is built as an admin dashboard, so the promise is crowded out by numbers
- Pictures are cropped to one height, or become a carousel that swaps the whole view
- A brand first screen is stuffed with three paragraphs, so the punch is gone
- Two workspaces cannot be dragged, or they are built as a covering drawer
- A page meant for scanning KPIs is written as marketing
- One-idea-per-card collage is written as a single essay

One “left-right layout” for all of these either breaks the reading axis, turns a site into an admin shell, or turns masonry into a carousel.

## The rule

Pick the skeleton by *how this page is laid out*. Skin comes after. Landing and single column also carry a rhythm: **24px** gutters, **64–96px** between bands. Feature cards and modular cards stretch with the grid; inside, `flex-col` + `mt-auto`. Do not hardcode `height`.

| Skeleton | When | Machine |
| --- | --- | --- |
| Single | Quiet reading | One axis; **max-width ≈ 42rem (672px)**; figures and quotes share that column |
| Landing | Convert, download, book | Hero promise → proof bands → CTA; **not a dashboard**; 24px gutter, 64–96px bands |
| Masonry | Pictures of uneven height | **Uneven**; `break-inside: avoid`; not a carousel |
| Full-screen | One sentence, first glance | **One shot fills the viewport**; no body copy |
| Splitter | Two workspaces | **Two panes**, a visible divide; resizable or fixed; not a drawer overlay |
| Dashboard | Scan numbers, compare trends | KPI + chart + table grid; a left rail’s occupancy is a sidebar question |
| Modular | One idea per card | Cards on a grid; stretch the row, `mt-auto` on the footer |

The four pairs people mix up:

- **The page skeleton is not sidebar occupancy.** The skeleton is how this page is laid out. Whether the left rail occupies space is a sidebar.
- **How the columns are laid is not where the top bar goes.** Where the top bar lives, and how it opens, is nav.
- **Masonry is not a carousel.** Masonry drops cards down the shortest column. A carousel takes the whole view away.
- **A splitter is not a drawer overlay.** Both panes live in normal flow. A drawer covers the current task and goes away.

To specify one of these, say three things:

1. **Name** — not “make a page”
2. **Scene** — a long read, conversion, a picture stream, a poster screen, two workspaces, scanning numbers, or one idea per card
3. **Rules** — measure, band whitespace, uneven height, one shot, two panes, a KPI grid, or a card grid

Those three, in one sentence, are the “Say it this way” card.

## Versus always “left-right”

| | Always two columns | Split by skeleton |
| --- | --- | --- |
| A design journal | A left TOC, a squeezed article | Single column, 42rem, one reading axis |
| A product site | Admin nav + empty main | Landing: hero, proof, CTA |
| An inspiration wall | Equal tiles or a hero carousel | Uneven masonry; cards are not sliced |
| A launch | The first screen is full of copy | One sentence fills the viewport |
| An editor | Looks split, cannot drag | Two workspaces, a visible handle |
| A daily report | A marketing hero | KPI + chart + table |
| A personal home | One long essay | A grid of one-idea cards |

## The machines

The calls live in DOM-free modules: `readingMeasurePx`, `isFullBleed`, `allowsUnevenHeight`, `splitPanes`. Splitter drag uses `clampSplit`.
