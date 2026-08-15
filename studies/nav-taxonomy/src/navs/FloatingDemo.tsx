import { LINKS } from "../lib/fixtures";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { FakeCards, FakeLines, Frame, HeroWash } from "./Frame";

export function FloatingDemo() {
  const locale = useLocale();

  return (
    <Frame title={locale === "en" ? "Portfolio" : "作品集"}>
      <div className="h-full overflow-y-auto bg-surface-2">
        <div className="sticky top-3 z-20 flex justify-center px-3 pt-1">
          <nav
            aria-label={locale === "en" ? "Primary" : "主导航"}
            className="flex items-center gap-1 rounded-full bg-surface px-2 py-1.5 shadow-card"
          >
            <span className="px-2.5 text-[13px] font-medium">{locale === "en" ? "Studio" : "工作室"}</span>
            {LINKS.map((item, index) => (
              <span
                key={item.id}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[13px]",
                  index === 0 ? "bg-accent-soft font-medium text-accent" : "text-fg-muted",
                )}
              >
                {pick(item.label, locale)}
              </span>
            ))}
          </nav>
        </div>
        <HeroWash />
        <div className="space-y-4 px-4 py-4">
          <FakeCards />
          <FakeLines />
          <FakeCards />
          <FakeLines n={4} />
        </div>
      </div>
    </Frame>
  );
}
