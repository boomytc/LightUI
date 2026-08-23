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
  defaultState: string;
};

export const KINDS: KindMeta[] = [
  {
    id: "badge",
    index: "01",
    name: "Badge",
    zh: loc("角标", "Badge"),
    oneLiner: loc("只标数字，瞄一眼就行，连弹都不用弹", "Only a number — a glance, no pop"),
    scenes: [
      loc("未读消息数", "Unread messages"),
      loc("待办数量", "Open tasks"),
      loc("购物车件数", "Cart count"),
    ],
    rules: [
      loc("叠在图标右上角，只显示数字", "Stack on the icon; numbers only"),
      loc("0 时卸掉，不要留空圆点", "Unload at 0 — no empty dot"),
      loc("超过 99 显示 99+", "Past 99 shows 99+"),
    ],
    spec: loc(
      "做角标提示。把未读数叠在图标右上角，只显示数字，超过 99 显示 99+，数量为 0 时卸掉角标，不要留空圆点，不要弹窗。",
      "A numeric badge. Stack the unread count on the icon. Numbers only; 99+ past 99; unload at 0, no empty dot, no dialog.",
    ),
    note: loc(
      "这一则只教数字角标。文字徽标（「新」「热」）是另一种形态，不要拿来当未读数。",
      "This leaf is the numeric badge. A text badge (“New”, “Hot”) is another shape — not an unread count.",
    ),
    tells: loc("0 卸掉，99+，不弹", "Unload at 0; 99+; no pop"),
    defaultState: "3",
  },
  {
    id: "toast",
    index: "02",
    name: "Toast",
    zh: loc("轻提示", "Toast"),
    oneLiner: loc("只报结果，几秒后自己消失", "Only a result — it leaves on its own"),
    scenes: [
      loc("保存成功", "Saved"),
      loc("复制成功", "Copied"),
      loc("已加入收藏", "Added to saved"),
    ],
    rules: [
      loc("无遮罩，不打断当前操作", "No mask; the current task keeps going"),
      loc("约 2.4 秒自动消失", "Gone in about 2.4 seconds"),
      loc("出现在内容区中上", "Mid-top of the content"),
    ],
    spec: loc(
      "做轻提示。保存成功后在内容区中上出现约 2.4 秒，无遮罩、不打断，用户可以立刻继续改表单。",
      "A toast. After save, show “Saved” mid-top for about 2.4s. No mask, no interrupt — they can keep editing.",
    ),
    note: loc("轻提示只报已经发生的结果。进度不是 toast，成功也不要做成必须点确定的弹窗。", "A toast reports a result that already happened. Progress is not a toast; success is not an OK dialog."),
    tells: loc("2.4 秒消失，表单不停", "Gone in 2.4s; the form keeps moving"),
    defaultState: "on",
  },
  {
    id: "snackbar",
    index: "03",
    name: "Snackbar",
    zh: loc("带操作的轻提示", "Snackbar"),
    oneLiner: loc("轻提示附一个即时动作，后悔了马上点回来", "A notice plus one immediate action — undo now"),
    scenes: [
      loc("删除后的撤销", "Undo a delete"),
      loc("断线后的重试", "Retry after disconnect"),
    ],
    rules: [
      loc("必须有一个即时动作", "Must include one immediate action"),
      loc("可忽略，约 5 秒", "Skippable; about 5 seconds"),
      loc("删完再给机会，不要先弹确定", "Do it first, then offer a way back — no confirm dialog"),
    ],
    spec: loc(
      "做带撤销的轻提示。删除后立刻执行，顶部出现约 5 秒的提示条带「撤销」，点撤销原位恢复；不要先弹「确定删除吗」。",
      "A snackbar with undo. Delete immediately, then a ~5s bar with Undo that restores in place. Do not ask “are you sure?” first.",
    ),
    note: loc("先做再给撤销。确认弹窗才是必须先处理才能继续。", "Do it, then offer undo. A confirm dialog is “handle this before you continue.”"),
    tells: loc("立刻删，5 秒内可撤销", "Delete now; undo for five seconds"),
    defaultState: "on",
  },
  {
    id: "marquee",
    index: "04",
    name: "Marquee",
    zh: loc("跑马灯", "Marquee"),
    oneLiner: loc("多条在同一条里轮流播，悬停暂停", "Several items rotate in one strip; pause on hover"),
    scenes: [
      loc("实时动态", "Live updates"),
      loc("活动播报", "Event notices"),
      loc("多条公告", "Several announcements"),
    ],
    rules: [
      loc("固定在页头下方持续滚动", "Pinned under the header, keeps moving"),
      loc("鼠标悬停时暂停", "Pause while hovered"),
      loc("不是切画面的轮播", "Not a carousel that swaps the view"),
    ],
    spec: loc(
      "做跑马灯通知。多条公告在页头下方横向轮流，悬停暂停，不是把整块画面切走的轮播。",
      "A marquee. Several announcements rotate in one strip under the header. Pause on hover. Not a carousel that swaps the view.",
    ),
    note: loc("跑马灯在同一条里滚字。轮播会把整块画面切走。", "A marquee rotates copy in one strip. A carousel takes the whole view away."),
    tells: loc("同一条里滚字，悬停暂停", "Copy rotates in one strip; pause on hover"),
    defaultState: "on",
  },
  {
    id: "inbox",
    index: "05",
    name: "Inbox",
    zh: loc("消息中心", "Inbox"),
    oneLiner: loc("留档可回看，错过也不怕", "Logged so they can come back"),
    scenes: [
      loc("导出完成", "Export finished"),
      loc("批量任务结果", "A batch result"),
      loc("系统消息", "System mail"),
    ],
    rules: [
      loc("写入消息中心，可稍后看", "Write it to the inbox; they can look later"),
      loc("入口在右上角铃铛，角标标未读", "Entry is the bell; a badge marks unread"),
      loc("不打断当前工作流", "Do not stop the current work"),
    ],
    spec: loc(
      "做消息中心。把「导出完成」写入铃铛后的列表，角标标未读，点开可回看，不打断当前工作。",
      "An inbox notice. Write “Export finished” into the bell list. A badge for unread; open it later. Do not stop the current work.",
    ),
    tells: loc("写进铃铛，随时回看", "Write it to the bell; look it up later"),
    defaultState: "on",
  },
  {
    id: "alert",
    index: "06",
    name: "Alert",
    zh: loc("警告", "Alert"),
    oneLiner: loc("必须看见，处理前不消失，但不是模态", "Must be seen; stays until handled; not a modal"),
    scenes: [
      loc("权限不足", "Missing permission"),
      loc("功能异常", "A feature is down"),
      loc("存在风险", "A risk"),
    ],
    rules: [
      loc("固定在内容区，必须看见", "Pinned in the content; they must see it"),
      loc("处理前不自动消失", "Does not leave until it is handled"),
      loc("不是挡住整页的模态", "Not a page-blocking modal"),
    ],
    spec: loc(
      "做警告提示。风险信息固定在内容区，处理前不消失，提供「立即重置」；不要用模态挡住整页，也不要用几秒就消失的轻提示。",
      "An alert. Pin the risk in the content. It stays until Reset now. Not a modal that blocks the page, and not a toast that vanishes in seconds.",
    ),
    note: loc("警告必须看见，但任务没被打断。必须先处理才能继续，才是弹窗。", "They must see the alert; the task is not blocked. “Handle this before you continue” is a dialog."),
    tells: loc("钉住直到立即重置", "Pinned until Reset now"),
    defaultState: "on",
  },
  {
    id: "banner",
    index: "07",
    name: "Banner",
    zh: loc("全局通知条", "Banner"),
    oneLiner: loc("导航下常驻跨页，直到用户关掉", "Under the nav, across pages, until they close it"),
    scenes: [
      loc("系统维护", "Maintenance"),
      loc("版本更新", "A release"),
      loc("全站活动", "A site-wide event"),
    ],
    rules: [
      loc("放在导航栏下方", "Sit under the nav"),
      loc("切换页面仍在", "Survives a page change"),
      loc("直到用户手动关闭", "Stays until they close it"),
    ],
    spec: loc(
      "做全局通知条。放在导航栏下方，切换页面仍在，直到用户点关闭；用于系统维护、版本更新。",
      "A global banner. Sit it under the nav. It survives page changes until they close it. Use it for maintenance or a release.",
    ),
    tells: loc("换页还在，点 X 才关", "Survives a page change; X closes it"),
    defaultState: "on",
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc("别说「弹个提示」，说角标或轻提示", "Not “a notice” — a badge, or a toast"),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc("未读数、保存成功、删完撤销，还是整站维护", "Unread count, saved, undo a delete, or site-wide maintenance"),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc("0 隐藏 / 约 2.4 秒消失 / 可撤销 / 留档 / 处理前不消失", "Hide at 0 / ~2.4s / undoable / logged / stays until handled"),
  },
];
