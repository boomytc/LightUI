import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  matchWidth?: boolean;
  align?: "start" | "end";
  className?: string;
};

export function Popover({
  open,
  onClose,
  triggerRef,
  children,
  matchWidth = true,
  align = "start",
  className,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const trigger = triggerRef.current;
      const panel = panelRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const pad = 8;
      const avail = Math.max(160, window.innerWidth - pad * 2);
      const minW = matchWidth ? rect.width : 12 * 16;
      const next: CSSProperties = {
        position: "fixed",
        zIndex: 50,
        minWidth: Math.min(minW, avail),
        maxWidth: avail,
      };
      if (matchWidth) next.width = Math.min(rect.width, avail);
      const width = matchWidth
        ? Math.min(rect.width, avail)
        : Math.min(panel?.offsetWidth || minW, avail);
      let left =
        align === "end" ? rect.right - width : rect.left;
      if (left + width > window.innerWidth - pad) {
        left = Math.max(pad, window.innerWidth - pad - width);
      }
      if (left < pad) left = pad;
      next.left = left;
      const height = panel?.offsetHeight || 0;
      let top = rect.bottom + 6;
      if (height && top + height > window.innerHeight - pad) {
        const above = rect.top - 6 - height;
        if (above >= pad) top = above;
      }
      next.top = top;
      setStyle(next);
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [align, matchWidth, open, triggerRef]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, open, triggerRef]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={panelRef}
      data-stage="popover"
      style={style}
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-surface shadow-menu",
        className,
      )}
    >
      {children}
    </div>,
    document.body,
  );
}
