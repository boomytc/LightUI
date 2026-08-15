import { loc, type Localized } from "./site-locale";

export type KindId =
  | "floating"
  | "sidebar"
  | "breadcrumb"
  | "dropdown"
  | "mega"
  | "drawer"
  | "overlay"
  | "scrollspy"
  | "shrink";

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
  lives: Localized;
};

export const KINDS: KindMeta[] = [
  {
    id: "floating",
    index: "01",
    name: "Floating · Sticky",
    zh: loc("悬浮吸顶", "Floating · sticky"),
    oneLiner: loc("离顶的圆角卡，往下滚钉在顶部", "An inset card that pins as you scroll"),
    scenes: [loc("作品集", "Portfolio"), loc("品牌站", "Brand site"), loc("轻量官网", "A light marketing site")],
    rules: [
      loc("sticky + top 偏移，不要 fixed", "sticky + a top offset, not fixed"),
      loc("width: max-content，居中才是浮卡", "max-content, centered — a card, not a flush bar"),
      loc("祖先 overflow 会打断 sticky", "An overflow ancestor kills sticky"),
    ],
    spec: loc(
      "做悬浮吸顶导航：离顶留白的圆角浮卡，用 sticky 钉住，不要用 fixed。",
      "A floating sticky nav: an inset rounded card, pinned with sticky, not fixed.",
    ),
    lives: loc("占位，钉在顶部", "Occupies; pins"),
  },
  {
    id: "sidebar",
    index: "02",
    name: "Sidebar",
    zh: loc("侧栏", "Sidebar"),
    oneLiner: loc("竖排主导航，能折成一排图标", "Vertical primary nav; may collapse to icons"),
    scenes: [loc("控制台", "Console"), loc("后台", "Admin"), loc("工具产品", "A tool product")],
    rules: [
      loc("长期占位，不是临时盖上来", "Occupies for the session, not an overlay"),
      loc("折叠只改宽度，图标留下", "Collapse changes width; icons stay"),
      loc("小屏不要挤这一栏，改抽屉", "On a small screen, do not squeeze it — use a drawer"),
    ],
    spec: loc(
      "做竖排主导航：侧栏长期占位，可折成图标栏。占位和展开的五种模型见「侧边栏」。",
      "A vertical primary nav: the rail occupies, and may collapse to icons. The five space models live in Sidebar.",
    ),
    note: loc("竖排是一种主导航。五种空间模型在另一则。", "Vertical is a kind of primary nav. The five space models live in the other study."),
    lives: loc("占位；竖排", "Occupies; vertical"),
  },
  {
    id: "breadcrumb",
    index: "03",
    name: "Breadcrumb",
    zh: loc("面包屑", "Breadcrumb"),
    oneLiner: loc("主导航下面的路径，不是主菜单", "A path under the primary nav — not the menu"),
    scenes: [loc("文档", "Docs"), loc("电商深层页", "A deep commerce page"), loc("从搜索进来", "Landed from search")],
    rules: [
      loc("最后一项是当前页，不要再包链接", "The last item is the page; it is not a link"),
      loc("分隔符不要写进链接文字", "The separator is not part of the link text"),
      loc("它不能替代主导航", "It cannot replace the primary nav"),
    ],
    spec: loc(
      "做面包屑：放在主导航下面，最后一项是当前页不能点，点上一级路径缩短。",
      "A breadcrumb under the primary nav: the last item is the page, not a link; an ancestor shortens the path.",
    ),
    note: loc("面包屑是路径。它不是主导航。", "A breadcrumb is a path. It is not the primary nav."),
    lives: loc("辅助；在主导航下面", "Auxiliary; under the primary"),
  },
  {
    id: "dropdown",
    index: "04",
    name: "Dropdown",
    zh: loc("二级下拉", "Dropdown"),
    oneLiner: loc("栏目下弹出一列子页", "A column of children under one section"),
    scenes: [loc("常规官网", "A regular site"), loc("内容站", "A content site"), loc("每栏 3–8 个子页", "3–8 children per section")],
    rules: [
      loc("这是站点栏目，不是表单", "A site section, not a form field"),
      loc("桌面 hover，触屏改成点按", "Hover on a fine pointer; tap on touch"),
      loc("触发器和菜单之间不要留缝", "Do not leave a gap between trigger and menu"),
    ],
    spec: loc(
      "做站点二级下拉：工具栏下开一列子页。提交规则见「下拉框」；斜向穿越见「多级菜单」。",
      "A site dropdown: one column of children under a section. Commit models live in Dropdown; the corridor lives in Cascade menu.",
    ),
    note: loc("下拉是一列子页。巨型是多列分类。", "A dropdown is one column. Mega is a classified grid."),
    lives: loc("顶栏；一列展开", "Top bar; one column"),
  },
  {
    id: "mega",
    index: "05",
    name: "Mega Menu",
    zh: loc("巨型菜单", "Mega menu"),
    oneLiner: loc("一整块多列分类，不是一行子链", "A multi-column panel, not one child list"),
    scenes: [loc("电商", "Commerce"), loc("分类很多的大站", "A dense catalog"), loc("超过两级的 IA", "IA deeper than two levels")],
    rules: [
      loc("面板对齐导航宽度，内部分列", "The panel matches the bar; columns file the IA"),
      loc("列数跟着内容走，不要硬塞空列", "Columns follow the content; do not pad empty ones"),
      loc("小屏降级成手风琴或抽屉", "On a small screen, accordion or drawer — not a squeezed mega"),
    ],
    spec: loc(
      "做站点巨型菜单：悬停后铺开多列分类。这是导航，不是表单。小屏不要把面板缩到 390px。",
      "A site mega menu: hover opens classified columns. This is navigation, not a field. Do not squeeze it to 390px.",
    ),
    note: loc("下拉是一列子页。巨型是多列分类。", "A dropdown is one column. Mega is a classified grid."),
    lives: loc("顶栏；整宽多列", "Top bar; full-width columns"),
  },
  {
    id: "drawer",
    index: "06",
    name: "Hamburger · Drawer",
    zh: loc("汉堡抽屉", "Hamburger · drawer"),
    oneLiner: loc("小屏主导航，从侧边滑入", "Small-screen primary; slides from the edge"),
    scenes: [loc("任何站点的小屏", "Any site under ~768px"), loc("桌面有顶栏时换档", "The small-screen stand-in for a top bar")],
    rules: [
      loc("从右边滑，关掉钮放在抽屉里", "Slides from the right; the close control lives in the drawer"),
      loc("打开时锁滚动", "Lock scroll while it is open"),
      loc("Esc / 遮罩 / 关闭钮都能关", "Esc, backdrop, and the close button all dismiss"),
    ],
    spec: loc(
      "做汉堡抽屉：小屏主导航从右侧滑入，打开时锁滚动，Esc 或遮罩关闭。它不是全屏遮罩，也不是桌面侧栏。",
      "A hamburger drawer: small-screen primary slides in from the right, scroll locked, Esc or backdrop closes. Not a full-screen overlay, and not a desktop rail.",
    ),
    note: loc("抽屉占一条边。全屏把页面换成菜单。", "A drawer takes an edge. Overlay replaces the page."),
    lives: loc("默认不占位；从右侧盖上来", "No occupancy; overlays from the right"),
  },
  {
    id: "overlay",
    index: "07",
    name: "Full-screen Overlay",
    zh: loc("全屏遮罩", "Full-screen overlay"),
    oneLiner: loc("盖住整页，大字居中", "Covers the page; large centered type"),
    scenes: [loc("作品集", "Portfolio"), loc("活动页", "A campaign page"), loc("入口很少", "Very few destinations")],
    rules: [
      loc("整页换成菜单，不是一条边", "The page becomes the menu, not an edge panel"),
      loc("打开时锁滚动", "Lock scroll while it is open"),
      loc("字号用 clamp，行高至少 44px", "clamp the type; 44px line boxes"),
    ],
    spec: loc(
      "做全屏遮罩菜单：点开后盖住整页，链接大字居中。它不是从边上滑进来的抽屉。",
      "A full-screen overlay menu: the page becomes large centered links. It is not a drawer sliding from an edge.",
    ),
    note: loc("抽屉占一条边。全屏把页面换成菜单。", "A drawer takes an edge. Overlay replaces the page."),
    lives: loc("盖住整页", "Replaces the page"),
  },
  {
    id: "scrollspy",
    index: "08",
    name: "Scrollspy",
    zh: loc("锚点导航", "Scrollspy"),
    oneLiner: loc("滚到哪个区块，对应项高亮", "The highlight follows the section in view"),
    scenes: [loc("单页落地", "A landing page"), loc("帮助文档", "Help docs"), loc("按区块分段的长页", "A long page in sections")],
    rules: [
      loc("观察滚动容器，不要误用 window", "Observe the scroller, not the window by mistake"),
      loc("多个相交时取比例最高的", "When several intersect, take the highest ratio"),
      loc("点击跳转时先锁观察器", "Lock the observer during a click jump"),
    ],
    spec: loc(
      "做锚点导航：滚到哪一节高亮哪一项。点击跳转时先锁观察器，避免高亮来回跳。",
      "A scrollspy: the highlight follows the section. Lock the observer during a click jump so it does not flicker.",
    ),
    lives: loc("占位；高亮跟着滚", "Occupies; highlight follows"),
  },
  {
    id: "shrink",
    index: "09",
    name: "Shrink on Scroll",
    zh: loc("滚动收缩", "Shrink on scroll"),
    oneLiner: loc("大图上先透明，过阈值变矮变实", "Transparent over the hero; then shorter and solid"),
    scenes: [loc("大图首屏", "A hero image"), loc("品牌站", "A brand site"), loc("导航要先让位", "The bar should yield to the picture")],
    rules: [
      loc("同时变高度、背景、文字对比", "Change height, fill, and contrast together"),
      loc("进入 40、退出 16，两道阈值", "Enter at 40, leave at 16 — two thresholds"),
      loc("不要动画 height 引发重排，过渡 padding / 背景", "Do not animate height; transition padding and fill"),
    ],
    spec: loc(
      "做滚动收缩顶栏：叠在大图上先透明，滚过 40px 变矮变实，回到 16px 以内再展开，避免闪烁。",
      "A shrinking top bar: transparent over the hero, shorter and solid past 40px, expands again only under 16px so it does not flicker.",
    ),
    note: loc("收缩改的是顶栏自己。吸顶改的是钉住的位置。", "Shrink changes the bar itself. Sticky changes where it pins."),
    lives: loc("叠在大图上；自己变矮", "Over the hero; the bar itself shrinks"),
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc("别说「导航栏」，说吸顶 / 抽屉 / 锚点", "Not “a navbar” — sticky, a drawer, or a spy"),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc("官网浮卡，后台侧栏，小屏不该继续巨型菜单", "A site floats; an admin occupies; a phone cannot keep a mega"),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc("放在哪、怎么开、滚的时候钉住、高亮还是变矮", "Where it lives, how it opens, pin / highlight / shrink"),
  },
];
