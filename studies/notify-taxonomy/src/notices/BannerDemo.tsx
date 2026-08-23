import { useState } from "react";
import { Info, X } from "lucide-react";
import { TEAM } from "../lib/fixtures";
import { stageOn } from "../lib/machines";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Action, AppNav, Frame, Stat } from "./Frame";

type PageId = "desk" | "team";

export function BannerDemo({ state }: { state?: string } = {}) {
  const locale = useLocale();
  const [visible, setVisible] = useState(state === undefined ? true : stageOn(state));
  const [page, setPage] = useState<PageId>("desk");

  const tabs: { id: PageId; label: string }[] = [
    { id: "desk", label: locale === "en" ? "Desk" : "工作台" },
    { id: "team", label: locale === "en" ? "Team" : "团队" },
  ];

  return (
    <Frame
      title={locale === "en" ? "Orbit · Banner" : "Orbit · 全局通知"}
      nav={
        <AppNav brand="Orbit">
          <nav className="flex items-center gap-0.5 text-[12px]">
            {tabs.map((tab) => {
              const on = page === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPage(tab.id)}
                  className={cn(
                    "relative px-2.5 py-1.5",
                    on ? "text-accent" : "text-fg-muted hover:text-fg",
                  )}
                >
                  {tab.label}
                  {on ? <span className="absolute inset-x-2.5 -bottom-0.5 h-px bg-accent" /> : null}
                </button>
              );
            })}
          </nav>
        </AppNav>
      }
      bar={
        visible ? (
          <div className="flex h-8 shrink-0 items-center gap-2 overflow-hidden bg-fg px-3 text-surface">
            <Info className="size-3.5 shrink-0" />
            <p className="min-w-0 flex-1 truncate text-[12px]">
              {locale === "en" ? "23:00–24:00 some services pause" : "今晚 23:00–24:00 部分服务暂停"}
            </p>
            <button
              type="button"
              aria-label={locale === "en" ? "Dismiss banner" : "关闭通知条"}
              onClick={() => setVisible(false)}
              className="grid size-6 shrink-0 place-items-center text-surface/55 hover:text-surface"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : null
      }
    >
      {page === "desk" ? (
        <div className="px-5 py-5">
          <h2 className="text-[13px] font-semibold">{locale === "en" ? "Desk" : "工作台"}</h2>
          <p className="mt-0.5 text-[11px] text-fg-muted">
            {locale === "en" ? "Switch pages. The bar stays." : "切换页面。通知条还在。"}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat label={locale === "en" ? "Visits" : "今日访问"} value="8,421" hint="+4%" />
            <Stat label={locale === "en" ? "Follows" : "新增关注"} value="1,028" hint="+9%" />
            <Stat label={locale === "en" ? "Rate" : "转化率"} value="3.8%" hint="—" />
          </div>
          {!visible ? (
            <div className="mt-4">
              <Action onClick={() => setVisible(true)}>
                {locale === "en" ? "Show banner" : "显示通知条"}
              </Action>
            </div>
          ) : null}
          <p className="mt-3 text-[11px] leading-relaxed text-fg-subtle">
            {locale === "en"
              ? "Under the nav, across both pages, until X. Not a one-shot toast on this page only."
              : "在导航下方，两个页面都在，直到点 X。不是只在当前页弹一次的轻提示。"}
          </p>
        </div>
      ) : (
        <div className="px-5 py-5">
          <h2 className="text-[13px] font-semibold">{locale === "en" ? "Team" : "团队设置"}</h2>
          <p className="mt-0.5 text-[11px] text-fg-muted">
            {locale === "en" ? "Members and roles" : "成员与权限"}
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {TEAM.map((person) => (
              <li
                key={person.id}
                className="flex items-center justify-between gap-3 rounded-md bg-surface-2 px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-[11px] font-medium text-accent">
                    {person.mark}
                  </span>
                  <span className="truncate text-[13px]">{pick(person.name, locale)}</span>
                  <span className="rounded-sm bg-surface px-1.5 py-0.5 text-[10px] text-fg-muted">
                    {pick(person.role, locale)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          {!visible ? (
            <div className="mt-4">
              <Action onClick={() => setVisible(true)}>
                {locale === "en" ? "Show banner" : "显示通知条"}
              </Action>
            </div>
          ) : null}
        </div>
      )}
    </Frame>
  );
}
