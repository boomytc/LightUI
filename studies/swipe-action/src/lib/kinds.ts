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
