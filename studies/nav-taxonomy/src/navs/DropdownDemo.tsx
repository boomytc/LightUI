import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useFinePointer } from "../lib/pointer";
import { loc, pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Frame, HeroWash } from "./Frame";

const ITEMS = [loc("AI 写作", "AI writing"), loc("AI 绘画", "AI image"), loc("效率工具", "Utilities")];

export function DropdownDemo({ defaultOpen = false }: { defaultOpen?: boolean } = {}) {
  const locale = useLocale();
  const fine = useFinePointer();
  const [open, setOpen] = useState(defaultOpen);
  const [picked, setPicked] = useState(ITEMS[1]);

  return (
    <Frame title={locale === "en" ? "Site" : "官网"}>
      <div className="flex h-full flex-col">
        <div className="relative z-20 flex h-11 shrink-0 items-center gap-4 border-b border-border px-4 text-[13px]">
          <span className="font-medium">{locale === "en" ? "Studio" : "工作室"}</span>
          <span className="text-fg-muted">{locale === "en" ? "Home" : "首页"}</span>
          <div
            className="relative"
            onMouseEnter={() => {
              if (fine) setOpen(true);
            }}
            onMouseLeave={() => {
              if (fine) setOpen(false);
            }}
          >
            <button
              type="button"
              aria-expanded={open}
              aria-haspopup="menu"
              onClick={() => {
                if (fine) return;
                setOpen((v) => !v);
              }}
              className="flex items-center gap-0.5 font-medium text-accent"
            >
              {locale === "en" ? "Tools" : "工具"}
              <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
            </button>
            <div
              role="menu"
              className={cn(
                "absolute top-full left-0 z-30 min-w-36 origin-top rounded-lg border border-border bg-surface py-1 shadow-card transition-[opacity,transform] duration-200",
                open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-[0.97] opacity-0",
              )}
            >
              {ITEMS.map((item) => (
                <button
                  key={item.zh}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setPicked(item);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full px-3 py-2 text-left text-[13px]",
                    item.zh === picked.zh ? "bg-accent-soft text-fg" : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                  )}
                >
                  {pick(item, locale)}
                </button>
              ))}
            </div>
          </div>
          <span className="text-fg-muted">{locale === "en" ? "About" : "关于"}</span>
        </div>
        <HeroWash />
        <p className="p-4 text-[12px] text-fg-subtle">
          {locale === "en" ? "Current section: " : "当前栏目："}
          {pick(picked, locale)}
        </p>
      </div>
    </Frame>
  );
}
