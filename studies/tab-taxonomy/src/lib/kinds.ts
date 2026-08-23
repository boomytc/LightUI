import { loc, type Localized } from "./site-locale";

export type KindId = "linear" | "card" | "chevron" | "segmented" | "folder" | "image";

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
  defaultTab: string;
};

export const KINDS: KindMeta[] = [
  {
    id: "linear",
    index: "01",
    name: "Linear slider",
    zh: loc("线性滑块", "Linear slider"),
    oneLiner: loc("等宽文字，短线跟着文字滑过去", "Equal-width labels; a short bar slides under the words"),
    scenes: [
      loc("后台同级栏目", "Sibling admin sections"),
      loc("项目详情", "Project detail"),
      loc("文档分区", "Doc sections"),
    ],
    rules: [
      loc("等宽 grid，短线量的是文字 span", "Equal grid; the bar measures the text span"),
      loc("过渡只开 left / width", "Transition only left / width"),
      loc("首次测量关掉过渡，避免从 0 滑入", "No transition on the first measure"),
    ],
    spec: loc(
      "做一组线性滑块标签。文字等宽排列，选中项加深；下方短线与文字居中对齐，点击时平滑滑到新标签，内容同步切换。",
      "Linear slider tabs: equal-width labels, current text darker. A short bar stays centered on the words and slides to the next label; the panel fades with it.",
    ),
    tells: loc("短线跟着文字，不是整格按钮", "The bar follows the words, not the cell"),
    defaultTab: "overview",
  },
  {
    id: "card",
    index: "02",
    name: "Card tabs",
    zh: loc("卡片式", "Card tabs"),
    oneLiner: loc("选中项与面板同色、去底边，连成一块", "Current tab matches the panel, drops its bottom edge, and joins it"),
    scenes: [
      loc("成员与权限", "Members and roles"),
      loc("订单分区", "Order sections"),
      loc("设置页", "Settings"),
    ],
    rules: [
      loc("未选中是独立浅底卡片", "Idle tabs are independent light cards"),
      loc("选中去底边，margin-bottom: -1px 盖住面板顶边", "Current tab loses the bottom edge and covers the panel top"),
      loc("第一项选中时去掉面板左上圆角", "Drop the panel’s top-left radius when the first tab is current"),
    ],
    spec: loc(
      "做卡片式标签页。未选中项保留浅色卡片轮廓；选中项变成与面板同色，并去掉底边，与下方内容面板无缝连成一体。",
      "Card tabs: idle items keep a light outline. The current one matches the panel, loses its bottom edge, and joins it with no seam.",
    ),
    note: loc("卡片去底边连面板。文件夹才是斜切叠纸。", "Card joins the panel. Folder is stacked, beveled paper."),
    tells: loc("选中项和面板同一块底，未选中仍是独立卡片", "Current tab shares the panel fill; idle tabs stay independent cards"),
    defaultTab: "members",
  },
  {
    id: "chevron",
    index: "03",
    name: "Chevron steps",
    zh: loc("鱼骨步骤", "Chevron steps"),
    oneLiner: loc("箭头首尾相接；当前之前是完成，之后是未开始", "Arrows bite; before current is done, after is todo"),
    scenes: [
      loc("结账", "Checkout"),
      loc("开户", "Onboarding"),
      loc("发布流程", "Publish flow"),
    ],
    rules: [
      loc("clip-path 切出箭头，后一项负 margin 咬合", "clip-path arrows; the next item bites with negative margin"),
      loc("点到哪一步，它之前是完成、之后是未开始", "Land on a step: before it is done, after it is todo"),
      loc("当前铺满，完成次之，未开始浅底", "Current is filled, done quieter, todo light"),
    ],
    spec: loc(
      "做鱼骨式步骤标签。各步骤用首尾衔接的箭头块排列。点到哪一步，它之前是完成、它是当前、之后是未开始，并切换对应内容。",
      "Chevron step tabs: arrow blocks that bite. Wherever you land, earlier steps are done, that step is current, later ones are todo, and the panel follows.",
    ),
    note: loc("鱼骨的完成态是「在当前之前」，不是四个互斥视图。", "Done means before the current step, not four exclusive views."),
    tells: loc("看得见做完了哪一步", "You can see which step is done"),
    defaultTab: "cart",
  },
  {
    id: "segmented",
    index: "04",
    name: "Segmented",
    zh: loc("分段控件", "Segmented control"),
    oneLiner: loc("同一条圆角轨道里，白块滑到点击项", "One rounded track; a white pill slides to the click"),
    scenes: [
      loc("今日 / 本月", "Today / this month"),
      loc("列表 / 图表", "List / chart"),
      loc("经营数据切片", "A slice of the same metrics"),
    ],
    rules: [
      loc("外轨一条圆角胶囊，内滑块绝对定位", "One capsule track; the pill is absolutely positioned"),
      loc("pill 的 left / width 相对轨道测量", "The pill’s left / width are measured against the track"),
      loc("选项不超过四个；只换同一份数据的切片", "Four options or fewer; swap a slice, not the page"),
    ],
    spec: loc(
      "做分段控件标签。把少量互斥选项放进同一条圆角轨道，选中块平滑移动到点击项，并立即更新下方数据视图。",
      "A segmented control: a few exclusive options in one rounded track. The pill slides to the click and the numbers update in place.",
    ),
    note: loc("分段是同一份数据的切片。线性才是同级栏目。", "Segmented slices one dataset. Linear is sibling sections."),
    tells: loc("滑块量的是整项，布局不跟着跳", "The pill measures the item; the layout stays put"),
    defaultTab: "today",
  },
  {
    id: "folder",
    index: "05",
    name: "Folder tabs",
    zh: loc("文件夹", "Folder tabs"),
    oneLiner: loc("左 90°、右 30° 斜切，选中页签压在最上层", "Left 90°, right 30° bevel; the current tab sits on top"),
    scenes: [
      loc("项目资料", "Project files"),
      loc("文档库", "A document library"),
      loc("档案分类", "Filed records"),
    ],
    rules: [
      loc("左边直角，右边 30° 斜切，底边比顶边更宽", "Square left, 30° right bevel, bottom wider than top"),
      loc("选中项 z-index 最高，和列表同一块底", "Current tab is on top and shares the list fill"),
      loc("未选中压在浅色底条上", "Idle tabs sit on a light strip"),
    ],
    spec: loc(
      "做文件夹标签。页签左边是 90° 折角，右边是 30° 斜切；选中页签置于最上层，并与下方文件列表连成同一块背景。",
      "Folder tabs: 90° on the left, 30° bevel on the right. The current tab sits on top and shares the file list’s fill.",
    ),
    note: loc("文件夹是叠纸。卡片才是去底边连面板。", "Folder is stacked paper. Card is the one that drops a bottom edge."),
    tells: loc("选中页签压住下层的纸", "The current tab covers the paper below"),
    defaultTab: "req",
  },
  {
    id: "image",
    index: "06",
    name: "Image preview",
    zh: loc("图片预览", "Image preview"),
    oneLiner: loc("缩略图切主图，点哪张 Banner 就是哪张", "Thumbnails switch the hero; the banner is the thumb you clicked"),
    scenes: [
      loc("作品集", "A portfolio"),
      loc("空间案例", "A space case"),
      loc("商品图", "Product shots"),
    ],
    rules: [
      loc("主图与缩略图同一资源", "Hero and thumb share one asset"),
      loc("选中缩略图加描边并上移", "The current thumb lifts with a stroke"),
      loc("主图 opacity 交叉淡入", "The hero crossfades"),
    ],
    spec: loc(
      "做图片预览标签。每个标签用对应图片作背景并叠加标题；点击后突出当前缩略图，同时把上方 Banner 切换为同一张大图。",
      "Image preview tabs: each thumb is the picture plus a caption. A click lifts that thumb and the banner becomes the same image.",
    ),
    tells: loc("缩略图就是标签，不是另一套图", "The thumbnail is the tab, not a second set of pictures"),
    defaultTab: "living",
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc("别说「Tab」，说线性滑块或分段控件", "Not “tabs” — a linear slider, or a segmented control"),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc("同级栏目、结账步骤，还是今日 / 本月", "Sibling sections, a checkout, or today / this month"),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc("短线跟文字、去底边、三态箭头、轨道滑块", "Bar follows text, join the panel, three-state arrows, pill in a track"),
  },
];
