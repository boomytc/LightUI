# Validation

“Add form validation” only says an error will appear. First decide **when the error should be spoken**.

## The problem

“Add form validation” describes the result: a red line if the fill is wrong. What actually breaks is **using one machine for three timings**:

- The name is still being typed, and two characters already get scolded
- A past day is picked, the month grid closes, and that column stays quiet until submit
- Publish looks disabled and cannot be clicked, so the misses stay invisible
- The inline miss floats away as a toast and no longer points at a field
- Submit opens a confirm modal while the fields themselves stay clean

“Check everything on submit” either interrupts typing, stays silent after a bad pick, or locks people out with a dead grey button.

## The rule

Ask *when* the error should speak, then land on a machine. Fill versus pick is a different question.

| Timing | Speaks | How this lesson is tried |
| --- | --- | --- |
| On blur | When the cursor leaves this field | Name needs at least 4 characters. Type two, then click the empty part of the form |
| Inline | When this column is given an illegal value; speak under the field as it closes | Open the month grid and pick a day already in the past |
| On submit | Clicking publish marks every miss at once | Submit an empty form with「保存并发布」, even when the button looks idle |

The three pairs people mix up:

- **When to speak is not fill versus pick.** One line or a paragraph, visible radios or a short list — that is the field’s machine. When the error opens its mouth is another question.
- **An inline miss is not a toast.** The copy sits under that column and stays with the field. A notice bar does not name the slot.
- **Marking every miss on submit is not a confirm modal.** After publish, the misses still sit under the fields. A confirm asks “do this?”, not “which slots failed?”.

To specify one of these, say three things:

1. **Name** — not “form validation”
2. **Scene** — leaving a field, picking an illegal value in that column, or hitting publish
3. **Rules** — speak on blur / speak as the column closes / mark every miss at once (a grey-looking button still receives the click)

Those three sentences are the card’s “say it this way”.

A disabled-looking submit in the demo must still receive a click: `aria-disabled` plus a handler, not a dead `disabled` attribute. Otherwise the submit lesson cannot be taught.

## Versus always waiting for submit

| | Always on submit | Split by timing |
| --- | --- | --- |
| A two-character name | The whole form must be filled before the miss is named | Leaving the field already says “at least 4 characters” |
| A day from last year | The grid closes and nothing happens | That column immediately says a past date cannot create an activity |
| A grey publish button | It cannot be clicked, so the blockers stay secret | It can still be clicked, and every miss is marked at once |

## The machines

Timing lives in DOM-free modules: `validateField`, `validateAll`, `visibleErrors`, `isFormReady`, `charCount` (`Array.from(trim)`, CJK-safe), `shownByLesson`.

- Blur: only fields with `touched[key]`
- Inline: a past date appears under the date field once that field is touched
- Submit: every error if `submitted`, including a click on the idle-looking button

Dates compare as ISO strings. Today is local `YYYY-MM-DD`; past means `date < today`. No date library.
