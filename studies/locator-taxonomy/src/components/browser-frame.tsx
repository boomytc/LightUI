import type { ReactNode } from "react";

export function BrowserFrame({
  title,
  eyebrow,
  badge,
  children,
  onReset,
}: {
  title: string;
  eyebrow?: string;
  badge?: ReactNode;
  children: ReactNode;
  onReset?: () => void;
}) {
  return (
    <div className="flex h-full min-h-[480px] w-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface-2/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-border-strong" />
            <span className="size-2.5 rounded-full bg-border-strong" />
            <span className="size-2.5 rounded-full bg-border-strong" />
          </div>
          <div>
            {eyebrow && (
              <p className="text-[10px] font-mono tracking-wider text-fg-subtle uppercase">
                {eyebrow}
              </p>
            )}
            <p className="text-xs font-semibold text-fg">{title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {badge}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="rounded-md border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-fg-muted hover:bg-surface-2 hover:text-fg transition-colors"
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
