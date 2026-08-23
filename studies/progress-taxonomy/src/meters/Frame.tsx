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
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
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
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

/** Desktop teaching pane — the meter is the fixture, not a 390 window. */
export function Pane({ children }: { children: ReactNode }) {
  return (
    <div
      data-pane="hero"
      className="flex min-h-[22rem] flex-col justify-center overflow-hidden rounded-2xl border border-border bg-surface px-6 py-10 shadow-card sm:px-10 lg:min-h-[26rem] lg:py-12"
    >
      {children}
    </div>
  );
}
