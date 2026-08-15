import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { loc, pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Frame, HeroWash } from "./Frame";

const MEGA = [
  { title: loc("AI 工具", "AI"), items: [loc("写作", "Write"), loc("绘画", "Image"), loc("视频", "Video")] },
  { title: loc("设计", "Design"), items: [loc("字体", "Type"), loc("配色", "Color"), loc("图标", "Icons")] },
  { title: loc("效率", "Work"), items: [loc("笔记", "Notes"), loc("表格", "Sheets"), loc("自动化", "Automate")] },
];

export function MegaDemo() {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState(MEGA[0].items[1]);

  return (
    <Frame title={locale === "en" ? "Sue · catalog" : "Sue · 分类"}>
      <div className="flex h-full flex-col">
        <div className="relative z-20 flex h-11 shrink-0 items-center gap-4 border-b border-border px-4 text-[13px]">
          <span className="font-medium">Sue</span>
          <span className="text-fg-muted">{locale === "en" ? "Home" : "首页"}</span>
          <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-0.5 font-medium text-accent"
            >
              {locale === "en" ? "Catalog" : "分类"}
              <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
            </button>
          </div>
          <span className="text-fg-muted">{locale === "en" ? "About" : "关于"}</span>
        </div>
        <div className="relative min-h-0 flex-1" onMouseEnter={() => open && setOpen(true)} onMouseLeave={() => setOpen(false)}>
          <HeroWash />
          <div
            className={cn(
              "absolute top-2 right-3 left-3 z-20 origin-top rounded-xl border border-border bg-surface p-4 shadow-card transition-[opacity,transform] duration-200",
              open
                ? "pointer-events-auto translate-y-0 opacity-100"
                : "pointer-events-none invisible -translate-y-1 opacity-0",
            )}
          >
            <div className="grid grid-cols-3 gap-4">
              {MEGA.map((col) => (
                <div key={col.title.zh}>
                  <p className="mb-2 text-[11px] font-medium tracking-wide text-accent">{pick(col.title, locale)}</p>
                  <ul className="space-y-1">
                    {col.items.map((item) => (
                      <li key={item.zh}>
                        <button
                          type="button"
                          onClick={() => {
                            setPicked(item);
                            setOpen(false);
                          }}
                          className="text-[13px] text-fg-muted hover:text-fg"
                        >
                          {pick(item, locale)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <p className="absolute bottom-3 left-4 text-[12px] text-fg-subtle">
            {locale === "en" ? "Current: " : "当前："}
            {pick(picked, locale)}
          </p>
        </div>
      </div>
    </Frame>
  );
}
