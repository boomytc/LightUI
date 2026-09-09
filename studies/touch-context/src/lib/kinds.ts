import { loc, type Localized } from "./site-locale";
import { Copy, CornerUpLeft, Forward, Bookmark, Share2 } from "lucide-react";

export type ChatMessage = {
  id: string;
  sender: "them" | "me";
  senderName: string;
  text: string;
  time: string;
};

export const INITIAL_CHAT: ChatMessage[] = [
  {
    id: "c1",
    sender: "them",
    senderName: "林工",
    text: "新版移动端控件图鉴的抽屉、滚轮与侧滑手势都跑通了！",
    time: "14:20",
  },
  {
    id: "c2",
    sender: "me",
    senderName: "我",
    text: "太棒了，特别是 460ms 长按消歧，按住聊天气泡就近浮出菜单非常克制顺手。",
    time: "14:21",
  },
  {
    id: "c3",
    sender: "them",
    senderName: "林工",
    text: "是的，手指位移超过 10px 立即注销长按，让路给消息流顺畅滚动，完全杜绝幽灵弹窗。",
    time: "14:22",
  },
];

export type ActionItem = {
  id: string;
  label: Localized;
  icon: typeof Copy;
  tone?: "default" | "danger";
};

export const CONTEXT_ACTIONS: ActionItem[] = [
  { id: "copy", label: loc("复制内容", "Copy Text"), icon: Copy },
  { id: "reply", label: loc("引用回复", "Reply"), icon: CornerUpLeft },
  { id: "forward", label: loc("转发消息", "Forward"), icon: Forward },
  { id: "bookmark", label: loc("添加收藏", "Bookmark"), icon: Bookmark },
  { id: "share", label: loc("系统分享", "Share"), icon: Share2 },
];

export const FORMULA = {
  name: loc("长按上下文菜单 (Touch Context Menu)", "Touch Context Menu"),
  gesture: loc("长按气泡 ~460ms (Long Press Hold ~460ms)", "Long Press Hold ~460ms"),
  result: loc("就近弹出单条操作菜单 (Anchored Single-item Action Menu)", "Anchored Single-item Action Menu"),
  prompt: loc(
    "长按消息气泡约 460ms，微缩反馈并就近弹出快捷菜单；手指位移超过 10px 立即取消，让路给滚动；视口边缘自动避让翻转。",
    "Hold chat bubble ~460ms with scale(0.98) micro-feedback to anchor context menu; drift > 10px cancels for scroll; flips at edges.",
  ),
};
