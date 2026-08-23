import type { ButtonHTMLAttributes, ReactNode } from "react";
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
    <div className="relative isolate min-w-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
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
      <div className="relative min-h-[20rem] min-w-0">{children}</div>
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
