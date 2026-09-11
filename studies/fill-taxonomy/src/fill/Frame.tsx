import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export function Window({
  title,
  kicker,
  action,
  children,
}: {
  title: string;
  kicker?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex gap-1" aria-hidden="true">
            <i className="size-2 rounded-full bg-[#ff5f57]" />
            <i className="size-2 rounded-full bg-[#febc2e]" />
            <i className="size-2 rounded-full bg-[#28c840]" />
          </span>
          <div className="min-w-0">
            {kicker ? (
              <p className="text-[10px] font-medium tracking-[0.12em] text-accent uppercase">
                {kicker}
              </p>
            ) : null}
            <p className="truncate text-[12px] text-fg-subtle">{title}</p>
          </div>
        </div>
        {action}
      </div>
      <div className="min-w-0 overflow-x-hidden p-5">{children}</div>
    </div>
  );
}

export function DemoCard({
  caption,
  badge,
  tone,
  children,
}: {
  caption: string;
  badge?: string;
  tone?: "wrong" | "intent";
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "fill-enter min-w-0 rounded-xl border p-4",
        tone === "wrong" &&
          "border-wrong/20 bg-[color-mix(in_oklab,var(--color-wrong-soft)_62%,var(--color-surface))]",
        tone === "intent" &&
          "border-intent/20 bg-[color-mix(in_oklab,var(--color-intent-soft)_55%,var(--color-surface))]",
        !tone && "border-border bg-surface-2",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="text-[11px] leading-snug text-fg-subtle">{caption}</p>
        {badge && tone ? (
          <span
            className={cn(
              "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
              tone === "wrong" ? "bg-wrong-soft text-wrong" : "bg-intent-soft text-intent",
            )}
          >
            {badge}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function GhostButton({
  on,
  locked,
  onClick,
  children,
}: {
  on: boolean;
  locked?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={locked}
      onClick={() => {
        if (locked) return;
        onClick();
      }}
      className={cn(
        "mt-4 inline-flex h-9 items-center rounded-full px-3.5 text-[13px] font-medium transition-colors",
        on ? "border border-border bg-surface text-fg" : "bg-fg text-surface",
        locked && "cursor-not-allowed opacity-60",
      )}
    >
      {children}
    </button>
  );
}
