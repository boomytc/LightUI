import type { ReactNode } from "react";
import type { StageState } from "../lib/machines";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";

export function ComparePane({
  state,
  hint,
  caption,
  children,
}: {
  state: StageState;
  hint: string;
  caption: string;
  children: ReactNode;
}) {
  const locale = useLocale();
  const right = state === "right";
  return (
    <figure
      data-align={state}
      className={cn(
        "align-pane flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-surface shadow-card",
        right ? "border-intent/40" : "border-wrong/35",
      )}
    >
      <figcaption className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-medium",
            right ? "bg-intent-soft text-intent" : "bg-wrong-soft text-wrong",
          )}
        >
          {right ? pick({ zh: "对", en: "Right" }, locale) : pick({ zh: "错", en: "Wrong" }, locale)}
        </span>
        <span
          className={cn(
            "min-w-0 truncate text-[11px] font-medium",
            right ? "text-intent" : "text-wrong",
          )}
        >
          {hint}
        </span>
      </figcaption>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center p-4 sm:p-5">{children}</div>
      <p
        className={cn(
          "shrink-0 border-t px-3 py-2 text-[11px] leading-snug",
          right
            ? "border-intent/20 bg-intent-soft/50 text-fg-muted"
            : "border-wrong/15 bg-wrong-soft/45 text-fg-muted",
        )}
      >
        {caption}
      </p>
    </figure>
  );
}
