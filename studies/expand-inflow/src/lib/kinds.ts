import { loc, type Localized } from "./site-locale";
import type { KindId } from "./machines";

export type { KindId };

export type KindMeta = {
  id: KindId;
  index: string;
  name: string;
  zh: Localized;
  oneLiner: Localized;
  scenes: Localized[];
  rules: Localized[];
  spec: Localized;
  note?: Localized;
  tells: Localized;
  chip: Localized;
};

export const KINDS: KindMeta[] = [
  {
    id: "accordion",
    index: "01",
    name: "Accordion",
    zh: loc("手风琴", "Accordion"),
    oneLiner: loc("互斥；开 B 关 A，两块高度同时走 0fr / 1fr", "Exclusive; opening B closes A, both heights move on 0fr / 1fr"),
    scenes: [
      loc("FAQ", "FAQ"),
      loc("帮助中心", "Help center"),
      loc("一次只看一块的说明", "Notes you read one at a time"),
    ],
    rules: [
      loc("同一时间只有一块开着", "Only one panel open at a time"),
      loc("点开项再点一次就关", "Clicking the open item closes it"),
      loc("高度走 0fr → 1fr，不要猜 max-height", "Height on 0fr → 1fr; do not guess max-height"),
    ],
    spec: loc(
      "做手风琴 FAQ。三块问答，同一时间只有一块开着：开 B 必须关 A。高度用 CSS grid 0fr → 1fr 同时过渡，不要猜 max-height，也不要把答案做成浮层。",
      "A FAQ accordion. Three panels; only one open: opening B closes A. Height transitions on CSS grid 0fr → 1fr together. Do not guess max-height, and do not float the answer.",
    ),
    note: loc("互斥不是独立折叠。也不要做成列宽画廊。", "Exclusive is not independent collapse. Not a column-width gallery either."),
    tells: loc("开 B，A 同时收起来，后面的段往下让", "Open B, A collapses with it; later copy moves down"),
    chip: loc("互斥", "Exclusive"),
  },
  {
    id: "collapse",
    index: "02",
    name: "Collapse",
    zh: loc("折叠", "Collapse"),
    oneLiner: loc("独立；几块可以同时开着，看 OPEN n/total", "Independent; several can stay open — OPEN n/total"),
    scenes: [
      loc("配送 / 退换 / 保修", "Shipping / returns / warranty"),
      loc("设置分组", "Settings groups"),
      loc("互不打扰的说明", "Notes that do not evict each other"),
    ],
    rules: [
      loc("每块自己开合，互不关掉别人", "Each block toggles without closing the others"),
      loc("计数 OPEN n/total", "Count OPEN n/total"),
      loc("同样在流里撑开，不是浮层", "Still pushes flow; not a cover"),
    ],
    spec: loc(
      "做独立折叠。三块说明可以同时开着，开一块不要关另一块。显示 OPEN n/total。高度走 0fr → 1fr，撑开文档流，不要盖一层。",
      "Independent collapse. Three notes can stay open; opening one does not close another. Show OPEN n/total. Height on 0fr → 1fr, pushing flow, not covering.",
    ),
    note: loc("独立折叠不是手风琴。开 B 不必关 A。", "Independent collapse is not an accordion. Opening B need not close A."),
    tells: loc("三块都能开着，计数跟着变", "All three can stay open; the count follows"),
    chip: loc("独立", "Independent"),
  },
  {
    id: "tree",
    index: "03",
    name: "Tree",
    zh: loc("树", "Tree"),
    oneLiner: loc("箭头展开，名字选路径；展开不是选中", "Arrows expand, names select a path; expand is not select"),
    scenes: [
      loc("内容目录", "A content outline"),
      loc("文件树", "A file tree"),
      loc("这一页里的层级", "Hierarchy on this page"),
    ],
    rules: [
      loc("箭头只改 expanded Set", "The arrow only toggles the expanded set"),
      loc("名字只改选中 id，面包屑跟选中走", "The name only changes the selected id; breadcrumb follows select"),
      loc("按深度 padding-left，子级在流里撑开", "padding-left by depth; children push in flow"),
    ],
    spec: loc(
      "做内容树。文件夹箭头只负责展开，点名字才选中并更新面包屑。展开和选中是两套状态，不要点名字就展开。子级按深度缩进，在文档流里撑开，不是主导航多级。",
      "A content tree. Folder arrows only expand; the name selects and updates the breadcrumb. Expand and select are two states — a name click does not expand. Children indent by depth and push in flow. Not primary-nav multilevel.",
    ),
    note: loc("内容树不是主导航多级，也不是点名字就展开。", "A content tree is not primary-nav multilevel, and a name click does not expand."),
    tells: loc("箭头开合，名字选出面包屑", "Arrows open; names write the breadcrumb"),
    chip: loc("展开≠选中", "Expand ≠ select"),
  },
  {
    id: "row",
    index: "04",
    name: "Row",
    zh: loc("行详情", "Row detail"),
    oneLiner: loc("详情插在这一行和下一行之间，后面的行往下让", "Detail sits between this row and the next; later rows move down"),
    scenes: [
      loc("订单表", "An order table"),
      loc("对照着下一行看", "Compare with the next row"),
      loc("行内展开", "Inline row expand"),
    ],
    rules: [
      loc("详情跟这一行走，插在下一行之前", "Detail follows the row and inserts before the next"),
      loc("后面的行必须往下移", "Later rows must move down"),
      loc("不要绝对定位，不要做成抽屉", "No absolute positioning, no drawer"),
    ],
    spec: loc(
      "做表格行详情。点一行，详情插在这一行和下一行之间，后面的行往下让。详情必须在文档流里，不要 position: absolute，也不要做成侧滑抽屉。",
      "Table row detail. Click a row; the detail inserts between this row and the next, and later rows move down. Keep it in flow — no position: absolute, no sliding drawer.",
    ),
    note: loc("行详情不是抽屉。抽屉盖住当前任务，行详情把后面的行撑下去。", "Row detail is not a drawer. A drawer covers the task; row detail pushes later rows down."),
    tells: loc("下一行被撑下去，没有浮在表上", "The next row is pushed down; nothing floats over the table"),
    chip: loc("跟行走", "Follows the row"),
  },
  {
    id: "readmore",
    index: "05",
    name: "Read more",
    zh: loc("读更多", "Read more"),
    oneLiner: loc("从三行高长到全文高，不是列表再加载一页", "Grows from three lines to full height — not another list page"),
    scenes: [
      loc("长介绍", "A long intro"),
      loc("条款摘要", "A policy summary"),
      loc("这一块变高", "This block gets taller"),
    ],
    rules: [
      loc("收起高度是 line-height × 3", "Collapsed height is line-height × 3"),
      loc("展开高度是 scrollHeight", "Open height is scrollHeight"),
      loc("按钮「展开全文」↔「收起」", "Button 展开全文 ↔ 收起"),
    ],
    spec: loc(
      "做读更多。正文先收成三行高，高度用 line-height × 3；点「展开全文」过渡到 scrollHeight，按钮变成「收起」。这是这一块变高，不是列表末尾加载更多。",
      "Read more. Copy starts at three-line height (line-height × 3). 「展开全文」transitions to scrollHeight and the button becomes 「收起」. This block grows; the list does not append a page.",
    ),
    note: loc("读更多不是加载更多。列表变长是另一问。", "Read more is not load more. List growth is another question."),
    tells: loc("三行到全文，这一块自己变高", "Three lines to full; this block itself grows"),
    chip: loc("n 行", "n lines"),
  },
  {
    id: "card",
    index: "06",
    name: "Card",
    zh: loc("卡片", "Card"),
    oneLiner: loc("同一张卡就地变高，标题还在流里", "The same card grows in place; the title stays in flow"),
    scenes: [
      loc("摘要卡", "A summary card"),
      loc("就地看详情", "Detail in place"),
      loc("不要把标题飞走", "Do not fly the title away"),
    ],
    rules: [
      loc("同一张卡变高，不是另开一层", "The same card grows; no second layer"),
      loc("标题始终在流里", "The title stays in flow"),
      loc("多出来的块先长高再淡入；关上先淡出再收", "Extra blocks fade in after size; close reverses"),
    ],
    spec: loc(
      "做就地展开的摘要卡。点卡片，同一张卡变高，标题还在流里。多出来的块等高度走完再淡入；关上先淡出再收高度。不要把内容做成浮层。",
      "A summary card that grows in place. Click it: the same card gets taller, the title stays in flow. Extra blocks fade in after the size; close fades out then shrinks. Do not float the extra content.",
    ),
    note: loc("同一张卡变高。标题不要飞到另一层。", "The same card grows. Do not fly the title to another layer."),
    tells: loc("卡变高，标题还在原来的位置", "The card grows; the title stays where it was"),
    chip: loc("就地长", "Grows in place"),
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc(
      "别说「展开」，说手风琴、折叠、树、行详情、读更多或卡片",
      "Not “an expand” — accordion, collapse, tree, row, read more, or card",
    ),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc(
      "FAQ、独立说明、内容树、对照着下一行、长文、摘要卡",
      "A FAQ, independent notes, a content tree, the next row, long copy, a summary card",
    ),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc(
      "撑开文档流，不是盖一层；互斥还是独立；高度走 0fr → 1fr",
      "Push document flow, do not cover; exclusive or independent; height on 0fr → 1fr",
    ),
  },
];
