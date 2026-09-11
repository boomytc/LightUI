import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { useLocatorSignal } from "../lib/feedback";
import { useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";

export function BrowserFrame({
  title,
  eyebrow,
  badge,
  children,
  onReset,
  showSignal = false,
}: {
  title: string;
  eyebrow?: string;
  badge?: ReactNode;
  children: ReactNode;
  onReset?: () => void;
  showSignal?: boolean;
}) {
  const locale = useLocale();
  const { signal } = useLocatorSignal();

  return (
    <div className="flex h-[min(38rem,72dvh)] min-h-[28rem] w-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-surface-2/80 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-border-strong" />
            <span className="size-2.5 rounded-full bg-border-strong" />
            <span className="size-2.5 rounded-full bg-border-strong" />
          </div>
          <div className="min-w-0">
            {eyebrow && (
              <p className="font-mono text-[10px] tracking-[0.14em] text-fg-subtle uppercase">
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
              className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-[11px] font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <RotateCcw className="size-3" strokeWidth={2.4} />
              {locale === "en" ? "Reset" : "重置"}
            </button>
          )}
        </div>
      </div>

      {showSignal && (
        <div
          role="status"
          aria-live="polite"
          className="flex shrink-0 items-center gap-3 border-b border-border bg-play-glow/80 px-4 py-2"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
              {signal?.metric ?? (locale === "en" ? "Location" : "位置反馈")}
            </p>
            <p className="truncate text-[12px] font-medium text-fg">
              {signal?.value ?? "—"}
              {signal?.hint ? (
                <span className="ml-2 font-normal text-fg-muted">
                  <span aria-hidden="true" className="mr-1.5 text-fg-subtle">
                    ·
                  </span>
                  {signal.hint}
                </span>
              ) : null}
            </p>
          </div>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-2 sm:w-32">
            <div
              className={cn(
                "h-full rounded-full bg-accent",
                "transition-[width] duration-150 ease-out",
              )}
              style={{
                width: `${Math.round(Math.min(1, Math.max(0, signal?.ratio ?? 0)) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="relative min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
