import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export function Window({
  title,
  children,
  dark = false,
}: {
  title: string;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className={cn(
        "hero-window @container w-full min-w-0 overflow-hidden rounded-2xl border shadow-card",
        dark ? "border-white/10 bg-[#161418] text-white" : "border-border bg-surface",
      )}
    >
      <div
        className={cn(
          "flex h-10 shrink-0 items-center gap-2 border-b px-3",
          dark ? "border-white/8" : "border-border",
        )}
      >
        <span className="flex gap-1" aria-hidden="true">
          <i className="size-2 rounded-full bg-[#ff5f57]" />
          <i className="size-2 rounded-full bg-[#febc2e]" />
          <i className="size-2 rounded-full bg-[#28c840]" />
        </span>
        <p className={cn("min-w-0 flex-1 truncate text-center text-[12px]", dark ? "text-white/45" : "text-fg-subtle")}>
          {title}
        </p>
      </div>
      <div className="hero-window-body">{children}</div>
    </div>
  );
}
