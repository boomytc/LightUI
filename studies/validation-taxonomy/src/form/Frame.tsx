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

export function FieldLabel({
  htmlFor,
  required,
  extra,
  children,
}: {
  htmlFor?: string;
  required?: boolean;
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <label htmlFor={htmlFor} className="flex items-center gap-1 text-[13px] font-medium text-fg">
        {children}
        {required ? (
          <span className="text-wrong" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {extra}
    </div>
  );
}

export const fieldClass =
  "form-control min-h-11 w-full min-w-0 rounded-lg border bg-surface px-3 text-[14px] outline-none placeholder:text-fg-subtle";

export function fieldTone(invalid: boolean, open?: boolean) {
  return cn(
    fieldClass,
    invalid
      ? "border-wrong bg-wrong-soft focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-wrong)_28%,transparent)]"
      : open
        ? "border-accent shadow-[0_0_0_3px_var(--color-ring)]"
        : "border-border-strong focus:border-accent focus:shadow-[0_0_0_3px_var(--color-ring)]",
  );
}
