import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

export function Frame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="border-b border-border px-4 py-2.5">
        <p className="truncate text-[12px] text-fg-subtle">{title}</p>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
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

type TriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & { open?: boolean };

export const TriggerButton = forwardRef<HTMLButtonElement, TriggerProps>(function TriggerButton(
  { open, children, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-expanded={open}
      className={
        className ??
        (open
          ? "flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-accent bg-surface px-3 py-1.5 text-left text-[14px] outline-none"
          : "flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-border-strong bg-surface px-3 py-1.5 text-left text-[14px] outline-none transition-colors hover:border-accent")
      }
      {...props}
    >
      {children}
    </button>
  );
});

export const fieldClass =
  "min-h-11 w-full rounded-lg border border-border-strong bg-surface px-3 text-[14px] outline-none placeholder:text-fg-subtle";
