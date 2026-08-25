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
  window: Localized;
};

export const KINDS: KindMeta[] = [
  {
    id: "page",
    index: "01",
    name: "Page",
    zh: loc("翻页", "Page"),
    oneLiner: loc("整页替换；旧卡卸掉，列表回到顶部", "Replace the page; old cards drop, the list returns to top"),
    scenes: [
      loc("资料库翻页", "A library page"),
      loc("表格上一页 / 下一页", "Previous / next in a table"),
      loc("只看这一页切片", "This slice only"),
    ],
    rules: [
      loc("换页丢掉上一页，只留 pageSlice", "Changing page drops the last page; pageSlice only"),
      loc("列表容器滚回顶部", "The list container resets to the top"),
      loc("高亮滑到当前页；显示 showing a–b of n", "The chip slides to the current page; showing a–b of n"),
    ],
    spec: loc(
      "做翻页。24 张资料卡，底部分页 1..n。点第 2 页时上一页的卡片卸掉，列表滚回顶部，高亮滑到当前页。显示 showing a–b of n。不要做成走马灯。",
      "Paging. 24 resource cards, pages 1..n. On page 2 the previous cards unmount, the list returns to top, the chip slides. Show showing a–b of n. Not a carousel.",
    ),
    note: loc(
      "翻页不是轮播。上一页 / 下一页切的是这一页记录，不是一组海报在轨道上循环。",
      "Paging is not a carousel. Previous / next cuts this page of records, not posters on a track.",
    ),
    tells: loc("旧卡没了，人回到顶部", "Old cards are gone; the reader is back at the top"),
    window: loc("资料 · 翻页", "Library · page"),
  },
  {
    id: "append",
    index: "02",
    name: "Append",
    zh: loc("追加", "Append"),
    oneLiner: loc("末尾追加；visibleCount 增加，旧节点不卸", "Append at the end; visibleCount grows, old nodes stay"),
    scenes: [
      loc("加载更多", "Load more"),
      loc("已经看见的接到后面", "Tack onto what is already visible"),
      loc("按钮追加，不是自动请求", "A button, not an auto-request"),
    ],
    rules: [
      loc("点一下才 appendCount，不要自动请求", "A click runs appendCount; do not auto-request"),
      loc("已经渲染的卡片保留原 id", "Already rendered cards keep their ids"),
      loc("到底后变成已加载全部；显示 showing 1–k of n", "When exhausted: All loaded; showing 1–k of n"),
    ],
    spec: loc(
      "做末尾追加。点「加载更多」用 appendCount 增加可见条数；已经渲染的卡片保留原 id，不要滚回顶部。全部到齐后按钮变成「已加载全部」，不再请求。显示 showing 1–k of n。不要做成无限滚动。",
      "Append. Load more uses appendCount; already rendered cards keep their ids; do not scroll to top. When exhausted the button becomes All loaded and does not request more. Show showing 1–k of n. Not infinite scroll.",
    ),
    note: loc(
      "追加不是无限滚动自动请求。本则是按钮追加。已经到了一截也不是骨架占位。",
      "Append is not infinite-scroll auto-request. This leaf is a button. A loaded prefix is not a skeleton.",
    ),
    tells: loc("旧卡还在，新卡出现在末尾", "Old cards stay; new cards appear at the end"),
    window: loc("资料 · 追加", "Library · append"),
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc("别说「分页」，说翻页或追加", "Not “pagination” — page, or append"),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc("这一批替换当前页，还是接到已经看见的后面", "This batch replaces the page, or tacks onto what is already visible"),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc("旧节点丢不丢、滚动回不回顶", "Drop the old nodes or not; reset scroll or not"),
  },
];
