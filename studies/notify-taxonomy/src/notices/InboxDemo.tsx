import { useState } from "react";
import { Bell, Mail, MessageSquare } from "lucide-react";
import { INITIAL_INBOX, type InboxItem } from "../lib/fixtures";
import { stageOn } from "../lib/machines";
import { loc, pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Action, AppNav, AvatarMark, Frame, Ghost, IconBtn, Stat } from "./Frame";

export function InboxDemo({ state }: { state?: string } = {}) {
  const locale = useLocale();
  const lockedOpen = state !== undefined && stageOn(state);
  const [items, setItems] = useState<InboxItem[]>(INITIAL_INBOX);
  const [open, setOpen] = useState(lockedOpen);
  const [page, setPage] = useState<"home" | "inbox">(lockedOpen ? "home" : "inbox");
  const unread = items.filter((item) => item.unread).length;

  function pushResult() {
    const next: InboxItem = {
      id: `n-${Date.now()}`,
      title: loc("导出完成，共 128 条数据", "Export finished — 128 rows"),
      time: loc("刚刚", "Just now"),
      unread: true,
    };
    setItems((curr) => [next, ...curr]);
    if (page === "home") setOpen(true);
  }

  function markRead() {
    setItems((curr) => curr.map((item) => ({ ...item, unread: false })));
  }

  function goInbox() {
    setOpen(false);
    setPage("inbox");
  }

  return (
    <Frame
      title={locale === "en" ? "Orbit · Inbox" : "Orbit · 消息中心"}
      nav={
        <AppNav brand="Orbit">
          <IconBtn label={locale === "en" ? "Chat" : "消息"} count={0}>
            <MessageSquare className="size-4" />
          </IconBtn>
          <IconBtn label={locale === "en" ? "Mail" : "邮件"} count={0}>
            <Mail className="size-4" />
          </IconBtn>
          <IconBtn
            label={locale === "en" ? "Notifications" : "通知"}
            count={unread}
            active={open || page === "inbox"}
            onClick={() => {
              if (page === "inbox") {
                setPage("home");
                setOpen(false);
                return;
              }
              goInbox();
            }}
          >
            <Bell className="size-4" />
          </IconBtn>
          <AvatarMark mark="S" />
          {open && page === "home" ? (
            <div
              data-inbox-popover
              className="absolute right-3 top-11 z-30 w-80 max-w-[calc(100%-1.5rem)] rounded-lg border border-border bg-surface p-2 shadow-card"
              role="menu"
            >
              <div className="px-2 py-1.5 text-[11px] font-medium text-fg-muted">
                {locale === "en" ? "Inbox" : "消息"}
              </div>
              <ul className="flex flex-col">
                {items.slice(0, 3).map((item) => (
                  <li key={item.id} className="rounded-md px-2 py-2">
                    <div className="flex items-start gap-2">
                      {item.unread ? (
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                      ) : (
                        <span className="mt-1.5 size-1.5 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="truncate text-[13px] leading-snug">{pick(item.title, locale)}</div>
                        <div className="mt-0.5 text-[11px] text-fg-subtle">{pick(item.time, locale)}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={goInbox}
                className="mt-1 w-full rounded-md py-2 text-center text-[12px] text-fg-muted hover:bg-surface-2"
              >
                {locale === "en" ? "See all" : "查看全部"}
              </button>
            </div>
          ) : null}
        </AppNav>
      }
    >
      {page === "inbox" ? (
        <div className="px-6 py-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-[13px] font-semibold">{locale === "en" ? "Inbox" : "消息中心"}</h2>
              <p className="mt-0.5 text-[11px] text-fg-muted">
                {locale === "en" ? `${items.length} items` : `全部通知 · ${items.length} 条`}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Action onClick={pushResult}>{locale === "en" ? "Write a result" : "写入一条结果"}</Action>
              <Ghost onClick={markRead}>{locale === "en" ? "Mark all read" : "全部已读"}</Ghost>
            </div>
          </div>
          <ul data-inbox-list className="mt-4 flex flex-col gap-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-surface-2 px-3 py-2.5"
              >
                <div className="flex min-w-0 items-start gap-2">
                  <span
                    className={cn(
                      "mt-1.5 size-1.5 shrink-0 rounded-full",
                      item.unread ? "bg-accent" : "bg-transparent",
                    )}
                  />
                  <div className="min-w-0 truncate text-[13px]">{pick(item.title, locale)}</div>
                </div>
                <span className="shrink-0 text-[11px] text-fg-subtle">{pick(item.time, locale)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="px-6 py-7">
          <h2 className="text-[1.35rem] font-semibold tracking-tight">
            {locale === "en" ? "Data desk" : "数据工作台"}
          </h2>
          <p className="mt-1 text-[12px] text-fg-muted">
            {locale === "en" ? "Keep working. Results land in the bell." : "继续做事。结果写进铃铛。"}
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2.5">
            <Stat label={locale === "en" ? "Today" : "今日新增"} value="128" hint="+12%" />
            <Stat
              label={locale === "en" ? "Export" : "导出"}
              value={locale === "en" ? "Ready" : "可写入"}
              hint="CSV"
            />
            <Stat label={locale === "en" ? "Unread" : "未读"} value={String(unread)} hint={locale === "en" ? "In the bell" : "在铃铛里"} />
          </div>
          <div className="mt-5">
            <Action onClick={pushResult}>{locale === "en" ? "Write a result" : "写入一条结果"}</Action>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-fg-subtle">
            {locale === "en"
              ? "The export is logged. Open the bell later — this page is not interrupted."
              : "导出结果留档。稍后点铃铛回看，当前工作不被打断。"}
          </p>
        </div>
      )}
    </Frame>
  );
}
