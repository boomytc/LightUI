import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export function MacWindow({
  title,
  eyebrow,
  badge,
  children,
  onReset,
  className,
}: {
  title: string;
  eyebrow?: string;
  badge?: ReactNode;
  children: ReactNode;
  onReset?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full min-h-[460px] w-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card",
        className,
      )}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface-2/80 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-2 rounded-full bg-border-strong/80" />
            <span className="size-2 rounded-full bg-border-strong/55" />
            <span className="size-2 rounded-full bg-border-strong/35" />
          </div>
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-[10px] font-mono tracking-wider text-fg-subtle uppercase">
                {eyebrow}
              </p>
            )}
            <p className="truncate text-[13px] font-semibold text-fg">{title}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {badge}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="rounded-md border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              重置
            </button>
          )}
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
