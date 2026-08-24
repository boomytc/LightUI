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
      className="scroll-cue absolute bottom-4 right-3 z-10 grid size-9 place-items-center rounded-full border border-border bg-surface text-fg shadow-card"
      aria-label={locale === "en" ? "Scroll one screen" : "滚下一屏"}
      onClick={go}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
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
