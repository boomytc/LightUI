import { useLayoutEffect, useState, type RefObject } from "react";
import { indicatorTransition, textIndicator, type Box } from "../lib/machines";
type Measure = "label" | "button";
export function useBox(
  listRef: RefObject<HTMLElement | null>,
  selectedId: string,
  measure: Measure,
): { box: Box; transition: ReturnType<typeof indicatorTransition> } {
  const [measured, setMeasured] = useState<{
    box: Box;
    transition: ReturnType<typeof indicatorTransition>;
  }>({ box: { left: 0, width: 0 }, transition: "none" });
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const btn = list.querySelector<HTMLElement>(`[data-tab="${selectedId}"]`);
    const target =
      measure === "label"
        ? (btn?.querySelector<HTMLElement>("[data-tab-label]") ?? btn)
        : btn;
    if (!target) return;
    let active = true;
    const read = () => {
      if (!active) return;
      const l = list.getBoundingClientRect(),
        t = target.getBoundingClientRect();
      const next = textIndicator(
        l.left + list.clientLeft,
        t.left,
        t.width,
        list.scrollLeft,
      );
      setMeasured((cur) =>
        cur.box.left === next.left && cur.box.width === next.width
          ? cur
          : { box: next, transition: indicatorTransition(cur.box) },
      );
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(list);
    ro.observe(target);
    list.addEventListener("scroll", read);
    void document.fonts?.ready.then(read);
    return () => {
      active = false;
      ro.disconnect();
      list.removeEventListener("scroll", read);
    };
  }, [listRef, selectedId, measure]);
  return measured;
}
