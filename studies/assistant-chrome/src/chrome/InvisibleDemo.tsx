import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { PHOTOS } from "../lib/fixtures";
import { KINDS } from "../lib/kinds";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Window } from "./Frame";

const TONE: Record<string, string> = {
  sea: "chrome-photo-sea",
  brunch: "chrome-photo-brunch",
  lake: "chrome-photo-lake",
  mountain: "chrome-photo-mountain",
  party: "chrome-photo-party",
  night: "chrome-photo-night",
};

export function InvisibleDemo() {
  const locale = useLocale();
  const meta = KINDS[5]!;
  const [tagged, setTagged] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (e.key !== "k" && e.key !== "K") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      e.preventDefault();
      setTagged((v) => !v);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const done = tagged ? PHOTOS.length : 0;

  return (
    <Window title={pick(meta.window, locale)}>
      <div className="flex h-full min-w-0 flex-col overflow-x-hidden">
        <div className="flex items-center justify-between gap-2 px-3 pt-3">
          <h2 className="text-[15px] font-semibold">{locale === "en" ? "Photos" : "时光相册"}</h2>
          <p className="text-[11px] text-fg-subtle">{locale === "en" ? "K to sort" : "按 K 整理"}</p>
        </div>

        <div className="grid min-h-0 min-w-0 flex-1 grid-cols-3 gap-1.5 overflow-auto p-3">
          {PHOTOS.map((p) => (
            <figure key={p.id} className="min-w-0 overflow-hidden rounded-lg bg-surface-2">
              <div className={cn("relative aspect-[4/3]", TONE[p.tone])}>
                {tagged ? (
                  <span className="absolute top-1.5 left-1.5 rounded-full bg-accent px-1.5 py-px text-[9px] text-accent-fg">
                    {pick(p.tag, locale)}
                  </span>
                ) : null}
              </div>
              <figcaption className="min-w-0 px-1.5 py-1.5">
                <p className="truncate text-[11px] font-medium">{pick(p.title, locale)}</p>
                <p className="truncate text-[10px] text-fg-subtle">{pick(p.date, locale)}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2 text-[11px] text-fg-muted">
          {done > 0 ? (
            <p className="inline-flex min-w-0 items-center gap-1">
              <Check className="size-3 shrink-0 text-accent" />
              <span className="truncate">
                {locale === "en" ? `Sorted ${done} photos` : `已自动整理 ${done} 张`}
              </span>
            </p>
          ) : (
            <p className="truncate">{locale === "en" ? "No resident chrome" : "没有常驻铬"}</p>
          )}
          <span className="shrink-0 text-fg-subtle">{locale === "en" ? "K again undoes" : "再按 K 还原"}</span>
        </div>
      </div>
    </Window>
  );
}
