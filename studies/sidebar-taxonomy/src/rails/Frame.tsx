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
      className={cn(
        "min-w-0 overflow-hidden rounded-2xl border border-border shadow-card",
        dark ? "bg-fg text-surface" : "bg-surface",
      )}
    >
      <div className={cn("border-b px-4 py-2.5", dark ? "border-white/10" : "border-border")}>
        <p className={cn("truncate text-[12px]", dark ? "text-white/45" : "text-fg-subtle")}>{title}</p>
      </div>
      <div className="min-h-[22rem]">{children}</div>
    </div>
  );
}
