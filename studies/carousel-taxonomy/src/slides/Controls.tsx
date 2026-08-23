import { ChevronLeft, ChevronRight } from "lucide-react";
import { dotsIndex } from "../lib/machines";
import type { Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";

export function Controls({
  index,
  length,
  locale,
  go,
  next,
  prev,
}: {
  index: number;
  length: number;
  locale: Locale;
  go: (n: number) => void;
  next: () => void;
  prev: () => void;
}) {
  const current = dotsIndex(index, length);

  return (
    <div className="flex items-center justify-between gap-2 px-2 py-2.5">
      <button
        type="button"
        aria-label={locale === "en" ? "Previous" : "上一张"}
        onClick={prev}
        className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-2 text-fg"
      >
        <ChevronLeft className="size-4" />
      </button>
      <div
        className="flex min-w-0 items-center justify-center gap-0.5"
        role="tablist"
        aria-label={locale === "en" ? "Frames" : "画面"}
      >
        {Array.from({ length }, (_, i) => {
          const on = i === current;
          return (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={on}
              aria-label={locale === "en" ? `Frame ${i + 1}` : `第 ${i + 1} 张`}
              onClick={() => go(i)}
              className="grid size-7 place-items-center"
            >
              <span
                className={cn(
                  "size-2.5 rounded-full transition-[transform,background-color] duration-200",
                  on ? "scale-110 bg-fg" : "bg-border-strong",
                )}
              />
            </button>
          );
        })}
      </div>
      <button
        type="button"
        aria-label={locale === "en" ? "Next" : "下一张"}
        onClick={next}
        className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-2 text-fg"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
