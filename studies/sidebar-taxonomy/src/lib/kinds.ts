import { loc, type Localized } from "./site-locale";

export type KindId = "floating" | "wheel" | "multilevel" | "collapsible" | "offcanvas";

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
  occupies: Localized;
};

export const KINDS: KindMeta[] = [
  {
    id: "floating",
    index: "01",
    name: "Floating Island",
    zh: loc("悬浮岛", "Floating island"),
    oneLiner: loc("不贴边，像一张独立悬浮的导航卡", "Inset. A card that floats off the canvas"),
    scenes: [
      loc("工作台", "Workspace"),
      loc("项目管理", "Project hub"),
      loc("设计工具", "Design tool"),
    ],
    rules: [
      loc("四周留白，不贴 window 边缘", "Inset padding, not flush to the window"),
      loc("圆角卡片 + 柔和阴影", "Rounded card + soft shadow"),
      loc("默认占位", "Occupies space by default"),
    ],
    spec: loc(
      "做左侧悬浮岛式导航：离边留白、圆角卡片、柔和阴影，展开宽 216px，当前项高亮。",
      "A left floating-island nav: inset, rounded card, soft shadow, 216px wide, current item highlighted.",
    ),
    occupies: loc("占位，但不贴边", "Occupies, not flush"),
  },
  {
    id: "wheel",
    index: "02",
    name: "Option Wheel",
    zh: loc("弧形滚轮", "Option wheel"),
    oneLiner: loc("选项沿圆弧滚动，到达基准线才高亮", "Items roll on an arc; only the baseline is current"),
    scenes: [
      loc("作品集", "Portfolio"),
      loc("章节切换", "Chapter switcher"),
      loc("少量有序选项", "A short ordered set"),
    ],
    rules: [
      loc("只有 offset = 0 的项是当前项", "Only offset 0 is current"),
      loc("远端旋转、变淡、加模糊", "Far items rotate, fade, and blur"),
      loc("滚轮 / 方向键吸附到下一项", "Wheel / arrows snap to the next item"),
    ],
    spec: loc(
      "做弧形滚轮导航：选项到达基准线才高亮，远端旋转并模糊。这是选择器，不是目录树。",
      "An option-wheel nav: highlight only on the baseline, fade and blur the rest. A selector, not a tree.",
    ),
    note: loc("多级是树。滚轮是一条有序选择器。", "Multi-level is a tree. A wheel is an ordered selector."),
    occupies: loc("占位；当前项由基准线决定", "Occupies; current = baseline"),
  },
  {
    id: "multilevel",
    index: "03",
    name: "Multi-level",
    zh: loc("多级侧栏", "Multi-level"),
    oneLiner: loc("父级归类，点击后展开缩进的子菜单", "Parents file the list; children indent"),
    scenes: [
      loc("电商后台", "Commerce admin"),
      loc("设置页", "Settings"),
      loc("功能很多的控制台", "A dense console"),
    ],
    rules: [
      loc("父级只展开，不是最终页", "A parent only expands — it is not the page"),
      loc("子级缩进", "Children indent"),
      loc("点开才长高，不是 hover 跟手", "Height grows on click, not hover"),
    ],
    spec: loc(
      "做多级侧栏：父级可展开收起，子级缩进，只有子级（或无子级的叶）才是当前页。",
      "A multi-level rail: parents expand and collapse, children indent, only a leaf (or a childless item) is the page.",
    ),
    note: loc("多级是树。滚轮是一条有序选择器。", "Multi-level is a tree. A wheel is an ordered selector."),
    occupies: loc("占位；父级归类", "Occupies; parents file"),
  },
  {
    id: "collapsible",
    index: "04",
    name: "Collapsible",
    zh: loc("可折叠", "Collapsible"),
    oneLiner: loc("展开有文字，收起后只留图标", "Labels when open; icons only when shut"),
    scenes: [
      loc("分析看板", "Analytics"),
      loc("需要主区变宽的表格", "A table that wants the width"),
      loc("桌面工具", "Desktop tool"),
    ],
    rules: [
      loc("宽度 240 → 72，主区跟着伸", "Width 240 → 72; the main view grows"),
      loc("图标位置固定，文字淡出", "Icons stay put; labels fade"),
      loc("收起后仍占一条栏", "Collapsed still occupies a rail"),
    ],
    spec: loc(
      "做可折叠侧栏：展开宽 240px，收起为图标栏，主内容区随宽度同步伸展。折叠后仍占位。",
      "A collapsible rail: 240px open, icon rail shut, the main view grows with it. Collapsed still occupies space.",
    ),
    note: loc("可折叠不是隐藏式。折叠后仍占一条图标栏。", "Collapsible is not off-canvas. Collapsed still occupies an icon rail."),
    occupies: loc("占位，宽度可变", "Occupies; width varies"),
  },
  {
    id: "offcanvas",
    index: "05",
    name: "Off-canvas",
    zh: loc("隐藏式", "Off-canvas"),
    oneLiner: loc("默认藏在画布外，点击后滑入", "Hidden off-canvas; slides in when asked"),
    scenes: [
      loc("长文目录", "Long-form TOC"),
      loc("营销落地页", "Marketing page"),
      loc("小屏主导航", "Small-screen primary nav"),
    ],
    rules: [
      loc("默认宽度为零", "Default width is zero"),
      loc("translateX 滑入，遮罩可关", "Slides in with translateX; backdrop closes"),
      loc("Esc 关闭，焦点回到按钮", "Esc closes; focus returns to the trigger"),
    ],
    spec: loc(
      "做隐藏式侧栏：默认不占位，点按钮从左侧滑入，遮罩或 Esc 关闭，焦点回到触发按钮。",
      "An off-canvas rail: no occupancy by default, slide in from the left, close on backdrop or Esc, focus the trigger.",
    ),
    note: loc("可折叠不是隐藏式。隐藏式默认宽度为零。", "Collapsible is not off-canvas. Off-canvas has zero width until it opens."),
    occupies: loc("默认不占位；盖上来", "No occupancy; overlays"),
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc("别说「侧边栏」，说悬浮岛 / 可折叠 / 隐藏式", "Not “a sidebar” — an island, a collapse, or off-canvas"),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc("工作台占位，长文目录不该永远挤正文", "A workspace occupies; a long TOC should not"),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc("贴边或离边、默认占位、变宽还是盖上来", "Flush or inset, occupancy, grow vs overlay"),
  },
];
