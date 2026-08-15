import { useState } from "react";
import { crumbTrail, isCurrent, shortenTo } from "../lib/crumb";
import { LINKS } from "../lib/fixtures";
import { loc, pick, useLocale } from "../lib/site-locale";
import { FakeCards, FakeLines, Frame } from "./Frame";

const TREE = [
  { id: "home", label: loc("首页", "Home") },
  { id: "tools", label: loc("AI 工具", "AI tools") },
  { id: "draw", label: loc("绘画", "Draw") },
  { id: "mj", label: loc("Midjourney", "Midjourney") },
];

export function BreadcrumbDemo() {
  const locale = useLocale();
  const [depth, setDepth] = useState(TREE.length);
  const trail = crumbTrail(TREE, depth);

  return (
    <Frame title={locale === "en" ? "Docs" : "文档"}>
      <div className="flex h-full flex-col">
        <div className="flex h-11 shrink-0 items-center gap-4 border-b border-border px-4 text-[13px]">
          <span className="font-medium">{locale === "en" ? "Studio" : "工作室"}</span>
          {LINKS.map((item, index) => (
            <span key={item.id} className={index === 1 ? "font-medium text-accent" : "text-fg-muted"}>
              {pick(item.label, locale)}
            </span>
          ))}
        </div>
        <nav aria-label="breadcrumb" className="shrink-0 px-4 py-2.5">
          <ol className="flex flex-wrap items-center gap-1 text-[12px]">
            {trail.map((item, index) => {
              const last = isCurrent(index, trail.length);
              return (
                <li key={item.id} className="flex items-center gap-1">
                  {index > 0 ? (
                    <span className="text-fg-subtle" aria-hidden>
                      /
                    </span>
                  ) : null}
                  {last ? (
                    <span aria-current="page" className="text-fg">
                      {pick(item.label, locale)}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="text-fg-muted hover:text-accent"
                      onClick={() => setDepth(shortenTo(index))}
                    >
                      {pick(item.label, locale)}
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <p className="mb-3 text-[12px] text-fg-subtle">
            {locale === "en" ? "A path under the primary nav. The last item is the page." : "主导航下面的路径。最后一项是当前页。"}
          </p>
          <FakeLines />
          <div className="mt-4">
            <FakeCards />
          </div>
          {depth < TREE.length ? (
            <button
              type="button"
              onClick={() => setDepth(TREE.length)}
              className="mt-4 text-[12px] text-accent hover:underline"
            >
              {locale === "en" ? "Restore the full path" : "恢复完整路径"}
            </button>
          ) : null}
        </div>
      </div>
    </Frame>
  );
}
