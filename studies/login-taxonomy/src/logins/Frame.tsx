import type { ReactNode } from "react";

export function Window({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="login-window overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border px-3">
        <span className="flex gap-1" aria-hidden="true">
          <i className="size-2 rounded-full bg-[#ff5f57]" />
          <i className="size-2 rounded-full bg-[#febc2e]" />
          <i className="size-2 rounded-full bg-[#28c840]" />
        </span>
        <p className="min-w-0 flex-1 truncate text-[12px] text-fg-subtle">{title}</p>
      </div>
      <div className="login-window-body">{children}</div>
    </div>
  );
}
