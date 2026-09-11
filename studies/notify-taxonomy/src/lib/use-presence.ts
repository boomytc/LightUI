import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./use-reduced-motion";

/** Keep a node mounted through its leave animation. Does not change dismiss timing. */
export function usePresence(show: boolean, leaveMs = 280) {
  const reduced = useReducedMotion();
  const ms = reduced ? 0 : leaveMs;
  const [mounted, setMounted] = useState(show);
  const [leaving, setLeaving] = useState(false);
  const wasShown = useRef(show);

  useEffect(() => {
    if (show) {
      wasShown.current = true;
      setMounted(true);
      setLeaving(false);
      return;
    }
    if (!wasShown.current) return;
    if (ms <= 0) {
      wasShown.current = false;
      setMounted(false);
      setLeaving(false);
      return;
    }
    setLeaving(true);
    const id = window.setTimeout(() => {
      wasShown.current = false;
      setMounted(false);
      setLeaving(false);
    }, ms);
    return () => window.clearTimeout(id);
  }, [show, ms]);

  return { mounted, leaving };
}
