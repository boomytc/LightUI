import { loc, type Localized } from "./site-locale";
import { gestureClass, type GestureClass, type KindId } from "./machines";

export type KindMeta = {
  id: KindId;
  index: string;
  name: string;
  zh: Localized;
  klass: GestureClass;
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
    id: "brush",
    index: "01",
    name: "Brush",
    zh: loc("框选", "Brush"),
    klass: gestureClass("brush"),
    oneLiner: loc("冻一段区间，算出均值和峰值；不改展示窗口", "Freeze a range, derive avg and peak; do not change the window"),
    scenes: [loc("框一周看均值", "Brush a week for the average"), loc("对照峰值", "Compare to the peak")],
    rules: [
      loc("按下记原点，拖出含端区间", "Down marks the origin; drag an inclusive span"),
      loc("松手冻结，origin 清空", "Up freezes; origin clears"),
      loc("用区间算均值和峰值，轴还在原来的窗", "Stats from the range; the axis stays"),
    ],
    spec: loc(
      "图上这一手是框选。按下记原点，拖出含端区间，松手冻结。用这段算均值和峰值。框选不是缩放：展示窗口不动。",
      "This gesture is a brush. Pointer down marks the origin, drag an inclusive range, up freezes it. Derive avg and peak. A brush is not a zoom: the display window does not move.",
    ),
    note: loc("框选冻结不是缩放窗口。", "A frozen brush is not a zoom window."),
    tells: loc("松手后色带还在，轴没缩", "The band stays after release; the axis does not shrink"),
    window: loc("日访问 · 框选", "Daily visits · brush"),
  },
  {
    id: "crosshair",
    index: "02",
    name: "Crosshair",
    zh: loc("十字线", "Crosshair"),
    klass: gestureClass("crosshair"),
    oneLiner: loc("吸附最近下标；离开就藏", "Snap to the nearest index; hide on leave"),
    scenes: [loc("对一下某天的值", "Read one day's value"), loc("顺着线走", "Walk the line")],
    rules: [
      loc("px 映射到最近下标，不要连续滑值", "Map px to the nearest index, not a continuous value"),
      loc("十字跟着点走", "The hair follows the snapped point"),
      loc("指针离开，层卸掉", "Leave unmounts the hair"),
    ],
    spec: loc(
      "图上这一手是读数。十字线吸附最近下标，离开就藏。不要让读一个点变成改窗口。",
      "This gesture is a readout. The crosshair snaps to the nearest index and hides on leave. Reading a point must not change the window.",
    ),
    note: loc("最近邻吸附是读点，不是视线落到格子。", "Nearest-index snap is reading a point, not gaze landing on a cell."),
    tells: loc("线跟着最近点，离开就没了", "The hair tracks the nearest point and vanishes on leave"),
    window: loc("日访问 · 十字线", "Daily visits · crosshair"),
  },
  {
    id: "highlight",
    index: "03",
    name: "Highlight",
    zh: loc("高亮", "Highlight"),
    klass: gestureClass("highlight"),
    oneLiner: loc("点出叙事点：异常低点或峰值，其余变淡", "Select a narrative point: anomaly or peak; dim the rest"),
    scenes: [loc("点出异常低点", "Call out the dip"), loc("点出峰值", "Call out the peak")],
    rules: [
      loc("高亮是读数，不是过滤系列", "A highlight is a readout, not a series filter"),
      loc("两种叙事：异常低点 / 峰值", "Two stories: anomaly dip / peak"),
      loc("其余点变淡，轴不动", "The others dim; the axis stays"),
    ],
    spec: loc(
      "图上这一手是读数。高亮一个叙事点——异常低点或峰值——其余变淡。不要把它做成藏系列，也不要改窗口。",
      "This gesture is a readout. Highlight a narrative point — the anomaly dip or the peak — and dim the rest. Do not hide a series. Do not change the window.",
    ),
    note: loc("叙事点不是图例过滤。", "A narrative point is not a legend filter."),
    tells: loc("一个点亮着，别的都淡", "One point is lit; the others recede"),
    window: loc("日访问 · 高亮", "Daily visits · highlight"),
  },
  {
    id: "tooltip",
    index: "04",
    name: "Tooltip",
    zh: loc("读数卡", "Tooltip"),
    klass: gestureClass("tooltip"),
    oneLiner: loc("hover 一个点出卡片；离开卸掉，图的尺寸锁定", "Hover one point for a card; leave unmounts it; plot size stays"),
    scenes: [loc("看一个点的值", "Read one value"), loc("扫过去就走", "Glance and leave")],
    rules: [
      loc("卡片是层，不是把图撑开", "The card is a layer, not a layout push"),
      loc("离开卸载，不要留空位", "Leave unmounts it; do not leave a hole"),
      loc("图不跳、轴不动", "The plot does not jump; the axis stays"),
    ],
    spec: loc(
      "图上这一手是读数。hover 一个点弹出读数卡，离开就把层卸掉。卡片绝对定位，图的尺寸锁定，不要让读一个点把图撑开。",
      "This gesture is a readout. Hover one point for a card; leave unmounts the layer. The card is absolutely positioned so the plot size stays locked.",
    ),
    note: loc("读数卡撑开图，离开后图还会抖。", "A tooltip that grows the plot will jump when it leaves."),
    tells: loc("卡片来了图不动，走了也不留坑", "The card appears without moving the plot, and leaves no hole"),
    window: loc("日访问 · 读数卡", "Daily visits · tooltip"),
  },
  {
    id: "legend",
    index: "05",
    name: "Legend",
    zh: loc("图例", "Legend"),
    klass: gestureClass("legend"),
    oneLiner: loc("切换系列显隐；不能把最后一条可见系列藏掉", "Toggle series; the last visible series stays"),
    scenes: [loc("对比三条线", "Compare three series"), loc("先藏邮件", "Hide mail first")],
    rules: [
      loc("图例是过滤态，不是装饰色块", "The legend is filter state, not a color key"),
      loc("点一下藏或显现一条", "A click hides or shows one series"),
      loc("最后一条可见系列点了也不藏", "The last visible series cannot hide"),
    ],
    spec: loc(
      "图上这一手是过滤。图例切换系列显隐，不是装饰。不能把最后一条可见系列藏掉，否则图上什么都没有。",
      "This gesture is a filter. The legend toggles series visibility; it is not decoration. It cannot hide the last visible series, or the plot goes empty.",
    ),
    note: loc("图例是过滤态不是装饰。", "A legend is filter state, not decoration."),
    tells: loc("点掉两条还在，点第三条没反应", "Two can hide; the third click does nothing"),
    window: loc("日访问 · 图例", "Daily visits · legend"),
  },
  {
    id: "zoom",
    index: "06",
    name: "Zoom",
    zh: loc("缩放", "Zoom"),
    klass: gestureClass("zoom"),
    oneLiner: loc("[start,end] 切片；滚轮或 30/7/3，绕光标缩放", "[start,end] slice; wheel or 30/7/3, scale around the cursor"),
    scenes: [loc("看近一周", "See the last week"), loc("再看三天", "Then three days")],
    rules: [
      loc("改的是展示窗口，不是冻结一段", "This changes the display window, not a frozen band"),
      loc("绕光标下标缩放，跨度至少 minSpan", "Scale around the cursor index; span at least minSpan"),
      loc("夹到 [0, maxEnd]", "Clamp to [0, maxEnd]"),
    ],
    spec: loc(
      "图上这一手是改窗口。滚轮或 30/7/3 预置，用 zoomWindow 绕光标切 [start,end]。这不是框选冻结，也不是读一个点。",
      "This gesture is a window change. Wheel or 30/7/3 presets call zoomWindow around the cursor to slice [start, end]. It is not a frozen brush, and not a readout.",
    ),
    note: loc("缩放才改窗口。框选留下的是一段统计。", "Zoom changes the window. A brush leaves a stats range."),
    tells: loc("轴上的天数变少了，点还在光标附近", "Fewer days on the axis; points stay near the cursor"),
    window: loc("日访问 · 窗口", "Daily visits · window"),
  },
  {
    id: "drill",
    index: "07",
    name: "Drill",
    zh: loc("下钻", "Drill"),
    klass: gestureClass("drill"),
    oneLiner: loc("有子节点才推进路径；面包屑弹出。同一张图上的路径", "Push a child id only if it has children; breadcrumb pops. A path on one chart"),
    scenes: [loc("渠道 → 分类 → 页面", "Channel → category → page"), loc("点面包屑回来", "Pop via breadcrumb")],
    rules: [
      loc("这是路径，不是换图种", "This is a path, not a mark change"),
      loc("叶子不推进", "A leaf does not push"),
      loc("面包屑按长度弹出；不是看板从结果往下钻", "Breadcrumb pops by length; not a dashboard platter drill"),
    ],
    spec: loc(
      "图上这一手是换路径。柱图从渠道点到分类再点到页面，有子节点才推进。叶子停住。面包屑弹出。这是同一张图上的路径，不是换图种，也不是看板从结果往下钻。",
      "This gesture is a path change. Bars walk channel → category → page; only a node with children pushes. A leaf stays. Breadcrumb pops. A path on one chart — not a new mark, not a dashboard drill from the result.",
    ),
    note: loc("图内换层不是看板从结果往下钻。", "Changing path on a chart is not drilling a board from the result."),
    tells: loc("柱还是柱，上面的路径变了", "Still bars; the path above them changed"),
    window: loc("来源 · 下钻", "Source · drill"),
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc("别说「加点交互」，说读数、过滤、框选、改窗口或换路径", "Not “add interaction” — readout, filter, brush, window, or path"),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc("看一个点、藏一条线、框一段算均值、滚轮改窗、点柱换层", "Read a point, hide a series, brush stats, wheel the window, click a bar"),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc("离开就卸；最后一条不能藏；框选冻结不是缩放", "Leave unmounts; last series stays; a frozen brush is not a zoom"),
  },
];
