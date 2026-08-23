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
    id: "single",
    index: "01",
    name: "Single",
    zh: loc("单栏", "Single column"),
    oneLiner: loc("一条轴，正文约 42rem，安静读完", "One axis, ~42rem measure, read quietly"),
    scenes: [
      loc("博客长文", "A long read"),
      loc("设计周刊", "A design journal"),
      loc("极简产品介绍", "A quiet product note"),
    ],
    rules: [
      loc("max-width ≈ 42rem（672px）居中", "max-width ≈ 42rem (672px), centered"),
      loc("标题、图、引用落在同一列", "Title, figure, quote share one column"),
      loc("不要左侧导航，不要多栏正文", "No left rail, no multi-column body"),
    ],
    spec: loc(
      "做单栏阅读页。正文最大宽度约 42rem 居中，标题、配图、引用、段落落在同一条轴上。不要左侧导航，不要多栏正文。区块之间留出呼吸。",
      "A single-column reading page. Center a ~42rem measure. Title, figure, quote, and body share one axis. No left nav, no multi-column body. Leave air between blocks.",
    ),
    note: loc("单栏是阅读轴。落地页才是区块叙事。", "Single is a reading axis. Landing is banded narrative."),
    tells: loc("一行字落在中间，左右是空气", "Type sits in the middle; the sides are air"),
    window: loc("拾光周刊", "North Journal"),
  },
  {
    id: "landing",
    index: "02",
    name: "Landing",
    zh: loc("落地", "Landing"),
    oneLiner: loc("首屏承诺，功能带跟上，按钮收尾", "Hero promise, proof bands, a closing button"),
    scenes: [
      loc("SaaS 官网", "A SaaS site"),
      loc("下载页", "A download page"),
      loc("活动预约", "An event booking"),
    ],
    rules: [
      loc("纵向区块：承诺 → 证明 → CTA", "Stacked bands: promise → proof → CTA"),
      loc("gutter 24px，区块之间 64–96px", "24px gutter, 64–96px between bands"),
      loc("功能卡 stretch + flex-col + mt-auto", "Feature cards: stretch + flex-col + mt-auto"),
    ],
    spec: loc(
      "做落地页。纵向区块：首屏承诺 + 主/次按钮 → 三张等宽功能卡（网格拉齐、底栏 mt-auto）→ 证言 → 深色 CTA。栏间距 24px，区块之间 64–96px。不要做成仪表盘或左右后台。",
      "A landing page. Stacked bands: hero promise and two buttons → three equal-width feature cards (grid stretch, footer mt-auto) → a quote → a dark CTA. 24px gutter, 64–96px between bands. Not a dashboard, not an admin split.",
    ),
    note: loc("落地不是仪表盘。区块留白，不是 KPI 网格。", "Landing is not a dashboard. Banded whitespace, not a KPI grid."),
    tells: loc("一屏一件事，主按钮反复出现", "One job per band; the primary button returns"),
    window: loc("云帆协作", "Drift"),
  },
  {
    id: "masonry",
    index: "03",
    name: "Masonry",
    zh: loc("瀑布", "Masonry"),
    oneLiner: loc("不等高卡片按列往下接，不是轮播", "Uneven cards drop down columns, not a carousel"),
    scenes: [
      loc("灵感墙", "An inspiration wall"),
      loc("作品集", "A portfolio"),
      loc("图片社区", "A picture feed"),
    ],
    rules: [
      loc("高度随内容，不要裁成一样高", "Height follows content; do not crop equal"),
      loc("column-count + break-inside: avoid", "column-count + break-inside: avoid"),
      loc("不是会切走整块的轮播", "Not a carousel that swaps the view"),
    ],
    spec: loc(
      "做瀑布流。五张不等高卡片，用分列排布，子项 break-inside: avoid，按列往下接。不要裁成等高九宫格，不要做成轮播。",
      "Masonry. Five uneven tiles in columns, break-inside: avoid, stacked down the column. Do not crop a uniform grid. Do not build a carousel.",
    ),
    note: loc("瀑布不是轮播，也不是等高网格。", "Masonry is not a carousel, and not an equal-height grid."),
    tells: loc("高低错落，卡片不被拦腰截", "Heights stagger; a card is not sliced"),
    window: loc("拾光灵感", "North board"),
  },
  {
    id: "fullscreen",
    index: "04",
    name: "Full-screen",
    zh: loc("全屏", "Full-screen"),
    oneLiner: loc("一屏占满视口，只留一句主标题", "One shot fills the viewport; one title stays"),
    scenes: [
      loc("品牌官网", "A brand site"),
      loc("发布会", "A launch"),
      loc("游戏站", "A game site"),
    ],
    rules: [
      loc("一屏占满视口", "One shot fills the viewport"),
      loc("只留主标题 + 一个按钮", "Title + one button, nothing else"),
      loc("不要多段正文，不要侧栏", "No body copy, no rail"),
    ],
    spec: loc(
      "做全屏首屏。一屏占满视口，只留一句主标题和一个按钮。不要多段正文，不要侧栏。",
      "A full-screen first shot. It fills the viewport. One title, one button. No body copy, no rail.",
    ),
    note: loc("一屏一句。不要塞三段介绍。", "One shot, one sentence. Do not stuff three paragraphs."),
    tells: loc("打开就是海报，不是文章", "It opens as a poster, not an article"),
    window: loc("山野发布", "Trail"),
  },
  {
    id: "splitter",
    index: "05",
    name: "Splitter",
    zh: loc("分栏", "Splitter"),
    oneLiner: loc("两格工作区，中间一条可见分隔", "Two workspaces, a visible divide between them"),
    scenes: [
      loc("代码编辑器", "A code editor"),
      loc("文件管理", "A file manager"),
      loc("对照看板", "A side-by-side board"),
    ],
    rules: [
      loc("两边都是工具，不是导航 + 正文", "Both sides are tools, not nav + article"),
      loc("中间分隔可见，可拖或固定", "A visible divide; resizable or fixed"),
      loc("不是盖上来的浮层抽屉", "Not a covering drawer overlay"),
    ],
    spec: loc(
      "做可分栏工作区。左右两格都是工具，中间一条可见分隔，可拖且两侧有最小宽度。不要做成浮在内容上的抽屉，也不要写成不能拖的官网左右栏。",
      "A splitter workspace. Two tool panes, a visible divide, draggable, with a min width on each side. Not a drawer over the content, and not a frozen marketing two-column.",
    ),
    note: loc("分栏不是浮层抽屉。两边都在文档流里。", "A splitter is not a drawer. Both panes stay in flow."),
    tells: loc("拖中间那条，两边都还在", "Drag the divide; both panes stay"),
    window: loc("码栈", "Stack"),
  },
  {
    id: "dashboard",
    index: "06",
    name: "Dashboard",
    zh: loc("仪表盘", "Dashboard"),
    oneLiner: loc("KPI、图、表拼成一页，用来扫数字", "KPI, chart, table — a page for scanning numbers"),
    scenes: [
      loc("经营日报", "A daily report"),
      loc("监控台", "A monitor"),
      loc("后台首页", "An admin home"),
    ],
    rules: [
      loc("顶部 KPI，下面图和表", "KPIs on top, chart and table below"),
      loc("12 栏网格；窄屏可以改单列", "12-column grid; stack on a narrow screen"),
      loc("左栏占位是侧栏，不是这一页的骨架", "A left rail’s occupancy is a sidebar, not this skeleton"),
    ],
    spec: loc(
      "做仪表盘。顶部 KPI，下面图和表，12 栏网格。窄屏可以改单列。不要左侧导航当骨架——占位是侧栏的问题。",
      "A dashboard. KPIs on top, chart and table below, 12-column grid. It may stack when narrow. Do not make a left nav the skeleton — occupancy is a sidebar question.",
    ),
    note: loc("仪表盘用来扫数字。落地页才讲承诺。", "A dashboard scans numbers. A landing states a promise."),
    tells: loc("一眼三个数，下面是图和表", "Three numbers at a glance; chart and table follow"),
    window: loc("经营日报", "Daily"),
  },
  {
    id: "modular",
    index: "07",
    name: "Modular",
    zh: loc("模块拼贴", "Modular cards"),
    oneLiner: loc("卡片落在网格上，一块一个主意", "Cards on a grid, one idea per card"),
    scenes: [
      loc("个人主页", "A personal home"),
      loc("工作台", "A desk"),
      loc("积木首页", "A block home"),
    ],
    rules: [
      loc("一块卡片只讲一件事", "One card, one idea"),
      loc("grid items-stretch，内部 flex-col", "grid items-stretch; flex-col inside"),
      loc("底栏 mt-auto，不要写死 height", "Footer mt-auto; do not hardcode height"),
    ],
    spec: loc(
      "做模块拼贴。卡片落在网格上，一块一个主意。同一行用 items-stretch，卡片内部 flex-col，底栏 mt-auto，不要写死高度。",
      "Modular cards on a grid, one idea per card. Stretch the row with items-stretch. Inside, flex-col and mt-auto on the footer. Do not hardcode height.",
    ),
    note: loc("拼贴是卡片网格。单栏才是一篇文章。", "Modular is a card grid. Single is one article."),
    tells: loc("一行一样高，按钮贴在底", "One row, one height; actions sit on the bottom"),
    window: loc("阿屿的主页", "Ayu’s desk"),
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc("别说「做个页面」，说单栏或瀑布", "Not “make a page” — a single column, or masonry"),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc("长文、转化落地、图片流，还是扫数字", "A long read, a landing, a picture feed, or scanning numbers"),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc("行宽、区块留白、不等高、一屏、两格", "Measure, band gap, uneven height, one shot, two panes"),
  },
];
