# Page · Append

A batch of records first asks: **does it replace the page, or append at the end?** Paging drops the previous page and returns to the top. Append only grows `visibleCount`; old nodes stay mounted.

## The problem

“Make pagination” describes the look: a row of numbers, or a Load more button. What actually breaks is a **batch that does not match what happens to the old nodes**:

- Page 2 still keeps page 1’s cards, and the list is still scrolled halfway
- Load more swaps the whole page, so the cards just read are gone
- Previous / next in a table is built as a carousel, so records loop on a track
- Button-append is built as infinite scroll, so nearing the bottom auto-requests
- A loaded prefix is built as a skeleton
- Load more is built as a work-progress bar
- Growing a collection is built as how a panel opens

One “next page” for all of these either loses the place, or pretends the old records are still there.

## The rule

Ask whether this batch **replaces the page** or **appends at the end**. Skin comes after.

| Leaf | Mode | Scroll | Old nodes |
| --- | --- | --- | --- |
| Page | replace | reset to top | dropped (this slice only) |
| Append | grow `visibleCount` | keep | kept |

Paging uses `pageSlice`: 1-based page, `(page-1)*pageSize .. page*pageSize`. After a change, the previous page unmounts and the list container’s `scrollTop` goes to 0. The highlight chip slides to the current page.

Append uses `appendCount`: clamp `visible` to `[0, total]`, then `min(visible+batch, total)`. A click adds one batch; already rendered cards keep their ids. When the set is exhausted the button becomes “All loaded” and does not request more.

`collectionView` must keep these apart: page uses a slice and `scrollReset`; append shows the **committed** prefix and must not auto-add `batch` inside the view.

The pairs people mix up:

- **Append is not infinite scroll auto-request.** This leaf is a button. Firing near the bottom is another question.
- **Paging is not a carousel.** Previous / next cuts this page of records and drops the old page. A carousel loops posters on a track.
- **A loaded prefix is not a skeleton.** The prefix is real records. A skeleton holds seats that have not arrived.
- **Load more is not work progress.** Progress is a job still computing. This is how many records are showing.
- **How a collection grows is not how a panel opens.** A panel is expand / inflow. This is replace versus append.

To specify one batch, say three things:

1. **Name** — not “pagination”: page, or append
2. **Scene** — this batch replaces the current page, or it is tacked onto what is already visible
3. **Rules** — drop the old nodes or not; reset scroll or not

Those three, in one sentence, are the “Say it this way” card.

## Versus always “next page”

| | Always next page | Split by replace / append |
| --- | --- | --- |
| A library page | Old cards stay; scroll stays halfway | This page only; the list returns to top |
| Load more | The whole page is swapped | `visibleCount` grows; old nodes stay |
| Exhausted | It keeps requesting | The button becomes “All loaded” |
| A banner | Records loop on a track | A paged list is not a carousel |

Show a live range: paging is **showing a–b of n**; append is **showing 1–k of n**.

## The machines

The calls live in DOM-free modules: `collectionMode`, `dropsOldItems`, `resetsScroll`, `pageSlice`, `pageCount`, `nextPage` / `prevPage`, `appendCount`, `appendExhausted`, `collectionView`.
