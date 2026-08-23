import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { indicatorTransition, type Box } from "../lib/machines";

type Measure = "label" | "button";

export function useBox(
  listRef: RefObject<HTMLElement | null>,
  selectedId: string,
  measure: Measure,
): { box: Box; transition: ReturnType<typeof indicatorTransition> } {
  const [box, setBox] = useState<Box>({ left: 0, width: 0 });
  const prev = useRef<Box | null>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const read = () => {
      const btn = list.querySelector<HTMLElement>(`[data-tab="${selectedId}"]`);
      const target =
        measure === "label" ? (btn?.querySelector<HTMLElement>("[data-tab-label]") ?? btn) : btn;
      if (!btn || !target) return;
      const l = list.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      const next = { left: t.left - l.left, width: t.width };
      setBox(next);
      window.setTimeout(() => {
        prev.current = next;
      }, 0);
    };

    read();
    const onResize = () => read();
    window.addEventListener("resize", onResize);
    void document.fonts?.ready.then(read);
    return () => window.removeEventListener("resize", onResize);
  }, [listRef, selectedId, measure]);

  return { box, transition: indicatorTransition(prev.current) };
}
