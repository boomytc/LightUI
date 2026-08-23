import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/utils";

export function Window({
  title,
  action,
  children,
  bodyClassName,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
}) {
  return (
    <div className="chrome-window overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-border px-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex gap-1" aria-hidden="true">
            <i className="size-2 rounded-full bg-[#ff5f57]" />
            <i className="size-2 rounded-full bg-[#febc2e]" />
            <i className="size-2 rounded-full bg-[#28c840]" />
          </span>
          <p className="min-w-0 truncate text-[12px] text-fg-subtle">{title}</p>
        </div>
        {action}
      </div>
      <div className={cn("chrome-window-body", bodyClassName)}>{children}</div>
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
        "inline-flex h-8 shrink-0 items-center justify-center rounded-lg px-2.5 text-[12px] font-medium outline-none",
        tone === "primary" && "bg-fg text-surface disabled:opacity-40",
        tone === "outline" && "border border-border-strong bg-surface text-fg hover:bg-surface-2",
        tone === "ghost" && "h-7 px-1.5 text-fg-muted hover:bg-surface-2 hover:text-fg",
        className,
      )}
      {...props}
    />
  );
}
