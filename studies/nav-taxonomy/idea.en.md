# Navbar

“Make a navbar” only says there is a row of links. First decide **where it lives, how it opens, and what it does on scroll**.

## The problem

Site nav looks like a few entries. What breaks is a model that does not match:

- A floating card uses `fixed`, covers the page, and then needs extra padding
- A breadcrumb is treated as the primary nav, so a deep page has no other way out
- A mega menu is squeezed to 390px
- A drawer opens and the page underneath still scrolls
- A scrollspy flickers because the observer is not locked during a click jump
- White type on a light hero while the bar is still transparent

One “top bar plus dropdown” for all of these either crowds, overlays, or fails on a small screen.

## The rule

Pick the model by placement, reveal, and scroll, then talk about the skin.

| Model | What it is | On expand / scroll |
| --- | --- | --- |
| Floating · sticky | An inset card; occupies | `sticky`, not `fixed` |
| Sidebar | Vertical primary; occupies | May collapse to icons; space models live in another study |
| Breadcrumb | **Not** the primary nav | The last item is the page; it is not a link |
| Dropdown | Children of a section | Hover / tap a single column |
| Mega menu | Site IA deeper than two levels | Full-width columns, not one list |
| Hamburger · drawer | Small-screen primary | Slides from the edge; lock scroll |
| Full-screen overlay | Few items, a beat of ceremony | Covers the page; large centered type |
| Scrollspy | A long page in sections | Highlight follows the section; lock the observer on click |
| Shrink on scroll | A bar over a hero | Past a threshold it shortens and goes solid; two thresholds, not one |

Three pairs people mix up:

- **A drawer is not a full-screen overlay.** A drawer takes an edge. Overlay replaces the page.
- **A dropdown is not a mega menu.** A dropdown is one column. Mega is a classified grid.
- **Shrink is not a floating sticky.** Shrink changes the bar’s own height and contrast. Sticky changes where it pins.

To name a nav, say three things:

1. **Name** — not “a navbar”
2. **Scene** — marketing site, admin, docs, landing, portfolio, small screen
3. **Rule** — occupy or overlay, hover or tap, pin / highlight / shrink on scroll

## Versus “just another top bar”

| | One top dropdown | By model |
| --- | --- | --- |
| Portfolio | A flush bar sits on the picture | A floating card, or a transparent bar that shrinks |
| Admin | The row never ends | A vertical rail that stays |
| Deep page from search | No idea where you are | A breadcrumb is a path, not the menu |
| Commerce | One child list cannot hold the IA | Mega columns file the catalog |
| Phone | The mega panel becomes a slit | A hamburger drawer |
| Long landing | You lose the section | Scrollspy follows |

## Machines

The dropdown and mega fixtures here are site sections, not form fields. The sidebar fixture here only says “vertical is a kind of primary nav.”

The machines live without DOM: `crumbTrail`, `pickActive`, `nextShrunk`.
