import { loc } from "./site-locale";

export type MessageItem = {
  id: string;
  sender: string;
  avatarText: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
  tag?: string;
};

export const INITIAL_MESSAGES: MessageItem[] = [
  {
    id: "1",
    sender: "林工 (前端组)",
    avatarText: "林",
    subject: "LightUI 交互规范评审稿",
    preview: "已将侧滑动作与抽屉多档位吸附算法整理完毕，请查阅附件。",
    time: "10:24",
    unread: true,
    tag: "待办",
  },
  {
    id: "2",
    sender: "系统通知",
    avatarText: "系",
    subject: "安全凭证更新成功",
    preview: "您的开发机 SSH 鉴权密钥已自动滚动，下个周期于 30 天后生效。",
    time: "昨天",
    unread: true,
    tag: "安全",
  },
  {
    id: "3",
    sender: "张敏 (产品设计)",
    avatarText: "张",
    subject: "移动端控件图鉴体验反馈",
    preview: "在真机测试滚轮与侧滑删除手感，阈值反馈非常干净！",
    time: "周一",
    unread: false,
    tag: "设计",
  },
  {
    id: "4",
    sender: "架构组日常周报",
    avatarText: "周",
    subject: "第 36 周前端交互性能大盘",
    preview: "长列表在连续滑动时的掉帧率降至 0.2%，手势消歧锁轴稳定。",
    time: "上周",
    unread: false,
  },
  {
    id: "5",
    sender: "设计系统同步",
    avatarText: "设",
    subject: "Token 与侧滑阻尼对照表",
    preview: "越界阻尼 0.25，右滑回弹同样套阻尼，避免把行拽出边界。",
    time: "更早",
    unread: false,
    tag: "规范",
  },
  {
    id: "6",
    sender: "周会纪要",
    avatarText: "纪",
    subject: "列表手势本周验收清单",
    preview: "请先纵滚浏览，再左滑任意一行，对照消歧与双阈值裁定。",
    time: "更早",
    unread: false,
  },
];

export const FORMULA = {
  name: loc("列表侧滑 (Swipe Action)", "Swipe Action"),
  gesture: loc("向左滑动 (Swipe Left)", "Swipe Left"),
  result: loc("露出快捷操作，全滑直接删除 (Reveal Actions or Full Swipe Delete)", "Reveal Actions or Full Swipe Delete"),
  prompt: loc(
    "左滑当前列表行，8px 锁轴消歧；过 45% 吸附露出「标记已读」与「删除」；滑动超过深滑阈值直接提交删除，其他行保持原位。",
    "Swipe list row left: lock axis at 8px; snap to reveal read/delete past 45%; overswipe past threshold commits delete directly.",
  ),
};

export type SwipeFormula = {
  id: string;
  eyebrow: ReturnType<typeof loc>;
  title: ReturnType<typeof loc>;
  desc: ReturnType<typeof loc>;
};

export const SWIPE_FORMULAS: SwipeFormula[] = [
  {
    id: "lock",
    eyebrow: loc("8px 死区", "8px deadband"),
    title: loc("矢量消歧锁轴", "Vector axis lock"),
    desc: loc(
      "欧氏位移不足 8px 保持待定。|Δy| 占优立刻放行纵滚；|Δx| 占优才锁横轴、捕获指针。",
      "Stay undecided while hypot(Δx, Δy) < 8px. Dominant |Δy| yields to scroll; dominant |Δx| locks horizontal and captures.",
    ),
  },
  {
    id: "dual",
    eyebrow: loc("双阈值", "Dual threshold"),
    title: loc("回弹 · 露出 · 提交", "Close · reveal · commit"),
    desc: loc(
      "松手不到 45%×148px 弹性归零；过门槛吸附露出已读/删除；越过 172px 整行变红，一步提交。",
      "Release under 45% of 148px springs shut; past latch snaps the tray; past 172px the row goes red and commits.",
    ),
  },
  {
    id: "exclusive",
    eyebrow: loc("单行互斥", "One row only"),
    title: loc("点外收回", "Tap-outside close"),
    desc: loc(
      "同一屏最多一行敞开。碰另一行立刻回弹；点展开行正面或列表空白，低成本后悔。",
      "At most one tray is open. Touching another row springs the first shut; tapping the face or empty list is a cheap undo.",
    ),
  },
];
