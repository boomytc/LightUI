import type { ButtonHTMLAttributes, ReactNode } from "react";
import { badgeLabel, hideBadge } from "../lib/machines";
import { cn } from "../lib/utils";

export function Frame({
  title,
  nav,
  bar,
  children,
}: {
  title: string;
  nav?: ReactNode;
  bar?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      data-frame
      className="relative flex w-full min-w-0 flex-col overflow-x-hidden overflow-hidden rounded-2xl border border-border bg-surface shadow-card"
    >
      <div className="flex h-10 shrink-0 items-center gap-3 border-b border-border px-3">
        <span className="flex gap-1" aria-hidden="true">
          <i className="size-2 rounded-full bg-[#ff5f57]" />
          <i className="size-2 rounded-full bg-[#febc2e]" />
          <i className="size-2 rounded-full bg-[#28c840]" />
        </span>
        <p className="min-w-0 flex-1 truncate text-center text-[12px] text-fg-subtle">{title}</p>
        <span className="w-8" aria-hidden="true" />
      </div>
      {nav}
      {bar}
      <div className="relative min-h-[320px] min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function CountBadge({ count }: { count: number }) {
  if (hideBadge(count)) return null;
  return (
    <span className="absolute -top-1.5 -right-1.5 z-10 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-none text-accent-fg tabular-nums">
      {badgeLabel(count)}
    </span>
  );
}

export function IconBtn({
  label,
  count,
  active,
  onClick,
  children,
}: {
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "relative grid size-8 shrink-0 place-items-center rounded-md text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg",
        active && "bg-surface-2 text-fg",
      )}
    >
      {children}
      {typeof count === "number" ? <CountBadge count={count} /> : null}
    </button>
  );
}

export function Action({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 items-center rounded-lg bg-fg px-3 text-[12px] font-medium text-surface disabled:opacity-40",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Ghost({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 items-center rounded-lg px-2.5 text-[12px] text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="min-w-0 rounded-lg bg-surface-2 px-2.5 py-2.5">
      <div className="truncate text-[11px] text-fg-muted">{label}</div>
      <div className="mt-0.5 truncate text-[16px] font-semibold tracking-tight tabular-nums">{value}</div>
      <div className="mt-0.5 truncate text-[11px] text-fg-subtle">{hint}</div>
    </div>
  );
}

export function AppNav({
  brand,
  children,
}: {
  brand: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative z-20 flex h-11 shrink-0 items-center justify-between gap-2 px-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="grid size-6 shrink-0 place-items-center rounded-md bg-accent text-[11px] font-semibold text-accent-fg">
          O
        </span>
        <span className="truncate text-[13px] font-medium">{brand}</span>
      </div>
      <div className="flex min-w-0 shrink-0 items-center gap-0.5">{children}</div>
    </div>
  );
}

export function AvatarMark({ mark }: { mark: string }) {
  return (
    <span className="ml-1 grid size-7 shrink-0 place-items-center rounded-full bg-accent text-[11px] font-medium text-accent-fg">
      {mark}
    </span>
  );
}

export function Field({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block min-w-0" htmlFor={id}>
      <span className="text-[11px] text-fg-muted">{label}</span>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-9 w-full min-w-0 rounded-lg border border-transparent bg-surface-2 px-3 text-[13px] text-fg outline-none focus:border-border-strong"
      />
    </label>
  );
}
