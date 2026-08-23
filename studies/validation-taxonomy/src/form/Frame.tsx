import type { ReactNode } from "react";

export function Window({
  title,
  action,
  children,
}: {
  title: string;
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
          <p className="truncate text-[12px] text-fg-subtle">{title}</p>
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
  children,
}: {
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-2 flex items-center gap-1 text-[13px] text-fg-muted">
      {children}
      {required ? (
        <span className="text-fg" aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  );
}

export const fieldClass =
  "min-h-11 w-full min-w-0 rounded-lg border border-border-strong bg-surface px-3 text-[14px] outline-none placeholder:text-fg-subtle";
