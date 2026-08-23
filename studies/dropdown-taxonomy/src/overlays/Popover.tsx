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

const HIDDEN: CSSProperties = {
  position: "fixed",
  visibility: "hidden",
  left: 0,
  top: 0,
  zIndex: 50,
  width: "max-content",
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
  const [style, setStyle] = useState<CSSProperties>(HIDDEN);

  useLayoutEffect(() => {
    if (!open) {
      setStyle(HIDDEN);
      return;
    }
    const panel = panelRef.current;
    if (!panel) return;

    const place = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const pad = 8;
      const avail = Math.max(160, window.innerWidth - pad * 2);
      // Size to the trigger or to content. Never measure an unpositioned
      // block on body — that reads as the viewport and clamps left to 8px.
      panel.style.width = matchWidth ? `${Math.min(rect.width, avail)}px` : "max-content";
      panel.style.maxWidth = `${avail}px`;
      panel.style.minWidth = matchWidth ? `${Math.min(rect.width, avail)}px` : "";
      panel.style.position = "fixed";
      const width = Math.min(panel.getBoundingClientRect().width || 12 * 16, avail);
      let left = align === "end" ? rect.right - width : rect.left;
      if (left + width > window.innerWidth - pad) {
        left = Math.max(pad, window.innerWidth - pad - width);
      }
      if (left < pad) left = pad;
      setStyle({
        position: "fixed",
        zIndex: 50,
        visibility: "visible",
        left,
        // Stay under the field so cascader / calendar have room in the well.
        top: rect.bottom + 6,
        width: matchWidth ? Math.min(rect.width, avail) : "max-content",
        minWidth: matchWidth ? Math.min(rect.width, avail) : undefined,
        maxWidth: avail,
      });
    };

    place();
    const ro = new ResizeObserver(place);
    ro.observe(panel);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
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
