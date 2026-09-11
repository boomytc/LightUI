import type { RefObject } from "react";
import { seekTop } from "../lib/machines";
import type { Locale } from "../lib/site-locale";

export function CueHint({
  viewportRef,
  locale,
}: {
  viewportRef: RefObject<HTMLDivElement | null>;
  locale: Locale;
}) {
  const go = () => {
    const el = viewportRef.current;
    if (!el) return;
    const max = Math.max(0, el.scrollHeight - el.clientHeight);
    const top = seekTop("cue", {
      index: 0,
      n: 1,
      max,
      viewport: el.clientHeight,
      current: el.scrollTop,
    });
    if (top == null) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      className="scroll-cue absolute bottom-4 right-3 z-10 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-fg shadow-card"
      aria-label={locale === "en" ? "Scroll one screen" : "滚下一屏"}
      onClick={go}
    >
      <span className="text-[12px] font-medium tracking-tight">
        {locale === "en" ? "More below" : "下面还有"}
      </span>
      <svg viewBox="0 0 24 24" className="size-3.5" fill="none" aria-hidden="true">
        <path
          d="M6 9.5 12 15.5 18 9.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
