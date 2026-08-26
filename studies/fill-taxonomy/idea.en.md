# Filling

“Make a form” only says there are boxes. First decide **what each field must disclose before filling, while filling, and after submit**.

## The problem

“Make a form” describes the look: a tidy column of inputs. What actually breaks is **using the same silence for three moments**:

- Placeholder-only: a few characters later, nobody knows what the box is for
- Required is only scolded on submit; optional looks required too
- Phone has no format example; a miss becomes a page-top “please check”
- Time, place, and capacity are already known, yet people are asked to type them again
- The error sits at the top of the page, names no field, and does not say how to fix it
- Submit flashes “Success” — not what happened, and not what to do next

“Line the fields up neatly” either loses people halfway or leaves them guessing after submit.

## The rule

Ask which moment this column should speak, then land on a duty. Fill versus pick, and when an error speaks, are different questions.

| Moment | Speaks | How this lesson is tried |
| --- | --- | --- |
| Before | Label stays, required/optional are marked, format is given, fields group by task | Type a few characters and watch the placeholder vanish; turn required marks on; compare two stacked lines with one replaced line; compare a flat dump with groups |
| During | Placeholder carries format, a real default is preselected; a miss sits under that column and names both the miss and the fix | Turn format placeholders and the preselected seat on; same short number: a banner that names no field, versus “N digits remain” under the box |
| After | Say what happened, and name a next step | After submit, do not leave only the word “Success” |

The three pairs people mix up:

- **What to disclose is not fill versus pick.** One line or a paragraph, radios or a short list — that is the field’s machine. This study asks what the three moments say.
- **A field-level fix is not when the error speaks.** Copy sits under that column and names both the miss and the fix. Blur, inline, and submit are another question.
- **A completed submit is not a toast.** The result names what happened and a next step. A notice bar speaks once and leaves this form behind.

To specify one filling duty, say three things:

1. **Name** — not “make a form”
2. **Scene** — labels, required, format, grouping before; placeholder and a field-level fix during; outcome after
3. **Rules** — label stays / mark required first / helper and error never stack / known facts are read-only / the miss sits under the field and can be fixed / success carries a next step

Those three sentences are the card’s “say it this way”.

A placeholder is never a label. Color is not the only required signal. On error, replace the helper — do not stack two lines.

## Versus always lining fields up

| | Always tidy | Split by the three moments |
| --- | --- | --- |
| A few characters typed | The placeholder is gone; the box is anonymous | The label is still above the box |
| An optional company | It looks required | It says “optional” |
| A phone number | No example; a banner failure | Format under the box; one digit short says how many remain |
| Time and place | Known facts are typed again | Read-only, grouped by task |
| After submit | Only “Success” | Where the confirmation went, and a next step |

## The machines

Duties live in DOM-free modules: `phaseOf`, `identityLost`, `fieldMark`, `shownCopy`, `hintKind`, `sectionsFor`, `isReadout`, `phoneRepair`, `repairPlacement`, `outcomeComplete`.

- Before: whether the label remains, whether required/optional are marked, whether helper and error stack, whether known facts become read-only
- During: placeholder is format or empty; the miss sits under the field or on a banner, and whether the copy carries a fix. When it speaks is another question
- After: `what` and `next` must both be present — missing one is only “Success”
