import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { LINKS } from "../lib/fixtures";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { FakeCards, FakeLines, Frame, HeroWash } from "./Frame";

export function OverlayDemo({ defaultOpen = false }: { defaultOpen?: boolean } = {}) {
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
    <Frame title={locale === "en" ? "Show" : "作品集"}>
      <div className="relative h-full overflow-hidden">
        <div className="flex h-11 items-center justify-between px-3">
          <span className="text-[13px] font-medium">{locale === "en" ? "Studio" : "工作室"}</span>
          <button
            ref={btnRef}
            type="button"
            aria-expanded={open}
            aria-label={locale === "en" ? "Open overlay" : "打开全屏菜单"}
            onClick={() => setOpen(true)}
            className="grid size-9 place-items-center rounded-md hover:bg-surface-2"
          >
            <Menu className="size-4" />
          </button>
        </div>
        <HeroWash />
        <div className="space-y-3 p-4">
          <FakeCards />
          <FakeLines />
        </div>

        <div
          role="dialog"
          aria-modal="true"
          aria-label={locale === "en" ? "Menu" : "全屏菜单"}
          className={cn(
            "absolute inset-0 z-40 flex flex-col bg-surface/95 backdrop-blur-sm transition-opacity duration-300",
            open ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <div className="flex justify-end p-2">
            <button
              type="button"
              aria-label={locale === "en" ? "Close" : "关闭"}
              onClick={close}
              className="grid size-10 place-items-center rounded-md hover:bg-surface-2"
            >
              <X className="size-4" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col items-center justify-center gap-1 pb-10">
            {LINKS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={close}
                className={cn(
                  "text-[1.7rem] leading-snug tracking-tight",
                  index === 0 ? "font-semibold text-accent" : "text-fg-muted hover:text-fg",
                )}
              >
                {pick(item.label, locale)}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </Frame>
  );
}
