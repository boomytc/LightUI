import type { ReactNode } from "react";
import type { KindId } from "../lib/kinds";
import { cn } from "../lib/utils";

export function Window({
  title,
  chip,
  nav,
  children,
}: {
  title: string;
  chip?: ReactNode;
  nav?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="timer-window overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex gap-1" aria-hidden="true">
            <i className="size-2 rounded-full bg-[#ff5f57]" />
            <i className="size-2 rounded-full bg-[#febc2e]" />
            <i className="size-2 rounded-full bg-[#28c840]" />
          </span>
          <p className="truncate text-[12px] text-fg-subtle">{title}</p>
        </div>
        {chip}
      </div>
      {nav}
      <div className="timer-window-body">{children}</div>
    </div>
  );
}

export function Well({ children }: { children: ReactNode }) {
  return (
    <div
      data-layout="desk"
      className="timer-well overflow-hidden rounded-2xl border border-border bg-surface shadow-card"
    >
      {children}
    </div>
  );
}

export function TimeChip({
  label,
  running,
  onClick,
}: {
  label: string;
  running: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-7 max-w-[9.5rem] shrink-0 items-center gap-1.5 rounded-full bg-accent-soft px-2.5 text-[11px] font-medium text-accent tabular-nums"
    >
      <span
        className="timer-chip-dot size-1.5 shrink-0 rounded-full bg-accent"
        data-running={running ? "true" : undefined}
        aria-hidden="true"
      />
      <span className="truncate">{label}</span>
    </button>
  );
}

export function KindPair({
  value,
  labels,
  onPick,
}: {
  value: KindId;
  labels: { stopwatch: string; focus: string };
  onPick?: (id: KindId) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label={labels.stopwatch + " / " + labels.focus}
      className="flex rounded-full bg-surface-2 p-0.5"
    >
      {(["stopwatch", "focus"] as const).map((id) => {
        const on = value === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            data-kind={id}
            aria-selected={on}
            onClick={() => onPick?.(id)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[13px] font-medium",
              on ? "bg-fg text-surface" : "text-fg-muted hover:text-fg",
            )}
          >
            {labels[id]}
          </button>
        );
      })}
    </div>
  );
}

export function InnerNav({
  page,
  labels,
  onPick,
  compact = false,
}: {
  page: "timer" | "plan";
  labels: { timer: string; plan: string };
  onPick?: (page: "timer" | "plan") => void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex shrink-0 rounded-full bg-surface-2 p-0.5">
        {(["timer", "plan"] as const).map((id) => {
          const on = page === id;
          return (
            <button
              key={id}
              type="button"
              data-page={id}
              onClick={() => onPick?.(id)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[12px] font-medium",
                on ? "bg-surface text-fg shadow-card" : "text-fg-muted hover:text-fg",
              )}
            >
              {labels[id]}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex gap-1 border-b border-border px-3 py-2">
      {(["timer", "plan"] as const).map((id) => {
        const on = page === id;
        return (
          <button
            key={id}
            type="button"
            data-page={id}
            onClick={() => onPick?.(id)}
            className={cn(
              "min-w-0 flex-1 rounded-full px-2 py-1 text-[12px] font-medium",
              on ? "bg-fg text-surface" : "text-fg-muted hover:bg-surface-2",
            )}
          >
            {labels[id]}
          </button>
        );
      })}
    </div>
  );
}
