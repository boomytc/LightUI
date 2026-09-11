import { useEffect, useState, type RefObject } from "react";

export type ScrollSnap = {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
};

const EMPTY: ScrollSnap = { scrollTop: 0, scrollHeight: 1, clientHeight: 1 };

export function useContainerScroll(ref: RefObject<HTMLElement | null>): ScrollSnap {
  const [snap, setSnap] = useState<ScrollSnap>(EMPTY);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const read = () => {
      raf = 0;
      setSnap({
        scrollTop: el.scrollTop,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
      });
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(read);
    };

    read();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(read);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);

  return snap;
}
