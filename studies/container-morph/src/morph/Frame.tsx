import type { ReactNode } from "react";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";

export function DemoShell({
  compact = false,
  title,
  brand,
  action,
  children,
}: {
  compact?: boolean;
  title: string;
  brand: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative isolate flex min-w-0 flex-col overflow-hidden overflow-x-hidden border border-border bg-surface",
        compact
          ? "min-h-[22rem] rounded-2xl shadow-card"
          : "min-h-[36rem] w-full rounded-2xl shadow-card",
      )}
    >
      {compact ? (
        <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-border px-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex gap-1" aria-hidden="true">
              <i className="size-2 rounded-full bg-[#ff5f57]" />
              <i className="size-2 rounded-full bg-[#febc2e]" />
              <i className="size-2 rounded-full bg-[#28c840]" />
            </span>
            <p className="truncate text-[12px] text-fg-subtle">{title}</p>
          </div>
          {action}
        </div>
      ) : (
        <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border px-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-6 shrink-0 place-items-center rounded-md bg-fg text-[10px] font-semibold text-surface">
              M
            </span>
            <p className="truncate text-[13px] font-semibold tracking-tight">{brand}</p>
            <span className="hidden truncate text-[12px] text-fg-subtle sm:inline">{title}</span>
          </div>
          {action}
        </div>
      )}
      <div className="relative min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">{children}</div>
    </div>
  );
}

export function ComparePane({
  tone,
  hint,
  children,
}: {
  tone: "right" | "wrong";
  hint: string;
  children: ReactNode;
}) {
  const locale = useLocale();
  const right = tone === "right";
  return (
    <div className="morph-compare-pane" data-tone={tone}>
      <div className="flex items-center justify-between gap-2 px-3 pt-3 sm:px-4">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-medium",
            right ? "bg-intent-soft text-intent" : "bg-wrong-soft text-wrong",
          )}
        >
          {right ? pick({ zh: "对", en: "Right" }, locale) : pick({ zh: "错", en: "Wrong" }, locale)}
        </span>
        <span className="truncate text-[11px] text-fg-subtle">{hint}</span>
      </div>
      {children}
    </div>
  );
}
