import { useLayoutEffect, useState } from "react";
import { cutoutPad, type Cutout, type KindId } from "../lib/machines";

export function useCutout(
  kind: KindId,
  target: HTMLElement | null,
  host: HTMLElement | null,
): { hole: Cutout | null; hostSize: { w: number; h: number } } {
  const [hole, setHole] = useState<Cutout | null>(null);
  const [hostSize, setHostSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    if (!target || !host) {
      setHole(null);
      return;
    }

    const measure = () => {
      const t = target.getBoundingClientRect();
      const c = host.getBoundingClientRect();
      setHostSize({ w: c.width, h: c.height });
      setHole(
        cutoutPad(kind, {
          x: t.left - c.left,
          y: t.top - c.top,
          w: t.width,
          h: t.height,
        }),
      );
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(target);
    ro.observe(host);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [kind, target, host]);

  return { hole, hostSize };
}
