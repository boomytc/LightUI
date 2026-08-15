import { useState } from "react";
import { Menu } from "lucide-react";
import { LINKS } from "../lib/fixtures";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { FakeCards, FakeLines, Frame, HeroWash } from "./Frame";

export function SidebarDemo() {
  const locale = useLocale();
  const [collapsed, setCollapsed] = useState(false);
  const [page, setPage] = useState("home");

  return (
    <Frame title={locale === "en" ? "Sue · console" : "Sue · 控制台"}>
      <div className="flex h-full">
        <aside
          className="flex shrink-0 flex-col border-r border-border bg-surface"
          style={{
            width: collapsed ? 56 : 160,
            transition: "width 250ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <div className="flex h-11 items-center gap-2 px-3">
            <button
              type="button"
              aria-expanded={!collapsed}
              aria-label={
                collapsed
                  ? locale === "en"
                    ? "Expand sidebar"
                    : "展开侧栏"
                  : locale === "en"
                    ? "Collapse sidebar"
                    : "折叠侧栏"
              }
              onClick={() => setCollapsed((v) => !v)}
              className="grid size-8 place-items-center rounded-md text-fg-muted hover:bg-surface-2"
            >
              <Menu className="size-4" />
            </button>
            <span
              className={cn(
                "truncate text-[13px] font-medium",
                collapsed ? "w-0 opacity-0" : "opacity-100",
              )}
            >
              Sue
            </span>
          </div>
          <nav className="flex flex-col gap-0.5 px-2" aria-label={locale === "en" ? "Console" : "控制台"}>
            {LINKS.map((item) => {
              const Icon = item.icon;
              const on = page === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  title={collapsed ? pick(item.label, locale) : undefined}
                  onClick={() => setPage(item.id)}
                  className={cn(
                    "flex h-9 items-center gap-2.5 rounded-md px-2 text-[13px]",
                    on ? "bg-accent-soft text-fg" : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                  )}
                >
                  <Icon className="size-3.5 shrink-0" strokeWidth={1.8} />
                  <span className={cn("truncate", collapsed ? "w-0 opacity-0" : "opacity-100")}>
                    {pick(item.label, locale)}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>
        <section className="min-w-0 flex-1 overflow-y-auto">
          <HeroWash compact />
          <div className="space-y-3 p-4">
            <p className="text-[12px] text-fg-subtle">
              {locale === "en" ? "Vertical primary. Space models live next door." : "竖排主导航。空间模型在另一则。"}
            </p>
            <FakeLines />
            <FakeCards />
          </div>
        </section>
      </div>
    </Frame>
  );
}
