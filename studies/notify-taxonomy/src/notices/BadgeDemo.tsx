import { useState } from "react";
import { Bell, Mail, MessageSquare } from "lucide-react";
import { stageBadgeCount } from "../lib/machines";
import { useLocale } from "../lib/site-locale";
import { Action, AppNav, AvatarMark, Frame, IconBtn, Stat } from "./Frame";

export function BadgeDemo({ state }: { state?: string } = {}) {
  const locale = useLocale();
  const [chat, setChat] = useState(() => stageBadgeCount(state ?? "3"));

  function bump() {
    setChat((n) => (n <= 0 ? 3 : 120));
  }

  return (
    <Frame
      title={locale === "en" ? "Orbit · Home" : "Orbit · 首页"}
      nav={
        <AppNav brand="Orbit">
          <IconBtn
            label={locale === "en" ? "Messages" : "消息"}
            count={chat}
            onClick={() => setChat(0)}
          >
            <MessageSquare className="size-4" />
          </IconBtn>
          <IconBtn label={locale === "en" ? "Mail" : "邮件"} count={3}>
            <Mail className="size-4" />
          </IconBtn>
          <IconBtn label={locale === "en" ? "Alerts" : "通知"} count={0}>
            <Bell className="size-4" />
          </IconBtn>
          <AvatarMark mark="S" />
        </AppNav>
      }
    >
      <div className="px-6 py-7">
        <h2 className="text-[1.35rem] font-semibold tracking-tight">
          {locale === "en" ? "Morning, Sue" : "早上好，Sue"}
        </h2>
        <p className="mt-1 text-[12px] text-fg-muted">
          {locale === "en" ? "3 tasks waiting" : "今天有 3 个任务待处理"}
        </p>
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <Stat
            label={locale === "en" ? "New" : "新增"}
            value="128"
            hint="+12%"
          />
          <Stat
            label={locale === "en" ? "This week" : "本周"}
            value="48"
            hint={locale === "en" ? "In progress" : "进行中"}
          />
          <Stat
            label={locale === "en" ? "Drafts" : "草稿"}
            value="3"
            hint={locale === "en" ? "Due today" : "今天到期"}
          />
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Action onClick={bump}>{locale === "en" ? "Add unread" : "增加未读"}</Action>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Tap the message icon to clear it. At 0 the badge unloads — no empty dot. The bell stays at 0 on purpose."
            : "点消息图标可清零。数量为 0 时角标卸掉，不要留空圆点。铃铛停在 0，对照空位。"}
        </p>
      </div>
    </Frame>
  );
}
