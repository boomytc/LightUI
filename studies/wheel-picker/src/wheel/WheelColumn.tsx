import { useEffect, useRef, useState } from "react";
import {
  calcCylinderVisual,
  calcItemOffset,
  pad2,
  resolveScrollIndex,
} from "../lib/machines";
import { cylinderAppearance, type WheelVisualFrame } from "./appearance";

export function WheelColumn({
  items,
  value,
  onChange,
  itemHeight,
  enableDepth,
  label,
  onVisualFrame,
}: {
  items: number[];
  value: number;
  onChange: (next: number) => void;
  itemHeight: number;
  enableDepth: boolean;
  label: string;
  onVisualFrame?: (frame: WheelVisualFrame) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const isInternalScroll = useRef(false);
  const rafRef = useRef(0);
  const reduceMotion = useRef(false);

  function emitFrame(top: number) {
    const { index } = resolveScrollIndex(top, itemHeight, items.length);
    onVisualFrame?.({
      fraction: itemHeight > 0 ? top / itemHeight : 0,
      index,
      scrollTop: top,
    });
  }

  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || isInternalScroll.current) {
      isInternalScroll.current = false;
      return;
    }
    const idx = items.indexOf(value);
    if (idx !== -1) {
      const top = idx * itemHeight;
      el.scrollTop = top;
      setScrollTop(top);
      emitFrame(top);
    }
  }, [value, items, itemHeight]);

  useEffect(() => {
    const column = containerRef.current;
    if (!column) return;
    function settle() {
      const target = containerRef.current;
      if (!target) return;
      const { snapScrollTop } = resolveScrollIndex(target.scrollTop, itemHeight, items.length);
      if (Math.abs(target.scrollTop - snapScrollTop) < 0.5) return;
      isInternalScroll.current = true;
      target.scrollTo({
        top: snapScrollTop,
        behavior: reduceMotion.current ? "auto" : "smooth",
      });
    }
    column.addEventListener("scrollend", settle);
    return () => column.removeEventListener("scrollend", settle);
  }, [itemHeight, items.length]);

  function handleClickItem(val: number) {
    const idx = items.indexOf(val);
    if (idx === -1) return;
    isInternalScroll.current = true;
    onChange(val);
    containerRef.current?.scrollTo({
      top: idx * itemHeight,
      behavior: reduceMotion.current ? "auto" : "smooth",
    });
  }

  const stageHeight = 200;
  const paddingY = Math.max(0, (stageHeight - itemHeight) / 2);
  const activeIndex = itemHeight > 0 ? scrollTop / itemHeight : 0;

  return (
    <div
      ref={containerRef}
      role="listbox"
      aria-label={label}
      onScroll={(e) => {
        const top = e.currentTarget.scrollTop;
        const { index } = resolveScrollIndex(top, itemHeight, items.length);
        const nextVal = items[index];
        if (nextVal !== undefined && nextVal !== value) {
          isInternalScroll.current = true;
          onChange(nextVal);
        }
        if (rafRef.current) return;
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = 0;
          const latest = containerRef.current?.scrollTop ?? top;
          setScrollTop(latest);
          emitFrame(latest);
        });
      }}
      className="wheel-column"
      style={{
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`,
      }}
    >
      {items.map((n, idx) => {
        const offset = calcItemOffset(idx, activeIndex);
        const visual = calcCylinderVisual(offset);
        const emphasized = n === value;

        return (
          <button
            key={n}
            type="button"
            role="option"
            aria-selected={emphasized}
            onClick={() => handleClickItem(n)}
            className="wheel-glyph"
            style={cylinderAppearance(visual, enableDepth, emphasized)}
          >
            {pad2(n)}
          </button>
        );
      })}
    </div>
  );
}
