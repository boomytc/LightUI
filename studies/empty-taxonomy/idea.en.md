# Empty

They all look blank. First decide **why it is empty, and what this blank should ask them to do**.

## The problem

“Make an empty state” describes the look: an illustration, “no data”, one button. What actually breaks is **the same nudge for different causes**:

- A new account has no customers, but the copy says “no data”, so they do not know the first step; the overview is a row of zeros
- A near-miss search returns nothing, and a big “Add customer” sits in the empty well, so they think the library is empty
- City + this week + closed stacked together match nothing, and the page reads as if no records exist
- A refresh fails and the old list becomes a blank board, so work stops; a first-load failure is also called “nothing yet”
- Today’s follow-ups are done, and the page still nags them to add more

One “notice + button” for all of these either reports “no data” when the miss is a query, or nags when it should not.

## The rule

Ask why this view is empty, then pick a nudge. Occupancy while waiting (skeleton / empty / veil) is another question.

| Leaf | When | Machine |
| --- | --- | --- |
| First-use | The library has no records yet | `emptyAction` is `create`; a human title, a primary that names “add the first customer”, plus an import entry; an empty overview is not a row of zeros |
| No search results | Records exist; the query missed | `revise-query`; keep the search box and the last keyword; put the hint beside the box; **do not put a create primary in the empty well** (chrome Add may stay — the library is still there) |
| No filter matches | Records exist; the filters are too tight | `loosen-filter`; leave the chips on the page, removable one by one; dropping one filter may bring rows back |
| Load error | The request failed — this is not empty | `retry`; `keepsExistingList`; a light banner plus a text retry; **do not treat it as no data** |
| All done | The inbox is clear; history remains | `celebrate`; a clear completion; **do not nag**; history stays in the same nav |

The pairs people mix up:

- **Why it is empty is not what should occupy the screen.** A skeleton holds layout, an empty state offers a next step, a veil covers an unknown shell — that is occupancy. This study asks, once it is empty, what the cause is, and whether to create or to change a condition.
- **Empty occupancy is not always one primary.** Offering a next step is only for “we have not started”. Search revises, filters loosen, failure retries, done celebrates — none of those put another create in the well. Chrome Add means the library still exists; it is not the empty-well primary.
- **A miss is not “no data”.** Search revises the query. Filters loosen. A primary button is only for the first-use case.
- **A load error is not empty, and not progress.** Keep the last list and offer retry. A first-load failure is still a failure, not “no customers yet”. A looping spinner is another question.
- **All done is not first-use.** A cleared inbox is good news. No records yet is “we have not started”.

To specify one blank, say three things:

1. **Name** — not “an empty state”: first-use, no search results, no filter matches, load error, or all done
2. **Scene** — nothing yet, a query miss, filters too tight, a failed request, or a cleared inbox
3. **Rules** — create gets an entry / search revises the query / filters loosen / failure retries and keeps the list / done only celebrates

Those three, in one sentence, are the “Say it this way” card.

## Versus always “no data + a button”

| | Always a notice + button | Split by cause |
| --- | --- | --- |
| New account | “No data”, or a row of zeros | “No customers yet” + add the first customer + import |
| A near-miss query | Another add button in the empty well | The box still holds the last keyword; the hint sits beside it |
| Three filters stacked | Reads as if nothing exists | Chips stay; tap × to drop one |
| Refresh failed | A blank board, or treated as empty | The last list stays; retry on the banner |
| Today’s follow-ups done | Nags them to add | “Today’s follow-ups are done”; history remains |

## The machines

The calls live in DOM-free modules: `emptyCause` (first-use / search / filter / error / done / populated), `emptyAction`, `showsPrimaryCta` (true only for first-use), `keepsExistingList` (true for error and populated). Search beats filter. Error beats empty — a failure at 0 rows is still a failure, not first-use. Done requires history to still be there.
