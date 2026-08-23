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
];

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc("别说「弹窗」，说居中弹窗、侧边抽屉或气泡", "Not “a dialog” — a modal, a drawer, or a popover"),
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
