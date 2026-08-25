# Expand

Extra content first asks whether it **pushes the document flow, or covers it with a new layer**. Exclusive versus independent is the second question inside the flow. Do not rebuild the drawer.

## The problem

“Make an expand” describes the look: click, and more appears. What actually breaks is **the extra block occupying the wrong place**:

- A FAQ is absolutely positioned, so later paragraphs stay put and the answer covers the body
- Independent notes are forced into an accordion, so opening B closes A
- Row detail is built as a sliding drawer, so this row cannot be compared with the next
- A tree node expands when the name is clicked, so expand and select are the same click
- Read-more is built as list “load more”, so one article becomes pagination
- A card title flies onto an overlay, leaving the original card empty
- A FAQ accordion is built as a column-width gallery; a content tree is built as primary-nav multilevel

One covering layer for all of these either hides what should stay readable, or pins later rows in place when they should move down.

## The rule

Ask flow versus cover first. Skin comes after. Every leaf in this study is in-flow: `coversPage` is always false. Covering is an overlay question — a drawer is interrupt versus attach. This study does not do that.

| Model | Exclusive | In flow |
| --- | --- | --- |
| Accordion | **Yes** (`openId`) | One panel open; the other closes. Both heights move on `0fr` / `1fr` at once |
| Collapse | **No** (`Set`) | Several blocks can stay open |
| Tree | Independent per node; **expand is not select** | The arrow expands; the name selects a path |
| Row | Detail follows the row | **Must sit between this row and the next**, so later rows move down |
| Read more | n/a | Height from `line-height × n` to `scrollHeight` |
| Card | n/a | The same card grows; the title stays in flow. Extra blocks fade in after the size; close reverses that |

The naive wrong path (copy only — not a leaf): `position: absolute` over what follows. Once row detail covers the next row, you cannot read it or compare. Do not guess `max-height` either.

The three pairs people mix up:

- **Exclusive is not independent collapse.** An accordion that opens B must close A. Collapse lets several stay open; the count is `OPEN n/total`.
- **Row detail is not a drawer.** Detail follows the row, inserts under it, and pushes later rows down. A drawer slides in from the edge and covers the current task.
- **Read more is not load more.** Read more grows this block from three lines to its full height. Load more appends another page at the end of a list — the list grew; a panel did not open.

A drawer is another question (interrupt / attach). This study does not do it. A FAQ accordion changes document height, not column widths. A content tree opens on this page; it is not primary-nav multilevel.

To specify one of these, say three things:

1. **Name** — not “an expand”
2. **Scene** — a FAQ, independent notes, a content tree, row detail, read more, or a card that grows in place
3. **Rules** — push the document flow, do not cover; exclusive or independent; height on `0fr` → `1fr`

Those three become the line on the spec card.

## Versus always covering

| | Always an absolute overlay | Split by in-flow expand |
| --- | --- | --- |
| FAQ | The answer covers later paragraphs | Exclusive accordion; the body is pushed down |
| Shipping / returns / warranty | Only one block at a time | All three can stay open |
| A table row | Detail floats over the table; the next row is hidden | Detail inserts under the row; later rows move down |
| Tree | A name click both selects and expands | The arrow only expands; the name only selects |
| Long copy | Load another page at the list footer | This block grows from three lines to full |
| Summary card | The title flies to another layer | The same card grows; the title stays in flow |

## The machines

The rules live in DOM-free modules: `coversPage`, `exclusiveOpen`, `rowInFlow`, `toggleAccordion`, `toggleSet`, `treeToggleExpand`, `treeSelect`, `readMoreHeight`, `collapsedPx`. Height uses CSS grid `0fr` → `1fr`. Do not guess `max-height`.
