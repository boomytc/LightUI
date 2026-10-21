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

export function InvisibleDemo({ locked = false }: { locked?: boolean }) {
  const locale = useLocale();
  const meta = KINDS[5]!;
  const [tagged, setTagged] = useState(locked);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (locked) return;
    setTagged(false);
    const timer = window.setTimeout(() => setTagged(true), 900);
    return () => window.clearTimeout(timer);
  }, [locked, run]);

  const done = tagged ? PHOTOS.length : 0;

  return (
    <Window title={pick(meta.window, locale)}>
      <div data-album className="flex h-full min-w-0 flex-col overflow-x-hidden">
        <div className="flex items-center justify-between gap-2 px-3 pt-3">
          <h2 className="text-[15px] font-semibold">{locale === "en" ? "Photos" : "时光相册"}</h2>
          <p className="text-[11px] text-fg-subtle">{locale === "en" ? "Automatic sorting" : "后台自动分类"}</p>
        </div>

        <div className="chrome-album-grid min-h-0 min-w-0 flex-1 gap-1.5 overflow-auto p-3">
          {PHOTOS.map((p) => (
            <figure key={p.id} className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg bg-surface-2">
              <div className={cn("relative min-h-12 min-w-0 flex-1", TONE[p.tone])}>
                {tagged ? (
                  <span className="chrome-tag-in absolute top-1.5 left-1.5 rounded-full bg-accent px-1.5 py-px text-[9px] text-accent-fg">
                    {pick(p.tag, locale)}
                  </span>
                ) : null}
              </div>
              <figcaption className="min-w-0 shrink-0 px-1.5 py-1.5">
                <p className="truncate text-[11px] font-medium">{pick(p.title, locale)}</p>
                <p className="truncate text-[10px] text-fg-subtle">{pick(p.date, locale)}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        <div aria-live="polite" className="flex items-center justify-between gap-2 border-t border-border px-3 py-2 text-[11px] text-fg-muted">
          {done > 0 ? (
            <p className="inline-flex min-w-0 items-center gap-1">
              <Check className="size-3 shrink-0 text-accent" />
              <span className="truncate">
                {locale === "en" ? `Sorted ${done} photos` : `已自动整理 ${done} 张`}
              </span>
            </p>
          ) : (
            <p className="truncate">{locale === "en" ? "Sorting in the background…" : "正在后台整理…"}</p>
          )}
          {!locked && <button type="button" disabled={!tagged} onClick={() => setRun((n) => n + 1)} className="shrink-0 text-fg-subtle underline disabled:opacity-40">
            {locale === "en" ? "Replay sorting" : "重播整理过程"}
          </button>}
        </div>
      </div>
    </Window>
  );
}
