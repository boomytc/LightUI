import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { passedThreshold } from "../lib/machines";
import type { Point } from "./reverse-path";

export type DragLive = {
  id: string;
  pointerId: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  grabX: number;
  grabY: number;
  width: number;
  height: number;
  originLeft: number;
  originTop: number;
  path: Point[];
};

export function ghostStyle(
  live: Pick<DragLive, "x" | "y" | "grabX" | "grabY" | "width" | "height">,
): CSSProperties {
  return {
    position: "fixed",
    left: live.x - live.grabX,
    top: live.y - live.grabY,
    width: live.width,
    height: live.height,
    pointerEvents: "none",
    zIndex: 40,
  };
}

export function usePointerDrag(options: {
  disabled?: boolean;
  onLift?: (live: DragLive) => void;
  onMove?: (live: DragLive) => void;
  onDrop: (live: DragLive) => void;
  onCancel?: (live: DragLive) => void;
}) {
  const [live, setLive] = useState<DragLive | null>(null);
  const liveRef = useRef<DragLive | null>(null);
  const pendingRef = useRef<DragLive | null>(null);
  const liftedRef = useRef(false);
  const targetRef = useRef<HTMLElement | null>(null);
  const optsRef = useRef(options);
  const clearListeners = useRef<(() => void) | null>(null);
  optsRef.current = options;

  const finish = useCallback((kind: "drop" | "cancel") => {
    const session = liveRef.current ?? pendingRef.current;
    const target = targetRef.current;
    const pointerId = session?.pointerId;
    if (target && pointerId != null) {
      try {
        if (target.hasPointerCapture(pointerId)) target.releasePointerCapture(pointerId);
      } catch {
        /* already released */
      }
    }
    clearListeners.current?.();
    clearListeners.current = null;
    targetRef.current = null;
    pendingRef.current = null;
    const wasLive = liftedRef.current;
    liftedRef.current = false;
    liveRef.current = null;
    setLive(null);
    if (!session || !wasLive) return;
    if (kind === "drop") optsRef.current.onDrop(session);
    else optsRef.current.onCancel?.(session);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (!pendingRef.current && !liveRef.current) return;
      e.preventDefault();
      finish("cancel");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finish]);

  useEffect(() => () => finish("cancel"), [finish]);

  const bind = useCallback(
    (id: string) => ({
      onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
        if (optsRef.current.disabled) return;
        if (e.button !== 0) return;
        e.preventDefault();
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const session: DragLive = {
          id,
          pointerId: e.pointerId,
          startX: e.clientX,
          startY: e.clientY,
          x: e.clientX,
          y: e.clientY,
          grabX: e.clientX - rect.left,
          grabY: e.clientY - rect.top,
          width: rect.width,
          height: rect.height,
          originLeft: rect.left,
          originTop: rect.top,
          path: [{ x: e.clientX, y: e.clientY }],
        };
        pendingRef.current = session;
        liftedRef.current = false;
        targetRef.current = el;
        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          /* not a pointer */
        }

        const onMove = (ev: PointerEvent) => {
          if (ev.pointerId !== session.pointerId) return;
          session.x = ev.clientX;
          session.y = ev.clientY;
          const last = session.path[session.path.length - 1];
          if (!last || Math.hypot(ev.clientX - last.x, ev.clientY - last.y) >= 4) {
            session.path.push({ x: ev.clientX, y: ev.clientY });
            if (session.path.length > 80) session.path.splice(0, session.path.length - 80);
          }
          const snapshot = { ...session, path: session.path.slice() };
          if (!liftedRef.current) {
            if (!passedThreshold(ev.clientX - session.startX, ev.clientY - session.startY)) return;
            liftedRef.current = true;
            liveRef.current = snapshot;
            pendingRef.current = snapshot;
            setLive(snapshot);
            optsRef.current.onLift?.(snapshot);
            return;
          }
          liveRef.current = snapshot;
          pendingRef.current = snapshot;
          setLive(snapshot);
          optsRef.current.onMove?.(snapshot);
        };

        const onUp = (ev: PointerEvent) => {
          if (ev.pointerId !== session.pointerId) return;
          session.x = ev.clientX;
          session.y = ev.clientY;
          const snapshot = { ...session, path: session.path.slice() };
          liveRef.current = snapshot;
          pendingRef.current = snapshot;
          finish("drop");
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
        clearListeners.current = () => {
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
          window.removeEventListener("pointercancel", onUp);
        };
      },
    }),
    [finish],
  );

  return { live, bind };
}
