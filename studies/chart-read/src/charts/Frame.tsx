import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export function Window({
  title,
  action,
  compact = false,
  children,
}: {
  title: string;
  action?: ReactNode;
  compact?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="flex min-w-0 items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex shrink-0 gap-1" aria-hidden="true">
            <i className="size-2 rounded-full bg-[#ff5f57]" />
            <i className="size-2 rounded-full bg-[#febc2e]" />
            <i className="size-2 rounded-full bg-[#28c840]" />
          </span>
          <p className="truncate text-[12px] text-fg-subtle">{title}</p>
        </div>
        {action}
      </div>
      <div className={cn("min-w-0 overflow-x-hidden", compact ? "p-3 sm:p-4" : "p-4 sm:p-5")}>
        {children}
      </div>
    </div>
  );
}
