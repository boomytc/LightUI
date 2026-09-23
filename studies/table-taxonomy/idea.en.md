# Record table

A record table first asks **where find, see, and act live**. Filter from the column and keep each applied value above the grid. The header sticks inside the table’s own scrollport, and the name column cannot hide. The row shows View; the rest stay in that row’s menu. The bulk bar replaces search only after the selection count is above zero.

## Problem

“Make a table” describes fields. What breaks is find, see, and act with no layer of their own:

- Filters sit in a form away from the column they describe
- One check rewrites the table before anyone applies it
- Clicking the amount drops people, hides the direction, or changes the count
- The page scrolls and the header leaves; sideways, the name leaves too
- Every role sees every field, and the name can be turned off
- View, edit, duplicate, and delete are four buttons on every row
- The bulk bar occupies the toolbar when nobody is selected
- Select-all checks rows the filter has hidden
- Applied filters are invisible until the header opens again, and Clear also wipes the name search

## Rule

Ask whether this moment is **find, see, or act** before choosing a skin.

| Leaf | Layer | Rule |
| --- | --- | --- |
| Header filter | Find | Multi-select from that column. OR inside the column, AND across columns. Checks stay in a draft until Apply. The name search is separate |
| Active filters | Find | One chip per applied value. Clear drops filters and leaves the name search |
| Column sort | See | Click amount: none → high to low → low to high → none. Order only. The count stays |
| Sticky header | See | The header is `sticky` at the top of the table scrollport. Sideways, the name column stays |
| Columns | See | Fields follow the task. The name is required. The checkbox and the actions are not fields |
| Row actions | Act | View stays on the row. Edit, duplicate, and delete live in that row’s More. Delete sits after the separator |
| Bulk | Act | The bar appears when the count is above zero, states the count, and replaces search and column settings. Select-all checks only the rows in view |

A filter that matches nothing keeps the records. The blank is the condition. Paging is what drops the previous page. Clicking the amount changes direction. It does not drag the row into a new order.

Say a layer in three beats:

1. **Name** — header filter, sort, sticky header, row actions, columns, bulk, active filters
2. **Place** — find on the column and the chips, see in the scrollport and the fields, act on the row and the selection count
3. **Rule** — draft then apply, sort keeps the count, the name stays, bulk waits for a count

Those three beats are the line on the card.

## Against a field grid

| | Field grid | Find / see / act |
| --- | --- | --- |
| Filter | A form away from the column, live on every check | Opens from the column, enters on Apply |
| Conditions | Hidden, or tangled with search | One chip per value. Clear leaves the name search |
| Sort | The count changes, the direction is unclear | Reorder only, with an arrow |
| Header | Scrolls away with the page | Sticks in the table’s scrollport |
| Fields | The name can hide | The name is required |
| Row | Four buttons | View stays. The rest are in More |
| Bulk | The bar is there with an empty selection | It replaces search after a count. Select-all skips hidden rows |

## Machine

The judgment lives in a DOM-free module: `rowMatches`, `visibleCustomers`, `cycleSort`, `chipsOf`, `columnOn`, `bulkVisible`, `selectionMark`, `actionPlace`, `missCause`, `reduceDesk`.
