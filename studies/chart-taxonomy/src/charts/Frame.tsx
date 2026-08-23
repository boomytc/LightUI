import type { ReactNode } from "react";

export function Window({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 overflow-x-hidden overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
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
      <div className="min-w-0 overflow-x-hidden p-5 sm:p-6">{children}</div>
    </div>
  );
}
