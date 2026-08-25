import { useState } from "react";
import { LINKS } from "../lib/fixtures";
import { itemCap } from "../lib/occupy";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { FakeCards, FakeLines, Frame } from "./Frame";

export function BottomNavDemo() {
  const locale = useLocale();
  const items = LINKS.slice(0, itemCap("bottom") ?? 4);
  const [page, setPage] = useState(items[0]!.id);
  const current = items.find((item) => item.id === page) ?? items[0]!;

  return (
    <Frame title={locale === "en" ? "Phone · home" : "手机 · 首页"}>
      <div className="flex h-full min-w-0 flex-col bg-bg">
        <section className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="px-4 pt-5 pb-3">
            <p className="text-[11px] tracking-wide text-fg-subtle uppercase">
              {locale === "en" ? "Primary" : "一级入口"}
            </p>
            <h3 className="mt-1 text-[18px] font-semibold tracking-tight">
              {pick(current.label, locale)}
            </h3>
            <p className="mt-1 text-[12px] text-fg-muted">
              {locale === "en"
                ? "The bar occupies the bottom. It is not a hamburger overlay."
                : "底栏占着底部。不是汉堡盖上来。"}
            </p>
          </div>
          <div className="space-y-3 px-4 pb-4">
            <FakeCards n={4} />
            <FakeLines />
          </div>
        </section>
        <nav
          aria-label={locale === "en" ? "Primary" : "主导航"}
          className="grid shrink-0 border-t border-border bg-surface"
          style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
        >
          {items.map((item) => {
            const Icon = item.icon;
            const on = page === item.id;
            return (
              <button
                key={item.id}
                type="button"
                data-nav-item={item.id}
                onClick={() => setPage(item.id)}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-0.5 py-1.5 text-[10px]",
                  on ? "text-fg" : "text-fg-subtle",
                )}
              >
                <Icon
                  className={cn("size-4 transition-transform duration-200", on && "-translate-y-0.5")}
                  strokeWidth={on ? 2.2 : 1.8}
                />
                <span className="font-medium">{pick(item.label, locale)}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </Frame>
  );
}
