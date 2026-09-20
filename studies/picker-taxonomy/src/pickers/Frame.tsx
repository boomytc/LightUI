import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export function Phone({
  title,
  onBack,
  footer,
  children,
}: {
  title: string;
  onBack?: () => void;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="picker-phone">
      <header className="relative flex h-12 shrink-0 items-center border-b border-border px-2">
        {onBack ? (
          <button
            type="button"
            aria-label="Back"
            onClick={onBack}
            className="grid size-10 place-items-center rounded-full text-fg"
          >
            <ChevronLeft />
          </button>
        ) : (
          <span className="size-10" />
        )}
        <h2 className="pointer-events-none absolute inset-x-12 truncate text-center text-[14px] font-medium tracking-tight">
          {title}
        </h2>
      </header>
      <div className="picker-body">{children}</div>
      {footer ? <div className="shrink-0 px-5 pt-3 pb-5">{footer}</div> : null}
    </div>
  );
}

export function PhoneButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-11 w-full items-center justify-center rounded-xl text-[13px] font-medium",
        "bg-accent text-accent-fg transition-transform duration-150 ease-out",
        "active:not-disabled:scale-[0.98]",
        "disabled:bg-surface-2 disabled:text-fg-subtle disabled:active:scale-100",
      )}
    >
      {children}
    </button>
  );
}

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
      <path
        d="M15 5 8 12l7 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
