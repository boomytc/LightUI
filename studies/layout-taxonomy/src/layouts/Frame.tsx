import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export function Window({
  title,
  children,
  fill = false,
  well = false,
  bodyClassName,
}: {
  title: string;
  children: ReactNode;
  fill?: boolean;
  well?: boolean;
  bodyClassName?: string;
}) {
  return (
    <div className="layout-window overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border px-3">
        <span className="flex gap-1" aria-hidden="true">
          <i className="size-2 rounded-full bg-[#ff5f57]" />
          <i className="size-2 rounded-full bg-[#febc2e]" />
          <i className="size-2 rounded-full bg-[#28c840]" />
        </span>
        <p className="min-w-0 flex-1 truncate text-[12px] text-fg-subtle">{title}</p>
      </div>
      <div
        className={cn(
          "layout-window-body",
          fill && "layout-window-fill",
          well && "layout-window-well",
          bodyClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
