import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { LINKS } from "../lib/fixtures";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { FakeCards, FakeLines, Frame, HeroWash } from "./Frame";

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
      <div className="relative h-full overflow-hidden">
        <div className="flex h-11 items-center justify-between border-b border-border px-3">
          <span className="text-[13px] font-medium">{locale === "en" ? "Studio" : "工作室"}</span>
          <button
            ref={btnRef}
            type="button"
            aria-expanded={open}
            aria-controls="nav-drawer"
            aria-label={open ? (locale === "en" ? "Close menu" : "关闭菜单") : locale === "en" ? "Open menu" : "打开菜单"}
            onClick={() => setOpen((v) => !v)}
            className="grid size-9 place-items-center rounded-md hover:bg-surface-2"
          >
            <Menu className="size-4" />
          </button>
        </div>
        <HeroWash compact />
        <div className="space-y-3 p-4">
          <FakeCards />
          <FakeLines />
        </div>

        <div
          className={cn(
            "absolute inset-0 z-30 bg-fg/30 transition-opacity duration-200",
            open ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          onClick={close}
        />
        <aside
          id="nav-drawer"
          className={cn(
            "absolute inset-y-0 right-0 z-40 flex w-[70%] max-w-56 flex-col bg-surface shadow-card transition-transform duration-200",
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
