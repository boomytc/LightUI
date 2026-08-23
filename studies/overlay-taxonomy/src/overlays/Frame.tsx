import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/utils";

export function DemoShell({
  compact = false,
  title,
  brand,
  action,
  children,
  overlay,
}: {
  compact?: boolean;
  title: string;
  brand: string;
  action?: ReactNode;
  children: ReactNode;
  overlay?: ReactNode;
}) {
  return (
    <div
      data-overlay-page
      data-overlay-compact={compact ? "" : undefined}
      className={cn(
        "relative isolate flex min-w-0 flex-col overflow-hidden overflow-x-hidden border border-border bg-surface",
        compact
          ? "min-h-[20rem] rounded-2xl shadow-card"
          : "h-[28rem] w-full rounded-2xl shadow-card sm:h-[32rem]",
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
              O
            </span>
            <p className="truncate text-[13px] font-semibold tracking-tight">{brand}</p>
            <span className="hidden truncate text-[12px] text-fg-subtle sm:inline">{title}</span>
          </div>
          {action}
        </div>
      )}
      <div className="relative min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">{children}</div>
      {overlay}
    </div>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "outline" | "ghost";
};

export function Btn({ tone = "primary", className, type = "button", ...props }: BtnProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-9 shrink-0 items-center justify-center rounded-lg px-3 text-[13px] font-medium outline-none",
        tone === "primary" && "bg-fg text-surface",
        tone === "outline" && "border border-border-strong bg-surface text-fg hover:bg-surface-2",
        tone === "ghost" && "h-8 px-2 text-fg-muted hover:bg-surface-2 hover:text-fg",
        className,
      )}
      {...props}
    />
  );
}

export const fieldClass =
  "min-h-11 w-full min-w-0 rounded-lg border border-border-strong bg-surface px-3 text-[14px] outline-none placeholder:text-fg-subtle";
