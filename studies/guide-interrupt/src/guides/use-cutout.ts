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
      const nextHost = { w: Math.round(c.width), h: Math.round(c.height) };
      const nextHole = cutoutPad(kind, {
        x: Math.round(t.left - c.left),
        y: Math.round(t.top - c.top),
        w: Math.round(t.width),
        h: Math.round(t.height),
      });
      setHostSize((prev) => (prev.w === nextHost.w && prev.h === nextHost.h ? prev : nextHost));
      setHole((prev) =>
        prev &&
        prev.x === nextHole.x &&
        prev.y === nextHole.y &&
        prev.w === nextHole.w &&
        prev.h === nextHole.h
          ? prev
          : nextHole,
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
