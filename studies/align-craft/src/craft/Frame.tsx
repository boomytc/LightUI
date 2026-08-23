import type { ReactNode } from "react";
import type { StageState } from "../lib/machines";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";

export function ComparePane({
  state,
  children,
}: {
  state: StageState;
  children: ReactNode;
}) {
  const locale = useLocale();
  const right = state === "right";
  return (
    <div
      data-align={state}
      className={cn(
        "flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-surface shadow-card",
        right ? "border-intent/35" : "border-border",
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-medium",
            right ? "bg-intent-soft text-intent" : "bg-accent-soft text-accent",
          )}
        >
          {right ? pick({ zh: "对", en: "Right" }, locale) : pick({ zh: "错", en: "Wrong" }, locale)}
        </span>
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center p-4 sm:p-5">{children}</div>
    </div>
  );
}
