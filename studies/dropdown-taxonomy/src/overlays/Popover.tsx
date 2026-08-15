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
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const next: CSSProperties = {
        position: "fixed",
        top: rect.bottom + 6,
        zIndex: 50,
        minWidth: matchWidth ? rect.width : 12 * 16,
      };
      if (matchWidth) next.width = rect.width;
      if (align === "end") {
        next.right = window.innerWidth - rect.right;
      } else {
        next.left = rect.left;
      }
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
