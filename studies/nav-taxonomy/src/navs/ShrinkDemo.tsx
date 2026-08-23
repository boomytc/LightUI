import { useState } from "react";
import { LINKS } from "../lib/fixtures";
import { pick, useLocale } from "../lib/site-locale";
import { nextShrunk } from "../lib/shrink";
import { cn } from "../lib/utils";
import { FakeCards, FakeLines, Frame } from "./Frame";

export function ShrinkDemo() {
  const locale = useLocale();
  const [shrunk, setShrunk] = useState(false);

  return (
    <Frame title={locale === "en" ? "Brand" : "品牌站"}>
      <div
        className="h-full overflow-x-hidden overflow-y-auto"
        onScroll={(event) => {
          const y = event.currentTarget.scrollTop;
          setShrunk((prev) => nextShrunk(prev, y));
        }}
      >
        <header
          className={cn(
            "sticky top-0 z-20 flex min-w-0 items-center justify-between gap-3 px-3 transition-[height,background-color,color,box-shadow] duration-200 @min-[32rem]:px-4",
            shrunk
              ? "h-11 bg-surface text-fg shadow-[0_1px_0_0_var(--color-border)]"
              : "h-14 bg-transparent text-surface",
          )}
        >
          <span className="shrink-0 text-[13px] font-medium">{locale === "en" ? "Studio" : "工作室"}</span>
          <nav
            className="flex min-w-0 gap-2.5 overflow-x-auto text-[13px] @min-[32rem]:gap-4"
            aria-label={locale === "en" ? "Primary" : "主导航"}
          >
            {LINKS.map((item, index) => (
              <span
                key={item.id}
                className={cn("shrink-0", index === 0 ? (shrunk ? "font-medium text-accent" : "font-medium") : undefined)}
              >
                {pick(item.label, locale)}
              </span>
            ))}
          </nav>
        </header>
        <div className="-mt-14">
          <div className="relative h-48 bg-linear-to-br from-fg via-fg-muted to-accent">
            <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-surface to-transparent" />
          </div>
          <div className="space-y-4 px-4 py-4">
            <p className="text-[12px] text-fg-subtle">
              {shrunk
                ? locale === "en"
                  ? "Past 40px · shorter and solid"
                  : "已过 40px · 变矮变实"
                : locale === "en"
                  ? "Scroll · enter 40 / leave 16"
                  : "向下滚 · 进入 40 / 退出 16"}
            </p>
            <FakeCards />
            <FakeLines n={4} />
            <FakeCards />
          </div>
        </div>
      </div>
    </Frame>
  );
}
