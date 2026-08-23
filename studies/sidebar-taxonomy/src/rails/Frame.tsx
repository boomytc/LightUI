import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export function Frame({
  title,
  dark,
  children,
}: {
  title: string;
  dark?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      data-rail-frame
      className={cn(
        "flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border shadow-card",
        dark ? "bg-fg text-surface" : "bg-surface",
      )}
    >
      <div className={cn("shrink-0 border-b px-4 py-2.5", dark ? "border-white/10" : "border-border")}>
        <p className={cn("truncate text-[12px]", dark ? "text-white/45" : "text-fg-subtle")}>{title}</p>
      </div>
      <div className="flex min-h-[28rem] w-full min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
