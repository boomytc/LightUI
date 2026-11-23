import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
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
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [scrollTop, setScrollTop] = useState(0);
  const isInternalScroll = useRef(false);
  const rafRef = useRef(0);
  const settleTimerRef = useRef<number | null>(null);
  const programmaticTargetRef = useRef<number | null>(null);
  const programmaticTimerRef = useRef<number | null>(null);
  const reduceMotion = useRef(false);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  valueRef.current = value;
  onChangeRef.current = onChange;

  function emitFrame(top: number) {
    const { index } = resolveScrollIndex(top, itemHeight, items.length);
    onVisualFrame?.({
      fraction: itemHeight > 0 ? top / itemHeight : 0,
      index,
      scrollTop: top,
    });
  }

  function clearProgrammaticLock() {
    programmaticTargetRef.current = null;
    if (programmaticTimerRef.current !== null) {
      window.clearTimeout(programmaticTimerRef.current);
      programmaticTimerRef.current = null;
    }
  }

  function settle() {
    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
    const target = containerRef.current;
    if (!target) return;
    clearProgrammaticLock();
    const { index, snapScrollTop } = resolveScrollIndex(target.scrollTop, itemHeight, items.length);
    const nextVal = items[index];
    if (nextVal !== undefined && nextVal !== valueRef.current) {
      isInternalScroll.current = true;
      onChangeRef.current(nextVal);
    }
    if (Math.abs(target.scrollTop - snapScrollTop) < 0.5) return;
    isInternalScroll.current = true;
    target.scrollTo({
      top: snapScrollTop,
      behavior: reduceMotion.current ? "auto" : "smooth",
    });
  }

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      reduceMotion.current = mq.matches;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
      if (programmaticTimerRef.current !== null) {
        window.clearTimeout(programmaticTimerRef.current);
        programmaticTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || isInternalScroll.current) {
      isInternalScroll.current = false;
      return;
    }
    clearProgrammaticLock();
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
    const onScrollEnd = () => settle();
    column.addEventListener("scrollend", onScrollEnd);
    return () => column.removeEventListener("scrollend", onScrollEnd);
  }, [itemHeight, items]);

  function selectIndex(idx: number, focusOption = false) {
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    const val = items[clamped];
    if (val === undefined) return;
    const targetTop = clamped * itemHeight;
    const el = containerRef.current;

    if (focusOption) {
      optionRefs.current[clamped]?.focus({ preventScroll: true });
    }

    isInternalScroll.current = true;
    onChange(val);

    if (!el) return;
    if (reduceMotion.current || Math.abs(el.scrollTop - targetTop) < 0.5) {
      clearProgrammaticLock();
      el.scrollTop = targetTop;
      setScrollTop(targetTop);
      emitFrame(targetTop);
      return;
    }

    clearProgrammaticLock();
    programmaticTargetRef.current = targetTop;
    programmaticTimerRef.current = window.setTimeout(() => {
      programmaticTargetRef.current = null;
      programmaticTimerRef.current = null;
    }, 650);
    el.scrollTo({
      top: targetTop,
      behavior: "smooth",
    });
  }

  function handleKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
    const currentIdx = Math.max(0, items.indexOf(value));
    let nextIdx = -1;
    if (e.key === "ArrowDown") {
      nextIdx = Math.min(items.length - 1, currentIdx + 1);
    } else if (e.key === "ArrowUp") {
      nextIdx = Math.max(0, currentIdx - 1);
    } else if (e.key === "PageDown") {
      nextIdx = Math.min(items.length - 1, currentIdx + 5);
    } else if (e.key === "PageUp") {
      nextIdx = Math.max(0, currentIdx - 5);
    } else if (e.key === "Home") {
      nextIdx = 0;
    } else if (e.key === "End") {
      nextIdx = items.length - 1;
    }
    if (nextIdx === -1) return;
    e.preventDefault();
    selectIndex(nextIdx, true);
  }

  const stageHeight = 200;
  const paddingY = Math.max(0, (stageHeight - itemHeight) / 2);
  const activeIndex = itemHeight > 0 ? scrollTop / itemHeight : 0;
  const selectedIndex = Math.max(0, items.indexOf(value));

  return (
    <div
      ref={containerRef}
      role="listbox"
      aria-label={label}
      onKeyDown={handleKeyDown}
      onPointerDown={clearProgrammaticLock}
      onWheel={clearProgrammaticLock}
      onScroll={(e) => {
        const top = e.currentTarget.scrollTop;
        if (programmaticTargetRef.current !== null) {
          if (Math.abs(top - programmaticTargetRef.current) < 1) {
            clearProgrammaticLock();
          }
        } else {
          const { index } = resolveScrollIndex(top, itemHeight, items.length);
          const nextVal = items[index];
          if (nextVal !== undefined && nextVal !== valueRef.current) {
            isInternalScroll.current = true;
            onChangeRef.current(nextVal);
          }
        }
        if (settleTimerRef.current !== null) {
          window.clearTimeout(settleTimerRef.current);
        }
        settleTimerRef.current = window.setTimeout(settle, 160);
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
            ref={(node) => {
              optionRefs.current[idx] = node;
            }}
            type="button"
            role="option"
            tabIndex={idx === selectedIndex ? 0 : -1}
            aria-selected={emphasized}
            onClick={() => selectIndex(idx)}
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
