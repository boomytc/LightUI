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
    id: "first-use",
    index: "01",
    name: "First-use",
    zh: loc("首次使用", "First-use"),
    oneLiner: loc(
      "还没有内容：写清添加第一位，并另留导入入口",
      "Nothing yet: name adding the first, and leave an import entry",
    ),
    scenes: [
      loc("新账号初始化", "A new account"),
      loc("空项目、尚未上传的资料库", "An empty project or an unused library"),
      loc("空概览不要一排 0", "An empty overview is not a row of zeros"),
    ],
    rules: [
      loc("人话标题，不要写「暂无数据」", "A human title — not “no data”"),
      loc("主按钮写清「添加第一位客户」", "The primary names “add the first customer”"),
      loc("需要导入的，也留个入口", "Leave an import entry if they already have a file"),
    ],
    spec: loc(
      "做首次使用的空状态。库里 0 条时给一句人话、一个写清「添加第一位客户」的主按钮和「导入客户」入口。不要写「暂无数据」，不要只留白板，空概览不要一排 0。",
      "A first-use empty state. At 0 records: a human line, a primary that names “Add the first customer”, and an Import entry. Do not say “no data”. Do not leave a blank board. An empty overview is not a row of zeros.",
    ),
    note: loc(
      "主按钮只给还没开始的那一次。搜索无果和筛选无果的空井里不要再放一个。",
      "A primary is only for the case that has not started. Do not put one in the empty well of a search or filter miss.",
    ),
    tells: loc("空着也说人话，并给出第一步", "Empty still speaks in human, and offers the first step"),
    window: loc("客户列表 · 首次", "Customers · first-use"),
  },
  {
    id: "search",
    index: "02",
    name: "No search results",
    zh: loc("搜索无果", "No search results"),
    oneLiner: loc(
      "记录在，关键词没命中：保留原词，改建议放在框旁",
      "Records exist; the query missed — keep the keyword, put the hint beside the box",
    ),
    scenes: [
      loc("姓名或手机号检索", "Name or phone search"),
      loc("近音词、少写一个字", "A near-miss or a dropped character"),
      loc("站内搜索没命中", "An in-site query that misses"),
    ],
    rules: [
      loc("搜索框里还是刚才的关键词", "The box still holds the last keyword"),
      loc("修改建议放在搜索框旁", "Put the revise hint beside the search box"),
      loc("空井里不要再放创建主按钮", "Do not put a create primary in the empty well"),
    ],
    spec: loc(
      "做搜索无果。记录还在、关键词没命中时，保留搜索框和刚才的词，在框旁写「可修改关键词，或用手机号搜索」。空井里不要再放「添加第一位客户」。顶栏添加可以留，说明库还在，不要让人以为库是空的。",
      "No search results. Records exist and the query missed: keep the box and the last keyword, and put “try another word, or search by phone” beside it. Do not put “Add the first customer” in the empty well. Chrome Add may stay — the library is still there.",
    ),
    note: loc(
      "没找到「张晓」，不等于没有客户。张小雨还在库里。",
      "Missing “张晓” does not mean there are no customers. 张小雨 is still in the library.",
    ),
    tells: loc("框里还是原词，人去改关键词", "The last keyword stays; they revise the query"),
    window: loc("客户列表 · 搜索", "Customers · search"),
  },
  {
    id: "filter",
    index: "03",
    name: "No filter matches",
    zh: loc("筛选无果", "No filter matches"),
    oneLiner: loc(
      "条件过严：标签留在页面上，允许逐个移除",
      "Filters too tight: leave the chips on the page, removable one by one",
    ),
    scenes: [
      loc("城市、本周、状态叠在一起", "City, this week, and status stacked"),
      loc("订单或商品多条件查询", "A multi-filter order or catalog query"),
      loc("少一个条件结果就回来", "Dropping one filter brings rows back"),
    ],
    rules: [
      loc("当前条件留在页面上", "Keep the active filters on the page"),
      loc("每个标签都能点 × 去掉", "Each chip can be dropped with ×"),
      loc("不要让人以为一条记录都没有", "Do not imply that no records exist"),
    ],
    spec: loc(
      "做筛选无果。记录还在、条件过严时，把当前标签留在列表上方，允许逐个移除。少一个条件，结果可能就回来。不要写成「暂无数据」，不要藏起正在生效的条件。",
      "No filter matches. Records exist and the filters are too tight: leave the chips above the list, removable one by one. Dropping one filter may bring rows back. Do not say “no data”. Do not hide the active filters.",
    ),
    note: loc(
      "上海 + 本周新增 + 已成交叠在一起才是空。林悦还在，只是条件过严。",
      "Shanghai + this week + closed is what made it empty. 林悦 is still there — the filters are too tight.",
    ),
    tells: loc("标签还在，点掉一个条件", "The chips stay; they drop one filter"),
    window: loc("客户列表 · 筛选", "Customers · filter"),
  },
  {
    id: "error",
    index: "04",
    name: "Load error",
    zh: loc("加载失败", "Load error"),
    oneLiner: loc(
      "请求失败不是空：原列表还在，顶部给文字重试",
      "A failed request is not empty — keep the last list, retry on the banner",
    ),
    scenes: [
      loc("刷新列表失败", "A list refresh failed"),
      loc("网络中断、接口异常", "A network drop or a broken endpoint"),
      loc("首次请求失败也不是「还没有客户」", "A first-load failure is not “no customers yet”"),
    ],
    rules: [
      loc("不能当成没有数据", "Do not treat it as no data"),
      loc("已有内容时保留原列表", "Keep the last list when rows already exist"),
      loc("顶部轻提示，旁边给文字「重试」", "A light banner with a text Retry"),
    ],
    spec: loc(
      "做加载失败。刷新失败时不要把列表换成空状态。原来的客户记录继续保留，顶部轻提示「更新失败 · 已保留上次的客户记录」，旁边给文字重试。不要转圈进度条，不要写成「暂无数据」。",
      "A load error. Do not replace the list with an empty state when a refresh fails. Keep the last customer rows, put “Update failed · last records kept” on a light banner, and offer a text Retry. Not a spinner. Not “no data”.",
    ),
    note: loc(
      "失败是请求挂了，不是库空了。0 条时失败仍是失败，不要改口成首次使用。进度能不能算是另一问。",
      "Failure is a hung request, not an empty library. A failure at 0 rows is still a failure, not first-use. Whether progress can be measured is another question.",
    ),
    tells: loc("列表还在，旁边可以重试", "The list stays; they can retry beside it"),
    window: loc("客户列表 · 失败", "Customers · error"),
  },
  {
    id: "done",
    index: "05",
    name: "All done",
    zh: loc("全部完成", "All done"),
    oneLiner: loc(
      "待办清零是好消息：给完成反馈，不要再催操作",
      "A cleared inbox is good news: celebrate, do not nag",
    ),
    scenes: [
      loc("今日跟进全部处理完", "Today’s follow-ups are all handled"),
      loc("待办清单、审批队列清零", "A todo or approval queue hits zero"),
      loc("历史还在原导航里", "History stays in the same nav"),
    ],
    rules: [
      loc("明确写出已经完成", "Say clearly that the work is done"),
      loc("不要再放「去添加」主按钮", "Do not put a Go add primary"),
      loc("已完成的记录仍可在历史中查看", "Completed items remain on the history tab"),
    ],
    spec: loc(
      "做全部完成。今日待办清零、历史还在时，给完成标记和一句「今天的跟进已全部完成」。不要再催添加，不要写成「暂无数据」。历史留在原导航。",
      "All done. When today’s queue is clear and history remains: a completion mark and “Today’s follow-ups are done”. Do not nag them to add. Do not say “no data”. History stays in the same nav.",
    ),
    note: loc(
      "清零是好消息。没有记录才是还没开始。",
      "A cleared inbox is good news. No records yet is “we have not started”.",
    ),
    tells: loc("完成标记在，不再催下一步", "A completion mark; no further nag"),
    window: loc("今日跟进 · 完成", "Follow-ups · done"),
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc(
      "别说「做个空状态」，说首次使用、搜索无果、筛选无果、加载失败或全部完成",
      "Not “an empty state” — first-use, no search results, no filter matches, load error, or all done",
    ),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc(
      "还没有内容、关键词没命中、条件过严、请求失败、还是待办清零",
      "Nothing yet, a query miss, filters too tight, a failed request, or a cleared inbox",
    ),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc(
      "创建给入口 / 搜索改关键词 / 筛选改条件 / 失败可重试并保留列表 / 完成给反馈",
      "Create gets an entry / search revises the query / filters loosen / failure retries and keeps the list / done only celebrates",
    ),
  },
];

export const CAUSE_ASKS = [
  {
    id: "first-use" as const,
    ask: loc("库里还没有任何记录", "The library has no records yet"),
  },
  {
    id: "search" as const,
    ask: loc("记录在，关键词没命中", "Records exist; the query missed"),
  },
  {
    id: "filter" as const,
    ask: loc("记录在，条件过严", "Records exist; the filters are too tight"),
  },
  {
    id: "error" as const,
    ask: loc("请求失败，不是空", "The request failed — this is not empty"),
  },
  {
    id: "done" as const,
    ask: loc("待办清零，历史还在", "The inbox is clear; history remains"),
  },
];
