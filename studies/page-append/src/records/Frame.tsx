import type { ReactNode, RefObject } from "react";
import { cn } from "../lib/utils";

export function Window({
  compact = false,
  title,
  brand,
  action,
  toolbar,
  footer,
  scrollerRef,
  children,
}: {
  compact?: boolean;
  title: string;
  brand: string;
  action?: ReactNode;
  toolbar?: ReactNode;
  footer?: ReactNode;
  scrollerRef?: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  return (
    <div
      data-records-page
      data-records-compact={compact ? "" : undefined}
      className={cn(
        "records-window border border-border bg-surface shadow-card",
        compact ? "records-window-compact rounded-2xl" : "records-window-live rounded-2xl",
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
              资
            </span>
            <p className="truncate text-[13px] font-semibold tracking-tight">{brand}</p>
            <span className="hidden truncate text-[12px] text-fg-subtle sm:inline">{title}</span>
          </div>
          {action}
        </div>
      )}
      {toolbar}
      <div ref={scrollerRef} className="records-scroller" data-region="list">
        {children}
      </div>
      {footer}
    </div>
  );
}
