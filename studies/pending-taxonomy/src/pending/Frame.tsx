import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export function Window({
  title,
  action,
  covered,
  overlay,
  children,
}: {
  title: string;
  action?: ReactNode;
  covered?: boolean;
  overlay?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="pending-window overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div
        className={cn(
          "flex items-center justify-between gap-3 border-b border-border px-3 py-2.5",
          covered && "invisible",
        )}
        aria-hidden={covered || undefined}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex gap-1" aria-hidden="true">
            <i className="size-2 rounded-full bg-[#ff5f57]" />
            <i className="size-2 rounded-full bg-[#febc2e]" />
            <i className="size-2 rounded-full bg-[#28c840]" />
          </span>
          <p className="truncate text-[12px] text-fg-subtle">{title}</p>
        </div>
        {covered ? null : action}
      </div>
      <div className="pending-window-body p-3" data-region="list">
        {children}
      </div>
      {overlay}
    </div>
  );
}
