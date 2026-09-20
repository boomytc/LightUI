# Pickers

“Make a picker” only says something can be tapped. First decide **whether this pick is one tick, a two-end span, a stepped count, a path, or a date range**.

## The problem

“Make a picker” describes the look: a control you can tap. What actually breaks is **the same machine for different kinds of pick**:

- Weight becomes a text field, so they have to land on 0.1 themselves — or two thumbs, as if it were a range
- Price becomes two independent boxes, so the floor can sit above the ceiling
- Cart quantity becomes a ruler, so they have to slide to reach 2
- Province / city / district becomes one long list, or “Jiangsu” is treated as a finished value
- Check-in / check-out becomes two date fields, so the nights in between disappear and check-out can be earlier than check-in

One text field or one dropdown for all of these either misses the tick, lets the ends cross, uses the wrong step, keeps stale children after a parent change, or cannot show the span.

## The rule

Once it is already a pick, ask what they are picking, then land on a machine. Fill versus pick is the previous question. What a downward panel commits, and how a wheel snaps, are other questions.

| Leaf | When | Machine |
| --- | --- | --- |
| Ruler | One value on a continuous scale (height, weight) | The pointer stays; the ticks slide; release snaps to the step |
| Range | A floor and a ceiling at once (price, area) | Two thumbs, live values, the ends must not cross |
| Stepper | A small count with a fixed step (quantity) | Plus or minus one step; disable minus at the floor |
| Cascader | A parent-then-child path (region) | Options follow the parent; changing a parent clears the children |
| Date range | A start and an end on a calendar (stay) | Start then end, highlight the middle, end after start; past days are off |

The pairs people mix up:

- **A ruler is not a range slider.** One value against one pointer. Two thumbs are a span. Weight is not two dots.
- **A stepper is not a ruler.** A small count, one at a time — do not slide 0.1. Minus stops at 1.
- **A range slider is not two boxes.** The thumbs move together; the floor cannot pass the ceiling.
- **A sequential path is not a downward column, and not a combobox.** One level at a time; change the province and city and district must be picked again. Committing a path from a downward panel is another question.
- **A date range is not two date fields.** Highlight the span so the nights are visible. The end must be after the start.
- **A horizontal ruler is not a wheel.** A wheel is ordered discrete snap on a cylinder. This ruler keeps the pointer still and slides the ticks.

To specify one pick, say three things:

1. **Name** — not “a picker”: ruler, range, stepper, cascader, or date range
2. **Scene** — one tick, two ends, a small count, a path, or a start and an end
3. **Rules** — snap on release / ends do not cross / disable at the floor / changing a parent clears children / end after start

Those three, in one sentence, are the “Say it this way” card.

## Versus always a field or one dropdown

| | Always a field / dropdown | Split by what is picked |
| --- | --- | --- |
| Weight | Type 0.1, or a 1,200-row list | A ruler; pointer fixed; snap on release |
| Price | Two boxes; floor can exceed ceiling | Dual thumbs; ends do not cross |
| Cart | Slide a ruler to 2, or a keyboard | A stepper; one at a time; minus stops at 1 |
| Region | One long list, or a province as the value | Sequential; changing a parent clears children |
| Stay | Two date fields; the middle is invisible | Calendar highlight; check-out after check-in |

## The machines

The calls live in DOM-free modules: `choosePicker` (one-tick / two-ends / few-steps / tree-path / date-span), `snapRuler`, `applyRangeThumb` (gap between thumbs), `stepQty` (stop at the floor), `cascadeSelect` (changing a parent drops children), `pickDate` (ignore the past; end after start).
