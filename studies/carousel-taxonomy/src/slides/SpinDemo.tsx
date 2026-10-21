import { useEffect, useRef, useState, type PointerEvent } from "react";
import { SPIN_FACES } from "../lib/fixtures";
import {
  dragAngle,
  normalizeAngle,
  shouldAutoplay,
  spinAngle,
} from "../lib/machines";
import { pick, useLocale } from "../lib/site-locale";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { Window } from "./Frame";
import "./slides.css";
export function SpinDemo({
  index = 0,
  autoplay = false,
}: {
  index?: number;
  autoplay?: boolean;
}) {
  const locale = useLocale();
  const reduced = useReducedMotion();
  const [angle, setAngle] = useState(() => spinAngle(index));
  const current = useRef(angle);
  const drag = useRef<{ pointer: number; x: number; angle: number } | null>(
    null,
  );
  const [dragging, setDragging] = useState(false);
  const [playing, setPlaying] = useState(autoplay);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const change = (next: number) => {
    current.current = next;
    setAngle(next);
  };
  useEffect(() => {
    current.current = spinAngle(index);
    setAngle(current.current);
  }, [index]);
  useEffect(() => {
    if (!playing || dragging || !shouldAutoplay(hovering || focused, reduced))
      return;
    let raf = 0,
      last = performance.now();
    const frame = (time: number) => {
      const dt = Math.max(0, Math.min(100, time - last));
      last = time;
      current.current += dt * 0.022;
      setAngle(current.current);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [playing, dragging, hovering, focused, reduced]);
  function end(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.pointer !== event.pointerId) return;
    drag.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }
  const shown = Math.round(normalizeAngle(angle));
  return (
    <Window
      title={locale === "en" ? "Orbit · product" : "Orbit · 产品"}
      action={
        <button
          type="button"
          disabled={reduced}
          className="text-xs text-fg-subtle"
          onClick={() => setPlaying((on) => !on)}
        >
          {reduced
            ? locale === "en"
              ? "Reduced"
              : "减动效"
            : playing
              ? locale === "en"
                ? "Auto on"
                : "自动开"
              : locale === "en"
                ? "Auto off"
                : "自动关"}
        </button>
      }
    >
      <div
        className="min-w-0 px-4 pb-3 pt-3"
        data-spin-angle={angle}
        onPointerEnter={() => setHovering(true)}
        onPointerLeave={() => setHovering(false)}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(event) => {
          if (
            !(event.relatedTarget instanceof Node) ||
            !event.currentTarget.contains(event.relatedTarget)
          )
            setFocused(false);
        }}
      >
        <p className="mb-1 text-xs text-fg-muted">
          {locale === "en"
            ? "Drag to rotate · release keeps this angle"
            : "拖动旋转 · 松手保留当前角度"}
        </p>
        <div className="cube-scene relative mx-auto w-full">
          <div
            data-spin-drag
            className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
            onPointerDown={(event) => {
              if (event.button !== 0 || !event.isPrimary) return;
              event.preventDefault();
              drag.current = {
                pointer: event.pointerId,
                x: event.clientX,
                angle: current.current,
              };
              setDragging(true);
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              const op = drag.current;
              if (!op || op.pointer !== event.pointerId) return;
              change(dragAngle(op.angle, event.clientX - op.x));
            }}
            onPointerUp={end}
            onPointerCancel={end}
            onLostPointerCapture={() => {
              drag.current = null;
              setDragging(false);
            }}
          >
            <div
              className={`cube absolute top-6 left-1/2 ${reduced ? "is-jump" : dragging || playing ? "" : "is-ease"}`}
              style={{ transform: `rotateX(-16deg) rotateY(${angle}deg)` }}
            >
              {SPIN_FACES.map((name, i) => (
                <div
                  key={i}
                  className={`cube-face absolute flex items-center justify-center text-sm font-medium tracking-widest slide-tone-${i} cube-face-${i}`}
                >
                  {pick(name, locale)}
                </div>
              ))}
            </div>
            <div className="cube-ground absolute bottom-3 left-1/2 -translate-x-1/2 rounded-[100%] bg-fg/20 blur-[5px]" />
          </div>
        </div>
        <label className="mt-2 block text-xs text-fg-muted">
          {locale === "en" ? "Rotation angle" : "旋转角度"}
          <input
            aria-label={locale === "en" ? "Rotation angle" : "旋转角度"}
            type="range"
            min="0"
            max="360"
            value={shown}
            onChange={(event) => change(Number(event.target.value))}
            className="mt-2 w-full accent-[var(--color-accent)]"
          />
        </label>
        <div className="mt-2 flex items-center justify-between gap-3">
          <button
            type="button"
            aria-label={
              locale === "en"
                ? "Rotate 45 degrees counterclockwise"
                : "逆时针旋转 45 度"
            }
            className="rounded-full bg-surface-2 px-3 py-2 text-xs"
            onClick={() => change(current.current - 45)}
          >
            −45°
          </button>
          <span className="font-mono text-sm tabular-nums" data-angle-readout>
            {shown}°
          </span>
          <button
            type="button"
            aria-label={
              locale === "en"
                ? "Rotate 45 degrees clockwise"
                : "顺时针旋转 45 度"
            }
            className="rounded-full bg-surface-2 px-3 py-2 text-xs"
            onClick={() => change(current.current + 45)}
          >
            +45°
          </button>
        </div>
      </div>
    </Window>
  );
}
