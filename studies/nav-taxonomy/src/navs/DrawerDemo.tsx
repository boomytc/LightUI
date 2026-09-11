import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { LINKS } from "../lib/fixtures";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { FakeCards, FakeLines, Frame, HeroWash } from "./Frame";
import "./nav.css";

export function DrawerDemo({ defaultOpen = false }: { defaultOpen?: boolean } = {}) {
  const locale = useLocale();
  const [open, setOpen] = useState(defaultOpen);
  const btnRef = useRef<HTMLButtonElement>(null);

  function close() {
    setOpen(false);
    btnRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <Frame title={locale === "en" ? "Phone" : "小屏"}>
      <div className="relative h-full min-w-0 overflow-hidden">
        <div className="flex h-11 min-w-0 items-center justify-between border-b border-border px-3">
          <span className="truncate text-[13px] font-medium">{locale === "en" ? "Studio" : "工作室"}</span>
          <button
            ref={btnRef}
            type="button"
            aria-expanded={open}
            aria-controls="nav-drawer"
            aria-label={open ? (locale === "en" ? "Close menu" : "关闭菜单") : locale === "en" ? "Open menu" : "打开菜单"}
            onClick={() => setOpen((v) => !v)}
            className="grid size-9 shrink-0 place-items-center rounded-md hover:bg-surface-2"
          >
            <span className="relative size-4">
              <Menu
                className={cn(
                  "absolute inset-0 size-4 transition-[opacity,transform] duration-300",
                  open ? "scale-75 opacity-0" : "scale-100 opacity-100",
                )}
              />
              <X
                className={cn(
                  "absolute inset-0 size-4 transition-[opacity,transform] duration-300",
                  open ? "scale-100 opacity-100" : "scale-75 opacity-0",
                )}
              />
            </span>
          </button>
        </div>
        <HeroWash compact />
        <div className="space-y-3 p-4">
          <FakeCards />
          <FakeLines />
        </div>

        <div
          className={cn(
            "nav-veil absolute inset-0 z-30 bg-fg/35 backdrop-blur-[2px]",
            open ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          onClick={close}
        />
        <aside
          id="nav-drawer"
          className={cn(
            "nav-sheet absolute inset-y-0 right-0 z-40 flex w-[min(18rem,80%)] max-w-[80%] flex-col bg-surface shadow-menu",
            open ? "translate-x-0" : "translate-x-full",
          )}
          aria-hidden={!open}
        >
          <div className="flex h-11 items-center justify-between px-4">
            <span className="text-[13px] font-medium">{locale === "en" ? "Menu" : "菜单"}</span>
            <button
              type="button"
              aria-label={locale === "en" ? "Close menu" : "关闭菜单"}
              onClick={close}
              className="grid size-9 place-items-center rounded-md hover:bg-surface-2"
            >
              <X className="size-4" />
            </button>
          </div>
          <nav className="flex flex-col px-2" aria-label={locale === "en" ? "Primary" : "主导航"}>
            {LINKS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={close}
                className="rounded-md px-3 py-2.5 text-left text-[14px] text-fg-muted hover:bg-surface-2 hover:text-fg"
              >
                {pick(item.label, locale)}
              </button>
            ))}
          </nav>
        </aside>
      </div>
    </Frame>
  );
}
