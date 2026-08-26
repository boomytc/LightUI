import type { ReactNode } from "react";
import { cn } from "../lib/utils";

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
    <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
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
      <div className="min-w-0 overflow-x-hidden p-5">{children}</div>
    </div>
  );
}

export function DemoCard({
  caption,
  children,
}: {
  caption: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-surface-2 p-4">
      <p className="mb-3 text-[11px] leading-snug text-fg-subtle">{caption}</p>
      {children}
    </div>
  );
}

export function GhostButton({
  on,
  locked,
  onClick,
  children,
}: {
  on: boolean;
  locked?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={locked}
      onClick={() => {
        if (locked) return;
        onClick();
      }}
      className={cn(
        "mt-4 inline-flex h-9 items-center rounded-lg px-3 text-[13px] transition-colors",
        on ? "border border-border bg-surface text-fg" : "bg-fg text-surface",
        locked && "cursor-not-allowed opacity-60",
      )}
    >
      {children}
    </button>
  );
}
