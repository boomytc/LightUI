import type { ReactNode } from "react";
import { loc, pick, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Btn, DemoShell, fieldClass } from "./Frame";

export type TargetId = "metric" | "title" | "permission" | "publish" | "feature";

const NAV = [
  { id: "home", zh: "概览", en: "Home" },
  { id: "projects", zh: "项目", en: "Projects" },
  { id: "templates", zh: "模板", en: "Templates", feature: true },
  { id: "settings", zh: "设置", en: "Settings" },
] as const;

export function Workbench({
  compact = false,
  locale,
  title,
  permission,
  shipped,
  onTitle,
  onPermission,
  onPublish,
  onTarget,
  register,
  hostRef,
  overlay,
  rail,
}: {
  compact?: boolean;
  locale: Locale;
  title: string;
  permission: boolean;
  shipped: boolean;
  onTitle: (value: string) => void;
  onPermission: (value: boolean) => void;
  onPublish: () => void;
  onTarget: (id: TargetId) => void;
  register: (id: TargetId, el: HTMLElement | null) => void;
  hostRef: (el: HTMLDivElement | null) => void;
  overlay?: ReactNode;
  rail?: ReactNode;
}) {
  return (
    <DemoShell
      compact={compact}
      brand="Orbit"
      title={locale === "en" ? "Workbench" : "工作台"}
    >
      <div ref={hostRef} className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
        <nav
          className="flex h-10 shrink-0 items-center gap-1 overflow-x-auto border-b border-border px-2 sm:px-4"
          aria-label={locale === "en" ? "Workbench" : "工作台"}
        >
          {NAV.map((item) => {
            const feature = "feature" in item && item.feature;
            return (
              <button
                key={item.id}
                type="button"
                ref={feature ? (el) => register("feature", el) : undefined}
                onClick={feature ? () => onTarget("feature") : undefined}
                className={cn(
                  "relative inline-flex h-8 shrink-0 items-center gap-1 rounded-md px-2.5 text-[12px] font-medium",
                  feature ? "text-fg" : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                )}
              >
                {pick({ zh: item.zh, en: item.en }, locale)}
                {feature ? (
                  <span className="rounded bg-accent-soft px-1 py-px text-[9px] font-semibold text-accent">
                    {locale === "en" ? "New" : "新"}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div
          className={cn(
            "grid min-h-0 gap-3 overflow-y-auto p-3 sm:p-4",
            rail ? "sm:grid-cols-[9.5rem_minmax(0,1fr)_13rem]" : "sm:grid-cols-[9.5rem_minmax(0,1fr)]",
          )}
        >
          <article
            ref={(el) => register("metric", el)}
            className="rounded-xl border border-border bg-surface-2 px-3 py-3"
          >
            <p className="text-[11px] text-fg-subtle">
              {pick(loc("本周发布", "Shipped this week"), locale)}
            </p>
            <p className="mt-1 font-mono text-[1.6rem] font-semibold tracking-tight tabular-nums">12</p>
            <p className="mt-1 text-[11px] text-intent">{pick(loc("较上周 +3", "+3 vs last week"), locale)}</p>
          </article>

          <div className="min-w-0 rounded-xl border border-border bg-surface px-3 py-3">
            <label className="block text-[11px] font-medium text-fg-muted" htmlFor="guide-title">
              {pick(loc("标题", "Title"), locale)}
            </label>
            <input
              id="guide-title"
              ref={(el) => register("title", el)}
              className={cn(fieldClass, "mt-1")}
              value={title}
              placeholder={pick(loc("给这一次发布起名", "Name this release"), locale)}
              onChange={(e) => onTitle(e.target.value)}
            />
            <label className="mt-3 block text-[11px] font-medium text-fg-muted" htmlFor="guide-permission">
              {pick(loc("可见范围", "Visibility"), locale)}
            </label>
            <select
              id="guide-permission"
              ref={(el) => register("permission", el)}
              className={cn(fieldClass, "mt-1")}
              value={permission ? "team" : "self"}
              onPointerDown={() => onTarget("permission")}
              onChange={(e) => onPermission(e.target.value === "team")}
            >
              <option value="self">{pick(loc("仅自己", "Only me"), locale)}</option>
              <option value="team">{pick(loc("团队可见", "Team"), locale)}</option>
            </select>
            <div className="mt-3 flex items-center justify-end gap-2">
              {shipped ? (
                <span className="text-[12px] text-intent">{pick(loc("已发布", "Published"), locale)}</span>
              ) : null}
              <Btn ref={(el) => register("publish", el)} onClick={() => { onTarget("publish"); onPublish(); }}>
                {pick(loc("发布", "Publish"), locale)}
              </Btn>
            </div>
          </div>

          {rail}
        </div>

        {overlay}
      </div>
    </DemoShell>
  );
}
