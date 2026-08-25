import type { ReactNode } from "react";
import { pick, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";

export function HeightSlot({
  open,
  children,
  className,
}: {
  open: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("expand-slot", className)} data-open={open ? "" : undefined}>
      <div className="expand-slot-inner">{children}</div>
    </div>
  );
}

export function DemoShell({
  compact = false,
  title,
  brand,
  action,
  children,
}: {
  compact?: boolean;
  title: string;
  brand: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      data-expand-page
      data-expand-compact={compact ? "" : undefined}
      className={cn(
        "relative isolate flex min-w-0 flex-col overflow-x-hidden border border-border bg-surface shadow-card",
        compact ? "rounded-2xl" : "w-full rounded-2xl",
      )}
    >
      {compact ? (
        <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-border px-4">
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
      ) : (
        <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border px-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-6 shrink-0 place-items-center rounded-md bg-fg text-[10px] font-semibold text-surface">
              E
            </span>
            <p className="truncate text-[13px] font-semibold tracking-tight">{brand}</p>
            <span className="hidden truncate text-[12px] text-fg-subtle sm:inline">{title}</span>
          </div>
          {action}
        </div>
      )}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function RestOfPage({ locale }: { locale: Locale }) {
  return (
    <div className="border-t border-border bg-surface-2 px-4 py-3 sm:px-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-fg-subtle">
        {locale === "en" ? "Rest of the page" : "文档流后面"}
      </p>
      <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
        {pick(
          {
            zh: "这一块在多出来的内容后面。撑开文档流，它会往下让。若盖一层，它原地不动、被挡住。",
            en: "This block sits after the extra content. In flow, it moves down. A cover would hide it in place.",
          },
          locale,
        )}
      </p>
    </div>
  );
}
