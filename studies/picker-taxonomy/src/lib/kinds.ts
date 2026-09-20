import { loc, type Localized } from "./site-locale";
import type { KindId, PickShape } from "./machines";

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
};

export const KINDS: KindMeta[] = [
  {
    id: "ruler",
    index: "01",
    name: "Ruler",
    zh: loc("滑动标尺", "Ruler"),
    oneLiner: loc(
      "一个刻度上的数值：指针固定，刻度滑动，松手对齐",
      "One value on a scale: pointer fixed, ticks slide, snap on release",
    ),
    scenes: [
      loc("设置体重", "Set a weight"),
      loc("身高、温度等连续数值", "Height, temperature, a continuous number"),
      loc("步长 0.1，不要两个端点", "Step 0.1 — not two thumbs"),
    ],
    rules: [
      loc("指针固定在视口中央", "The pointer stays in the middle of the well"),
      loc("刻度横向滑动", "The ticks slide horizontally"),
      loc("松手对齐最近的 0.1", "Release snaps to the nearest 0.1"),
    ],
    spec: loc(
      "体重用横向滑动标尺，指针固定，每隔 0.1 公斤，松手后自动对齐最近刻度。不要做成输入框，不要做成两个圆点的范围滑块。",
      "Weight uses a horizontal ruler. The pointer stays, ticks are 0.1 kg, release snaps to the nearest tick. Not a text field. Not a dual-thumb range.",
    ),
    note: loc(
      "一个值对一根指针。两个端点才是区间。",
      "One value against one pointer. Two thumbs are a span.",
    ),
    tells: loc("指针不动，尺子动，松手对齐", "Pointer still, ruler moves, snap on release"),
  },
  {
    id: "range",
    index: "02",
    name: "Range",
    zh: loc("范围滑块", "Range"),
    oneLiner: loc(
      "同时要下限和上限：两个端点，实时金额，不能交叉",
      "A floor and a ceiling at once: two thumbs, live values, they must not cross",
    ),
    scenes: [
      loc("筛选价格", "Filter by price"),
      loc("面积、预算等区间", "Area, budget, a span"),
      loc("最低价不能超过最高价", "The floor cannot pass the ceiling"),
    ],
    rules: [
      loc("两个端点同时可见", "Both thumbs stay in view"),
      loc("拖动时金额跟着变", "The amounts update while dragging"),
      loc("端点之间留出间距，不能交叉", "Keep a gap; the ends must not cross"),
    ],
    spec: loc(
      "价格用双端范围滑块，拖动时实时显示金额，最低价不能超过最高价。不要做成两个独立输入框。",
      "Price uses a dual-thumb range. Amounts update while dragging. The floor cannot pass the ceiling. Not two independent boxes.",
    ),
    note: loc(
      "两个端点联动。体重那种一个值不要用它。",
      "The thumbs move as a pair. A single value like weight does not use this.",
    ),
    tells: loc("两端都在，最低到不了最高上面", "Both ends stay; the floor cannot pass the ceiling"),
  },
  {
    id: "stepper",
    index: "03",
    name: "Stepper",
    zh: loc("步进器", "Stepper"),
    oneLiner: loc(
      "少量个数：每次加减一个，到下限禁用减号",
      "A small count: plus or minus one, disable minus at the floor",
    ),
    scenes: [
      loc("购物袋数量", "Cart quantity"),
      loc("份数、件数", "Portions or pieces"),
      loc("每次 1 个，不要滑尺子", "One at a time — not a sliding ruler"),
    ],
    rules: [
      loc("按固定步长加减", "Change by a fixed step"),
      loc("最少为 1", "The floor is 1"),
      loc("到下限时禁用减号", "Disable minus at the floor"),
    ],
    spec: loc(
      "数量用步进器，每次增加或减少一个，最少为 1，到下限时禁用减号。不要做成尺子，不要弹出键盘。",
      "Quantity uses a stepper. Plus or minus one, floor at 1, disable minus at the floor. Not a ruler. Not a keyboard.",
    ),
    note: loc(
      "份数很少。滑 0.1 的尺子是另一台机器。",
      "The count is small. Sliding 0.1 on a ruler is a different machine.",
    ),
    tells: loc("每次 1 个，减到 1 就停", "One at a time; minus stops at 1"),
  },
  {
    id: "cascader",
    index: "04",
    name: "Cascader",
    zh: loc("级联选择", "Cascader"),
    oneLiner: loc(
      "先上级再下级：选项跟着变，更换上级时清空下级",
      "Parent then child: options follow, changing a parent clears the children",
    ),
    scenes: [
      loc("选择收货地区", "Pick a shipping region"),
      loc("省市区、层级分类", "Province / city / district, a tree"),
      loc("不要把省当成最终值", "A province is not a finished value"),
    ],
    rules: [
      loc("一次只看当前级", "One level at a time"),
      loc("选项随上级变", "Options follow the parent"),
      loc("更换上级时，清空下级选择", "Changing a parent clears the children"),
    ],
    spec: loc(
      "地址按省、市、区三级选择，更换省或市时清空下级选择。不要摊成一张长列表，不要把「江苏省」当成最终值。",
      "Address is province, then city, then district. Changing a parent clears the children. Not one long list. “Jiangsu” is not a finished value.",
    ),
    note: loc(
      "整页逐级选。往下展开提交一条路径，是另一问。",
      "Full-screen, one level at a time. Committing a path from a downward panel is another question.",
    ),
    tells: loc("换了省，市和区都要重选", "Change the province, and city and district must be picked again"),
  },
  {
    id: "dates",
    index: "05",
    name: "Dates",
    zh: loc("日期范围", "Date range"),
    oneLiner: loc(
      "日历上的起止：先起后止，高亮中间，止必须晚于起",
      "A start and an end on a calendar: start then end, highlight the middle, end after start",
    ),
    scenes: [
      loc("酒店入住与离店", "Hotel check-in and check-out"),
      loc("行程、租期", "A trip or a rental span"),
      loc("过去的日期不可选", "Past days are off"),
    ],
    rules: [
      loc("先选入住，再选离店", "Check-in first, then check-out"),
      loc("高亮中间的日期", "Highlight the days in between"),
      loc("离店必须晚于入住；过去不可选", "Check-out after check-in; past days are off"),
    ],
    spec: loc(
      "日历支持选择入住和离店，高亮中间日期，离店必须晚于入住。过去的日期不可选。不要做成两个独立的日期框。",
      "The calendar picks check-in then check-out, highlights the days in between, and requires check-out after check-in. Past days are off. Not two independent date fields.",
    ),
    note: loc(
      "高亮整段，才能看见住几晚。两个 date 框会把中间藏起来。",
      "Highlight the span so the nights are visible. Two date fields hide the middle.",
    ),
    tells: loc("先入住后离店，中间那几天也亮着", "Check-in then check-out; the nights in between stay lit"),
  },
];

export const SHAPE_ASKS: { id: KindId; shape: PickShape; ask: Localized }[] = [
  {
    id: "ruler",
    shape: "one-tick",
    ask: loc("一个连续刻度上的数值", "One value on a continuous scale"),
  },
  {
    id: "range",
    shape: "two-ends",
    ask: loc("同时要下限和上限", "A floor and a ceiling at once"),
  },
  {
    id: "stepper",
    shape: "few-steps",
    ask: loc("少量、固定步长的个数", "A small count with a fixed step"),
  },
  {
    id: "cascader",
    shape: "tree-path",
    ask: loc("先上级再下级的路径", "A parent-then-child path"),
  },
  {
    id: "dates",
    shape: "date-span",
    ask: loc("日历上的起止日期", "A start and an end on a calendar"),
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc(
      "别说「做个选择器」，说滑动标尺、范围滑块、步进器、级联选择或日期范围",
      "Not “a picker” — ruler, range, stepper, cascader, or date range",
    ),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc(
      "一个刻度、两个端点、少量个数、层级路径，还是起止日期",
      "One tick, two ends, a small count, a path, or a start and an end",
    ),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc(
      "松手对齐 / 端点不交叉 / 下限禁用 / 换上级清空下级 / 止晚于起",
      "Snap on release / ends do not cross / disable at the floor / changing a parent clears children / end after start",
    ),
  },
];
