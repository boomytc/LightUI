import { loc, type Localized } from "./site-locale";
import type { OverlayKind } from "./machines";

export type KindId = OverlayKind;

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
    id: "modal",
    index: "01",
    name: "Modal",
    zh: loc("居中弹窗", "Centered modal"),
    oneLiner: loc("必须先处理；视口居中，强遮罩", "Must be handled first; centered, strong scrim"),
    scenes: [
      loc("删除确认", "Delete confirm"),
      loc("支付确认", "Payment confirm"),
      loc("关键表单", "A critical form"),
    ],
    rules: [
      loc("打断当前任务", "Interrupts the current task"),
      loc("危险操作不要点遮罩关", "A dangerous action does not close on the scrim"),
      loc("Esc / 按钮关；焦点陷阱；关后回到触发按钮", "Esc / buttons; focus trap; restore the trigger"),
    ],
    spec: loc(
      "做居中弹窗「确认删除」。视口居中、强遮罩，必须先处理。危险操作不要点遮罩关闭；Esc、取消或确认才关，焦点回到删除按钮。",
      "A centered delete confirm. Strong scrim, must be handled first. Do not close on the scrim; Esc, cancel, or confirm. Focus returns to Delete.",
    ),
    note: loc("危险操作不要点遮罩关。轻操作才用气泡。", "A dangerous action does not close on the scrim. Light actions are a popover."),
    tells: loc("点遮罩关不掉，必须取消或确认", "The scrim does not dismiss it; cancel or confirm"),
  },
  {
    id: "drawer",
    index: "02",
    name: "Drawer",
    zh: loc("侧边抽屉", "Side drawer"),
    oneLiner: loc("弱打断；从右侧滑入，列表仍可见", "Weak interrupt; slides in from the right, list stays"),
    scenes: [
      loc("商品编辑", "Product edit"),
      loc("多字段表单", "A multi-field form"),
      loc("对照着列表改", "Edit beside a list"),
    ],
    rules: [
      loc("从右侧滑入，原列表仍可见", "Slides in from the right; the list stays visible"),
      loc("轻遮罩，点遮罩可关", "Light scrim; a click on it closes"),
      loc("字段多时用抽屉，不要塞进居中小卡", "Many fields belong here, not in a centered card"),
    ],
    spec: loc(
      "做右侧抽屉「编辑商品」。从右侧滑入，轻遮罩，商品列表仍可见。字段多时用抽屉而不是塞进居中小卡。点遮罩、Esc 或取消关闭。",
      "A right-hand product editor. It slides in, the list stays, the scrim is light. Many fields belong here, not in a centered card. Scrim, Esc, or cancel closes it.",
    ),
    note: loc("内容抽屉不是汉堡主导航，也不是隐藏式侧栏。", "A content drawer is not a hamburger nav, and not an off-canvas rail."),
    tells: loc("列表还在，点遮罩可以关掉", "The list is still there; the scrim closes it"),
  },
  {
    id: "popover",
    index: "03",
    name: "Popover",
    zh: loc("气泡弹层", "Popover"),
    oneLiner: loc("不打断；无强遮罩，贴着触发点", "Does not interrupt; no strong scrim, stuck to the trigger"),
    scenes: [
      loc("头像菜单", "Avatar menu"),
      loc("文件更多", "File overflow"),
      loc("2–7 项动作", "Two to seven actions"),
    ],
    rules: [
      loc("贴着触发点，碰到边缘就翻转", "Anchored to the trigger; flips at the edge"),
      loc("无强遮罩；点外部 / Esc / 再点触发器关", "No strong scrim; outside, Esc, or the trigger again"),
      loc("2–7 项；菜单里的删除再唤起弹窗", "2–7 items; delete in the menu opens a modal"),
    ],
    spec: loc(
      "做气泡菜单「头像」。贴着触发点，无强遮罩，四项操作。点外部、Esc 或再点头像关闭。删除账号再唤起居中弹窗确认——轻操作和重决策分开。",
      "An avatar popover: four actions, stuck to the trigger, no strong scrim. Outside click, Esc, or the avatar again closes it. Delete account opens a modal — light action, heavy decision.",
    ),
    note: loc("气泡不是下拉提交一个值。超过七项换抽屉。", "A popover is not a dropdown that commits a value. More than seven items is a drawer."),
    tells: loc("贴着头像，页面仍可扫读", "Stuck to the avatar; the page is still readable"),
  },
  {
    id: "tooltip",
    index: "04",
    name: "Tooltip",
    zh: loc("文字提示", "Tooltip"),
    oneLiner: loc("不打断；贴着触发点；一句说明，不可交互", "Does not interrupt; stuck to the trigger; one sentence, not interactive"),
    scenes: [
      loc("图标含义", "An icon’s meaning"),
      loc("字段解释", "A field hint"),
      loc("快捷键说明", "A shortcut hint"),
    ],
    rules: [
      loc("悬停或聚焦后延迟出现，划过不闪", "Delay after hover or focus; a pass-over does not flash"),
      loc("内容不可点、不抢焦点", "The sentence is not clickable and does not take focus"),
      loc("贴着触发点，越界翻转；离开立刻淡出", "Stuck to the trigger, flips at the edge; leave fades it out"),
    ],
    spec: loc(
      "做文字提示。信息图标悬停或聚焦约 280ms 后，在图标上方出现一句说明，箭头指向图标。内容不可交互。离开或失焦立刻淡出。不要做成可点的气泡。",
      "A tooltip. After ~280ms hover or focus on an info icon, one sentence appears above it, arrow pointing at the icon. Not interactive. Leave or blur fades it out. Not a clickable popover.",
    ),
    note: loc("一句说明不是气泡菜单。气泡才能放按钮。", "A sentence is not a popover. Buttons belong on a popover."),
    tells: loc("划过不闪，停住才出一句", "A pass-over does not flash; a pause shows one line"),
  },
  {
    id: "sheet",
    index: "05",
    name: "Sheet",
    zh: loc("底部操作层", "Bottom sheet"),
    oneLiner: loc("弱打断；从视口底边上推，不贴触发点", "Weak interrupt; rises from the viewport bottom, not stuck to the trigger"),
    scenes: [
      loc("分享", "Share"),
      loc("手机快捷操作", "Phone shortcuts"),
      loc("拇指区选择下一步", "A thumb-reach next step"),
    ],
    rules: [
      loc("从底部上推，不是右侧抽屉", "Rises from the bottom, not a right-hand drawer"),
      loc("轻遮罩，点遮罩可关；顶部留拖拽条", "Light scrim; a click on it closes. A grabber at the top"),
      loc("不贴触发点；操作区至少 44px", "Not stuck to the trigger; actions at least 44px"),
    ],
    spec: loc(
      "做底部操作层「分享」。从屏幕底部上推到半屏，轻遮罩，点遮罩可关。顶部拖拽条，下面三个大号操作。不要做成右侧抽屉，也不要居中弹窗。",
      "A bottom sheet for Share. It rises to half the viewport, light scrim, scrim-dismiss. A grabber on top, three large actions. Not a right drawer. Not a centered modal.",
    ),
    note: loc("底边上来不是侧滑抽屉。抽屉从右侧对照列表。", "From the bottom is not a side drawer. A drawer edits beside a list."),
    tells: loc("从底下推上来，点遮罩可以关掉", "It pushes up from the bottom; the scrim closes it"),
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc("别说「弹窗」，说居中弹窗、侧边抽屉、气泡、提示或底边层", "Not “a dialog” — a modal, a drawer, a popover, a tooltip, or a sheet"),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc("删除确认、对照着列表改字段，还是头像旁几项", "A delete confirm, fields beside a list, or a few avatar actions"),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc("打不打断、贴不贴触发点、点遮罩关不关", "Interrupt or not, stuck to the trigger, scrim-dismiss or not"),
  },
];
