import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export function Window({
  title,
  action,
  children,
  dark = false,
  fill = false,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  dark?: boolean;
  fill?: boolean;
}) {
  if (fill) {
    return (
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden",
          dark ? "bg-[#161418] text-white" : "bg-surface text-fg",
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-center justify-between gap-3 px-5 py-2.5",
            dark ? "border-b border-white/8" : "border-b border-border",
          )}
        >
          <p className={cn("truncate text-[12px]", dark ? "text-white/45" : "text-fg-subtle")}>{title}</p>
          {action}
        </div>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={
        dark
          ? "overflow-hidden rounded-2xl border border-white/10 bg-[#161418] text-white shadow-card"
          : "overflow-hidden rounded-2xl border border-border bg-surface shadow-card"
      }
    >
      <div
        className={
          dark
            ? "flex items-center justify-between gap-3 border-b border-white/8 px-4 py-2.5"
            : "flex items-center justify-between gap-3 border-b border-border px-4 py-2.5"
        }
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex gap-1" aria-hidden="true">
            <i className="size-2 rounded-full bg-[#ff5f57]" />
            <i className="size-2 rounded-full bg-[#febc2e]" />
            <i className="size-2 rounded-full bg-[#28c840]" />
          </span>
          <p className={dark ? "truncate text-[12px] text-white/45" : "truncate text-[12px] text-fg-subtle"}>
            {title}
          </p>
        </div>
        {action}
      </div>
      <div className={dark ? "p-0" : "p-5 sm:p-6"}>{children}</div>
    </div>
  );
}

export function TableHead({ cells }: { cells: string[] }) {
  return (
    <div
      className="grid gap-3 border-b border-border bg-surface-2 px-3 py-2 text-[11px] text-fg-subtle"
      style={{ gridTemplateColumns: `minmax(0,1.4fr) repeat(${cells.length - 1}, minmax(0,1fr))` }}
    >
      {cells.map((cell) => (
        <span key={cell} className="truncate">
          {cell}
        </span>
      ))}
    </div>
  );
}

export function TableRow({ cells }: { cells: string[] }) {
  return (
    <div
      className="grid gap-3 border-b border-border px-3 py-2.5 text-[13px] last:border-b-0"
      style={{ gridTemplateColumns: `minmax(0,1.4fr) repeat(${cells.length - 1}, minmax(0,1fr))` }}
    >
      {cells.map((cell, i) => (
        <span key={`${cell}-${i}`} className={i === 0 ? "truncate font-medium" : "truncate text-fg-muted"}>
          {cell}
        </span>
      ))}
    </div>
  );
}
