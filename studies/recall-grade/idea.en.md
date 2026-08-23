# Recall

After the flip, does this commit how well you remembered, or just the next card? First decide that the **flip is for comparison**, and that what you submit is an **interval**, not a cut to the next frame.

## The problem

“Make flashcards / flip cards” describes the look: a prompt, an answer, tap to move on. What actually breaks is a **commit that does not match the job**:

- Swipe to the next card with no grade, so tomorrow is the same pile
- “Knew it” is available on the prompt face, so an interval is committed before the compare
- Forgot and fuzzy both schedule tomorrow, and the count does not move — two buttons, one machine
- Nothing due today is written as “no data”, or it vanishes into a toast
- The three grades are built as a delete confirm: cancel / OK, not an interval

One carousel or one confirm dialog for all of these either scrambles the schedule, or leaves people unsure what they just submitted.

## The rule

Ask whether the flip has to commit a recall grade. Then talk about the skin.

| Face | When | Machine |
| --- | --- | --- |
| Prompt | Not compared yet | Only Reveal answer; `canGrade` is false |
| Answer | The prompt stays; compare mine / the answer | Three grades; `applyGrade` writes `reviewCount` and `nextReview` |
| Empty | Nothing in today's pile with `nextReview <= today` | Icon, one human line, one button; not “no data” |

The three grades are not the same day and not the same count:

- **Forgot** — `reviewCount` resets to 0; `nextReview` stays today, and the card goes to the end of today's pile. Not “tomorrow, same as fuzzy”.
- **Fuzzy** — the count stays; `nextReview` = today + 1.
- **Knew** — `reviewCount += 1`; days from `[1, 3, 7, 14, 30]` by the new count, then cap.

The due queue is `dueCards`: only `nextReview <= today`. Forgot stays in today. Fuzzy and knew leave today's pile.

The three pairs people mix up:

- **Recall is not a carousel.** A carousel advances a frame. Here the flip is to compare; what you commit is how well you knew it.
- **An empty pile is not a notice.** A notice is a glance, then gone. Nothing due occupies this region: why it is empty, and where to go next.
- **A grade is not a confirm dialog.** The three buttons commit an interval, not “delete or not”.

To specify one recall, say three things:

1. **Name** — not “flip cards”: a recall grade
2. **Scene** — see the prompt, flip to compare, then commit forgot / fuzzy / knew
3. **Rules** — forgot resets and requeues today; fuzzy is tomorrow; knew follows 1, 3, 7, 14, 30 days

Those three, in one sentence, are the “Say it this way” card.

## Versus swipe-to-next / forgot = fuzzy

| | Swipe, or forgot = fuzzy | Split by recall grade |
| --- | --- | --- |
| Before the flip | Next, or a grade, is already available | Only Reveal answer |
| Forgot | Tomorrow, count unchanged | End of today's pile, count reset |
| Fuzzy | The same day as forgot | Tomorrow, count kept |
| Knew | Maybe just the next card | Leaves on the interval |
| Nothing due today | “No data”, or a toast | A human empty state, one button |

## The machines

The calls live in DOM-free modules: `dueCards`, `canGrade`, `applyGrade`, `intervalDays`, `nextIndexAfterGrade` (forgot rotates the current card to the end; fuzzy / knew drop it from the front). Dates are ISO.
