import { useLayoutEffect, useRef, type RefObject } from "react";
import {
  AXIS_INSET,
  EXT_TAU,
  MAX_DOTS,
  MAX_EXTEND,
  TICK,
  dotCount,
  extensionAt,
  focusDot,
  fraction,
  lineLength,
  overflow,
  seekTop,
} from "../lib/machines";
import type { Locale } from "../lib/site-locale";

export function TrackRail({
  viewportRef,
  locale,
}: {
  viewportRef: RefObject<HTMLDivElement | null>;
  locale: Locale;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pieceRefs = useRef<(SVGLineElement | null)[]>([]);
  const hitRefs = useRef<(SVGRectElement | null)[]>([]);
  const countRef = useRef(6);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const svg = svgRef.current;
    if (!viewport || !svg) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let rafId: number | null = null;
    let lastTime = 0;
    const extensions = new Float64Array(MAX_DOTS);

    const metrics = () => {
      const max = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
      return { max, top: viewport.scrollTop, has: overflow(max) };
    };

    const layout = () => {
      const box = svg.getBoundingClientRect();
      const { max, top, has } = metrics();
      svg.dataset.state = has ? "tracking" : "hidden";
      svg.style.visibility = has ? "visible" : "hidden";
      if (!has) return null;
      const length = lineLength(box.height);
      const n = dotCount(length);
      countRef.current = n;
      const axisX = box.width - AXIS_INSET;
      const y0 = (box.height - length) / 2;
      const spacing = length / n;
      const focus = focusDot(fraction(top, max), n);
      return { n, axisX, y0, spacing, focus };
    };

    const draw = (geom: NonNullable<ReturnType<typeof layout>>) => {
      const { n, axisX, y0, spacing } = geom;
      for (let i = 0; i < MAX_DOTS; i++) {
        const el = pieceRefs.current[i];
        const hit = hitRefs.current[i];
        if (!el) continue;
        if (i >= n) {
          el.setAttribute("opacity", "0");
          if (hit) hit.style.pointerEvents = "none";
          continue;
        }
        const y = y0 + (i + 0.5) * spacing;
        el.setAttribute("x1", String(axisX - TICK - extensions[i]));
        el.setAttribute("y1", String(y));
        el.setAttribute("x2", String(axisX));
        el.setAttribute("y2", String(y));
        el.setAttribute("opacity", "1");
        if (hit) {
          hit.style.pointerEvents = "all";
          hit.setAttribute("x", String(axisX - MAX_EXTEND - TICK - 8));
          hit.setAttribute("y", String(y - spacing / 2));
          hit.setAttribute("width", String(MAX_EXTEND + TICK + 16));
          hit.setAttribute("height", String(spacing));
        }
      }
    };

    const advance = (dt: number, focus: number, n: number) => {
      const alpha = reduceMotion.matches ? 1 : 1 - Math.exp(-dt / EXT_TAU);
      let settled = true;
      for (let i = 0; i < n; i++) {
        const target = extensionAt(i, focus);
        const next = extensions[i] + (target - extensions[i]) * alpha;
        if (Math.abs(target - next) < 0.08) {
          extensions[i] = target;
        } else {
          extensions[i] = next;
          settled = false;
        }
      }
      return settled;
    };

    const step = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const geom = layout();
      if (!geom) {
        rafId = null;
        return;
      }
      const settled = advance(dt, geom.focus, geom.n);
      draw(geom);
      if (settled) {
        rafId = null;
        return;
      }
      rafId = requestAnimationFrame(step);
    };

    const kick = () => {
      if (rafId !== null) return;
      lastTime = performance.now();
      rafId = requestAnimationFrame(step);
    };

    viewport.addEventListener("scroll", kick, { passive: true });
    const ro = new ResizeObserver(kick);
    ro.observe(viewport);
    const child = viewport.firstElementChild;
    if (child) ro.observe(child);
    kick();

    return () => {
      viewport.removeEventListener("scroll", kick);
      ro.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [viewportRef]);

  const jump = (index: number) => {
    const el = viewportRef.current;
    if (!el) return;
    const max = Math.max(0, el.scrollHeight - el.clientHeight);
    const top = seekTop("track", {
      index,
      n: countRef.current,
      max,
      viewport: el.clientHeight,
      current: el.scrollTop,
    });
    if (top == null) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <svg
      ref={svgRef}
      className="scroll-track absolute inset-0 z-10 h-full w-full text-fg-muted"
      data-state="hidden"
      style={{ visibility: "hidden" }}
    >
      {Array.from({ length: MAX_DOTS }, (_, i) => (
        <line
          key={`tick-${i}`}
          ref={(node) => {
            pieceRefs.current[i] = node;
          }}
        />
      ))}
      {Array.from({ length: MAX_DOTS }, (_, i) => (
        <rect
          key={`hit-${i}`}
          ref={(node) => {
            hitRefs.current[i] = node;
          }}
          className="scroll-track-hit"
          role="button"
          tabIndex={-1}
          aria-label={locale === "en" ? `Jump to position ${i + 1}` : `跳到文稿位置 ${i + 1}`}
          onClick={() => jump(i)}
        />
      ))}
    </svg>
  );
}
