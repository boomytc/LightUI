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
    id: "circle-pill",
    index: "01",
    name: "Circle → pill",
    zh: loc("圆→胶囊", "Circle → pill"),
    oneLiner: loc("高度锁死，从中心长宽，圆角全程 999", "Height locked; width grows from the center; radius 999 throughout"),
    scenes: [
      loc("搜索圆点拉成搜索条", "A search dot becoming a field"),
      loc("浮动操作变宽", "A FAB widening"),
      loc("图标始终挂着", "The icon stays mounted"),
    ],
    rules: [
      loc("只改宽，高度锁 48", "Width only; height locked at 48"),
      loc("锚在中心，不要往一侧长", "Anchor center; do not grow to one side"),
      loc("圆角全程 999；图标不卸载", "Radius 999 throughout; do not unmount the icon"),
    ],
    spec: loc(
      "做圆到胶囊。高度锁 48，圆角全程 999，从中心往两边长宽。图标始终挂着，不要卸掉再装。不要连高度一起放大。",
      "Circle to pill. Height locked at 48, radius 999 throughout, width grows from the center. The icon stays mounted. Do not scale height with it.",
    ),
    note: loc("这是改宽。不要当成整块 scale。", "This is a width morph. Not a scale of the whole chip."),
    tells: loc("高度不动，从中间往两边长", "Height holds; it grows out from the middle"),
    window: loc("工作台 · 搜索", "Desk · search"),
  },
  {
    id: "pill-card",
    index: "02",
    name: "Pill → card",
    zh: loc("胶囊→卡片", "Pill → card"),
    oneLiner: loc("从顶往下长高，标题始终挂着，正文后出现", "Height grows from the top; the header stays; body waits"),
    scenes: [
      loc("通知胶囊展开", "A notice pill opening"),
      loc("一行预览变成详情", "A one-line preview becoming detail"),
      loc("标题不能闪一下", "The title must not blink"),
    ],
    rules: [
      loc("只改高，锚在顶", "Height only; anchor top"),
      loc("圆角 999→24，标题栏始终挂着", "Radius 999→24; the header stays mounted"),
      loc("正文等容器长开再出现", "Body waits until the container has grown"),
    ],
    spec: loc(
      "做胶囊到卡片。从顶部往下长高，圆角 999 收到 24。标题栏始终挂着。正文等容器长开再出现，不要先把字弹出来。",
      "Pill to card. Height grows downward from the top; radius 999→24. The header stays mounted. Body copy appears after the container has grown — not before.",
    ),
    note: loc("标题始终挂着。不要卸掉另开一张卡。", "The header stays. Do not unmount it and open a second card."),
    tells: loc("标题还在，卡片往下长，字后到", "The title holds; the card grows down; type arrives late"),
    window: loc("工作台 · 通知", "Desk · notice"),
  },
  {
    id: "compact",
    index: "03",
    name: "Compact",
    zh: loc("紧凑条", "Compact"),
    oneLiner: loc("同一份内容，额外控件沿 0fr 打开", "Same content identity; extra controls open on a 0fr track"),
    scenes: [
      loc("编辑条露出格式工具", "A composer revealing format tools"),
      loc("工具条从一行变成一块", "A toolbar growing from one row"),
      loc("标题不能换成另一套", "The title is not a second skin"),
    ],
    rules: [
      loc("锚在左上，尺寸往右下长", "Anchor top-left; size grows down-right"),
      loc("额外控件 0fr→1fr，不要蹦出来", "Extra controls 0fr→1fr; they do not pop"),
      loc("同一份内容身份，不要另开一层", "Same content identity; not a new overlay"),
    ],
    spec: loc(
      "做紧凑条。同一份内容身份，额外控件用 0fr 打开到 1fr。锚在左上，往右下长。不要卸掉标题另开一层。",
      "A compact bar. Same content identity; extra controls open 0fr→1fr. Anchor top-left, grow down-right. Do not unmount the title and open a new layer.",
    ),
    note: loc("多出来的是轨道打开，不是新节点替换。", "The extra row is a track opening, not a node swap."),
    tells: loc("标题还在，下面一行从 0 打开", "The title holds; the extra row opens from 0"),
    window: loc("工作台 · 撰写", "Desk · compose"),
  },
  {
    id: "radius",
    index: "04",
    name: "Radius",
    zh: loc("圆角", "Radius"),
    oneLiner: loc("宽高锁死，只改圆角——这是层级，不是放大", "Width and height locked; radius only — hierarchy, not scale"),
    scenes: [
      loc("同一块从胶囊收到卡片", "The same block, pill to card"),
      loc("层级变化不要靠放大", "Hierarchy without zooming"),
      loc("内容位置不动", "Content does not move"),
    ],
    rules: [
      loc("宽高锁死，只改圆角", "Lock width and height; change radius"),
      loc("这是层级，不是 scale", "This is hierarchy, not scale"),
      loc("内容和尺寸同步，不要后出现", "Content stays in sync; it does not arrive late"),
    ],
    spec: loc(
      "做圆角层级。宽高锁死，只改圆角 999→24。这是层级，不是放大。不要连尺寸一起 scale。",
      "Radius as hierarchy. Width and height locked; radius 999→24. This is hierarchy, not a zoom. Do not scale size with it.",
    ),
    note: loc("只改圆角不是放大。宽高不动，才是层级。", "Changing only the radius is not a zoom. Size holds; that is hierarchy."),
    tells: loc("盒子一样大，角在收", "The box stays the same size; the corners gather"),
    window: loc("工作台 · 成员", "Desk · members"),
  },
  {
    id: "size",
    index: "05",
    name: "Size",
    zh: loc("尺寸", "Size"),
    oneLiner: loc("内容层级不变，从左上往右下长", "Content hierarchy unchanged; grow down-right"),
    scenes: [
      loc("缩略卡长成详情卡", "A thumb growing into a detail card"),
      loc("预览放大但仍是那张", "A preview that is still that card"),
      loc("不要重排内部", "Do not reflow the inside"),
    ],
    rules: [
      loc("宽高一起变，圆角保持", "Width and height grow; radius holds"),
      loc("锚在左上，往右下长", "Anchor top-left; grow down-right"),
      loc("内容层级不变，正文后出现", "Hierarchy unchanged; body waits for the box"),
    ],
    spec: loc(
      "做尺寸展开。内容层级不变，从左上往右下长。宽高一起变，圆角保持。不要重排节点，不要改圆角冒充层级。",
      "A size morph. Content hierarchy unchanged; grow down-right. Width and height move together; radius holds. Do not reflow nodes. Do not fake hierarchy with radius.",
    ),
    note: loc("这是放大这块，不是换成两列。", "This grows the block. It does not become two columns."),
    tells: loc("左上角钉住，整张往右下长", "Top-left is pinned; the card grows down-right"),
    window: loc("工作台 · 预览", "Desk · preview"),
  },
  {
    id: "reflow",
    index: "06",
    name: "Reflow",
    zh: loc("重排", "Reflow"),
    oneLiner: loc("同一组节点，单列变两列，阅读顺序不变", "Same nodes, stack → two columns, reading order kept"),
    scenes: [
      loc("资料卡从竖排改横排", "A profile card, stack to row"),
      loc("窄屏单列、宽屏两列", "One column narrow, two wide"),
      loc("不要另做一套卡片", "Do not build a second card"),
    ],
    rules: [
      loc("同一组节点，不要换 DOM", "Same nodes; do not swap the DOM"),
      loc("单列变两列，阅读顺序保持", "Stack → two columns; reading order kept"),
      loc("这是排版，不是切画面", "This is layout, not a frame cut"),
    ],
    spec: loc(
      "做内容重排。同一组节点，单列变两列，阅读顺序不变。不要换成另一套 DOM，也不要切成两帧轮播。",
      "A reflow. Same nodes, stack to two columns, reading order kept. Do not swap in a second DOM. Do not cut to another frame.",
    ),
    note: loc("内容重排不是换一套节点。DOM 还是那些。", "Reflow is not a new set of nodes. The DOM is the same."),
    tells: loc("还是那几块，只是改成两列", "The same pieces; they just sit in two columns"),
    window: loc("工作台 · 资料", "Desk · profile"),
  },
  {
    id: "reverse",
    index: "07",
    name: "Reverse",
    zh: loc("反向收回", "Reverse"),
    oneLiner: loc("正文先走，再收高度，再收宽度；勾留在点里", "Body leaves first, then height, then width; the check stays in the dot"),
    scenes: [
      loc("完成后收成圆点", "Done, then collapse to a dot"),
      loc("沿展开的路往回走", "Walk the expand path backward"),
      loc("不要整块淡出卸载", "Do not fade-unmount the block"),
    ],
    rules: [
      loc("内容先走，容器后收", "Content leaves first; the container follows"),
      loc("再收高度成胶囊，再收宽度成点", "Then height to a pill, then width to a dot"),
      loc("勾始终留在最终的点里", "The check stays in the final dot"),
    ],
    spec: loc(
      "做反向收回。卡片先让正文走开，再收高度成胶囊，再收宽度成圆点。勾始终留在最终的点里。不要淡出卸载整块。再点一次回到卡片。",
      "A reverse collapse. Body leaves the card first, then height becomes a pill, then width becomes a dot. The check stays in the final dot. Do not fade-unmount the block. Another click expands it again.",
    ),
    note: loc("反向收回不是淡出卸载。沿原路走，勾还在。", "Reverse is not a fade-unmount. Walk the path; the check remains."),
    tells: loc("字先没，再变扁，再收成点", "Type goes first, then it flattens, then it is a dot"),
    window: loc("工作台 · 完成", "Desk · done"),
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc("别说「做一个变形」，说改宽、改圆角或沿路收回", "Not “a morph” — width, radius, or a reverse collapse"),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc("搜索条拉宽、通知展开、只改层级，还是收成点", "A search chip, a notice, hierarchy only, or back to a dot"),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc("改哪根轴、锚在哪、内容先走还是后到", "Which axis, which anchor, content before or after the container"),
  },
];
