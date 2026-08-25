import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "../lib/utils";
import "./overlay.css";
import { usePresence } from "./use-presence";

function useEsc(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, onClose]);
}

function useFocusTrap(active: boolean, ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!active || !ref.current) return;
    const root = ref.current;
    const prev = document.activeElement as HTMLElement | null;
    const nodes = root.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    nodes[0]?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || nodes.length === 0) return;
      const list = Array.from(nodes).filter((n) => !n.hasAttribute("disabled"));
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    root.addEventListener("keydown", onKey);
    return () => {
      root.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [active, ref]);
}

function Scrim({
  closing,
  tone,
  onClick,
}: {
  closing: boolean;
  tone: "strong" | "light";
  onClick?: () => void;
}) {
  const className = cn(
    "absolute inset-0 z-40",
    tone === "strong" ? "bg-fg/40" : "bg-fg/20",
    closing ? "overlay-scrim-out" : "overlay-scrim-in",
  );
  if (onClick) {
    return (
      <button
        type="button"
        aria-label="关闭遮罩"
        className={cn(className, "cursor-default")}
        onClick={onClick}
      />
    );
  }
  return <div className={className} aria-hidden="true" />;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  dismissOnScrim = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  dismissOnScrim?: boolean;
}) {
  const { mounted, closing } = usePresence(open, 150);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  useEsc(open, onClose);
  useFocusTrap(open && mounted && !closing, panelRef);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-50">
      <Scrim closing={closing} tone="strong" onClick={dismissOnScrim ? onClose : undefined} />
      <div className="pointer-events-none absolute inset-0 z-50 grid place-items-center p-4">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descId : undefined}
          className={cn(
            "pointer-events-auto w-[min(20rem,calc(100%-2rem))] rounded-xl border border-border bg-surface p-5 shadow-menu",
            closing ? "overlay-modal-out" : "overlay-modal-in",
          )}
        >
          <h3 id={titleId} className="text-[16px] font-semibold tracking-tight">
            {title}
          </h3>
          {description ? (
            <p id={descId} className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">
              {description}
            </p>
          ) : null}
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { mounted, closing } = usePresence(open, 350);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useEsc(open, onClose);
  useFocusTrap(open && mounted && !closing, panelRef);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-50">
      <Scrim closing={closing} tone="light" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "absolute inset-y-0 right-0 z-50 flex w-[min(22rem,80%)] flex-col overflow-hidden border-l border-border bg-surface shadow-menu",
          closing ? "overlay-drawer-out" : "overlay-drawer-in",
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 px-4 pt-5 pb-3">
          <div className="min-w-0">
            <h3 id={titleId} className="text-[16px] font-semibold tracking-tight">
              {title}
            </h3>
            {description ? <p className="mt-1 text-[13px] text-fg-muted">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-md text-fg-muted hover:bg-surface-2 hover:text-fg"
            aria-label="关闭"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-2">{children}</div>
        {footer ? (
          <div className="flex shrink-0 justify-end gap-2 border-t border-border px-4 py-3">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}

export function PopoverMenu({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const { mounted, closing } = usePresence(open, 150);
  const ref = useRef<HTMLDivElement>(null);
  useEsc(open, onClose);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!ref.current) return;
      if (ref.current.contains(event.target as Node)) return;
      const trigger = (event.target as HTMLElement).closest("[data-popover-trigger]");
      if (trigger) return;
      onClose();
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div
      ref={ref}
      role="menu"
      className={cn(
        "absolute top-full right-0 z-50 mt-1.5 w-44 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-surface py-1.5 shadow-menu",
        closing ? "overlay-pop-out" : "overlay-pop-in",
      )}
    >
      {children}
    </div>
  );
}

export function Tooltip({
  open,
  text,
}: {
  open: boolean;
  text: string;
}) {
  const { mounted, closing } = usePresence(open, 80);
  if (!mounted) return null;
  return (
    <div
      role="tooltip"
      className={cn(
        "pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-[16rem] -translate-x-1/2 rounded-md bg-fg px-2.5 py-1.5 text-[12px] leading-snug text-surface shadow-menu",
        closing ? "overlay-pop-out" : "overlay-pop-in",
      )}
    >
      {text}
      <span
        aria-hidden="true"
        className="absolute top-full left-1/2 -mt-px -translate-x-1/2 border-4 border-transparent border-t-fg"
      />
    </div>
  );
}

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const { mounted, closing } = usePresence(open, 350);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useEsc(open, onClose);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-50">
      <Scrim closing={closing} tone="light" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "absolute inset-x-0 bottom-0 z-50 flex max-h-[70%] flex-col overflow-hidden rounded-t-2xl border-t border-border bg-surface shadow-menu",
          closing ? "overlay-sheet-out" : "overlay-sheet-in",
        )}
      >
        <div className="flex flex-col items-center pt-2">
          <span className="h-1.5 w-10 rounded-full bg-border-strong" aria-hidden="true" />
        </div>
        <div className="flex items-start justify-between gap-3 px-4 pt-3 pb-2">
          <h3 id={titleId} className="text-[16px] font-semibold tracking-tight">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-md text-fg-muted hover:bg-surface-2 hover:text-fg"
            aria-label="关闭"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto px-4 pb-4">{children}</div>
      </div>
    </div>
  );
}

export function MenuItem({
  children,
  onClick,
  tone = "default",
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex h-10 w-full items-center px-3.5 text-left text-[13px]",
        tone === "danger" ? "font-medium text-fg hover:bg-surface-2" : "text-fg hover:bg-surface-2",
      )}
    >
      {children}
    </button>
  );
}
