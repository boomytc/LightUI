import { useEffect, useRef, useState, type PointerEvent } from "react";
import { SLIDES, SPIN_FACES } from "../lib/fixtures";
import {
  accordionWeights,
  angleToIndex,
  coverflowHidden,
  motionMs,
  parallaxOffset,
  shortestOffset,
  spinAngle,
  stackLayer,
  wrapIndex,
} from "../lib/machines";
import { pick, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { SlideArt } from "./SlideArt";

export type MotionProps = {
  index: number;
  go: (n: number) => void;
  next: () => void;
  prev: () => void;
  jump: boolean;
  locale: Locale;
};

const FACE_BG = [
  "slide-tone-0",
  "slide-tone-1",
  "slide-tone-2",
  "slide-tone-3",
] as const;

export function ClassicMotion({ index, next, prev, jump, locale }: MotionProps) {
  const start = useRef<{ x: number; y: number } | null>(null);

  return (
    <div
      className="slide-stage overflow-hidden select-none touch-pan-y"
      onPointerDown={(e) => {
        start.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        if (!start.current) return;
        const dx = e.clientX - start.current.x;
        const dy = e.clientY - start.current.y;
        start.current = null;
        if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
        if (dx > 0) prev();
        else next();
      }}
    >
      <div
        className={cn("flex h-full", !jump && "slide-tween")}
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {SLIDES.map((slide) => (
          <SlideArt
            key={slide.id}
            slide={slide}
            locale={locale}
            className="h-full w-full shrink-0"
          />
        ))}
      </div>
    </div>
  );
}

export function FadeMotion({ index, locale }: MotionProps) {
  return (
    <div className="slide-stage relative">
      {SLIDES.map((slide, i) => (
        <SlideArt
          key={slide.id}
          slide={slide}
          locale={locale}
          className={cn(
            "slide-fade-layer absolute inset-0",
            i === index ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0",
          )}
        />
      ))}
    </div>
  );
}

export function CoverflowMotion({ index, go, jump, locale }: MotionProps) {
  const count = SLIDES.length;
  return (
    <div className="coverflow-scene relative overflow-hidden">
      {SLIDES.map((slide, i) => {
        const offset = shortestOffset(i, index, count);
        const hidden = coverflowHidden(offset);
        return (
          <button
            type="button"
            key={slide.id}
            onClick={() => go(i)}
            className={cn(
              "coverflow-card absolute top-6 left-1/2 overflow-hidden rounded-2xl text-left shadow-card",
              jump && "is-jump",
            )}
            style={{
              transform: `translateX(${offset * 58}%) rotateY(${offset * -40}deg) scale(${offset === 0 ? 1 : 0.86})`,
              zIndex: 20 - Math.abs(offset),
              opacity: hidden ? 0 : 1,
              pointerEvents: hidden ? "none" : "auto",
            }}
            aria-label={pick(slide.title, locale)}
            aria-current={offset === 0}
          >
            <SlideArt slide={slide} locale={locale} compact className="h-full w-full" />
          </button>
        );
      })}
    </div>
  );
}

export function StackMotion({ index, next, prev, jump, locale }: MotionProps) {
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const [fly, setFly] = useState<number | null>(null);
  const origin = useRef({ x: 0, y: 0 });
  const lock = useRef(false);
  const count = SLIDES.length;
  const visible = [0, 1, 2].map((depth) => wrapIndex(index + depth, count));

  function peel(dir: 1 | -1) {
    if (lock.current) return;
    if (jump) {
      if (dir > 0) next();
      else prev();
      return;
    }
    lock.current = true;
    setFly(dir * 420);
    window.setTimeout(() => {
      if (dir > 0) next();
      else prev();
      setFly(null);
      setDrag({ x: 0, y: 0, active: false });
      lock.current = false;
    }, motionMs(false, 280));
  }

  function onDown(e: PointerEvent<HTMLDivElement>) {
    if (lock.current) return;
    origin.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ x: 0, y: 0, active: true });
  }

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (!drag.active) return;
    setDrag({
      x: e.clientX - origin.current.x,
      y: e.clientY - origin.current.y,
      active: true,
    });
  }

  function onUp() {
    if (!drag.active) return;
    if (Math.abs(drag.x) > 96) peel(drag.x > 0 ? 1 : -1);
    else setDrag({ x: 0, y: 0, active: false });
  }

  return (
    <div className="stack-scene relative w-full">
      {visible.map((slideIndex, depth) => {
        const slide = SLIDES[slideIndex];
        const layer = stackLayer(depth);
        const isTop = depth === 0;
        const x = isTop ? (fly ?? drag.x) : 0;
        const y = isTop ? (fly ? 8 : drag.y * 0.2) : 0;
        const rotating = isTop ? x * 0.04 : layer.rotate;
        return (
          <div
            key={`${slide.id}-${depth}`}
            onPointerDown={isTop ? onDown : undefined}
            onPointerMove={isTop ? onMove : undefined}
            onPointerUp={isTop ? onUp : undefined}
            onPointerCancel={isTop ? onUp : undefined}
            className={cn(
              "stack-card absolute inset-x-0 top-0 overflow-hidden rounded-2xl shadow-card",
              isTop ? "cursor-grab touch-none active:cursor-grabbing" : "pointer-events-none",
              drag.active && isTop && "is-drag",
            )}
            style={{
              zIndex: 10 - depth,
              transform: `translate(${x}px, ${y + layer.y}px) rotate(${rotating}deg) scale(${layer.scale})`,
            }}
          >
            <SlideArt slide={slide} locale={locale} className="w-full" />
          </div>
        );
      })}
    </div>
  );
}

function Leaf({
  kicker,
  title,
  notes,
}: {
  kicker: string;
  title?: string;
  notes?: string[];
}) {
  return (
    <div className="flex h-full min-w-0 flex-col bg-surface-2 p-3">
      <p className="text-[10px] tracking-wider text-fg-subtle">{kicker}</p>
      {title ? (
        <h3 className="mt-2 text-[15px] font-semibold leading-snug tracking-tight text-fg">{title}</h3>
      ) : null}
      {notes ? (
        <ol className="mt-2 space-y-1.5 text-[11px] text-fg-muted">
          {notes.map((item, i) => (
            <li key={item} className="flex gap-1.5">
              <span className="tabular-nums text-fg-subtle">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0">{item}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

export function FlipMotion({ index, next, prev, jump, locale }: MotionProps) {
  const [phase, setPhase] = useState<"idle" | "next" | "prev">("idle");
  const [flipped, setFlipped] = useState(false);
  const lock = useRef(false);
  const count = SLIDES.length;
  const current = SLIDES[index];
  const upcoming = SLIDES[wrapIndex(index + 1, count)];
  const previous = SLIDES[wrapIndex(index - 1, count)];

  function turn(dir: "next" | "prev") {
    if (lock.current) return;
    if (jump) {
      if (dir === "next") next();
      else prev();
      return;
    }
    lock.current = true;
    setFlipped(false);
    setPhase(dir);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setFlipped(true));
    });
    window.setTimeout(() => {
      if (dir === "next") next();
      else prev();
      setPhase("idle");
      setFlipped(false);
      lock.current = false;
    }, 820);
  }

  const leftSlide = phase === "prev" ? previous : current;
  const rightSlide = phase === "next" ? upcoming : current;

  return (
    <div className="px-3 pt-3">
      <div className="book-scene relative mx-auto w-full">
        <div className="absolute inset-0 overflow-hidden rounded-xl border border-border bg-surface-2">
          <button
            type="button"
            aria-label={locale === "en" ? "Previous page" : "上一页"}
            className="absolute inset-y-0 left-0 z-10 w-1/2"
            onClick={() => turn("prev")}
          />
          <button
            type="button"
            aria-label={locale === "en" ? "Next page" : "下一页"}
            className="absolute inset-y-0 right-0 z-10 w-1/2"
            onClick={() => turn("next")}
          />
          <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-px bg-border-strong" />
          <div className="spine-shadow pointer-events-none absolute inset-y-3 left-1/2 z-20 w-5 -translate-x-1/2" />

          <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden">
            <SlideArt slide={leftSlide} locale={locale} compact className="h-full w-full" />
          </div>
          <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden">
            <Leaf
              kicker={pick(rightSlide.kicker, locale)}
              title={pick(rightSlide.title, locale)}
              notes={rightSlide.notes.map((n) => pick(n, locale))}
            />
          </div>

          {phase === "next" ? (
            <div
              className={cn("book-leaf absolute inset-y-0 right-0 z-30 w-1/2", flipped && "is-flipped")}
            >
              <div className="book-face absolute inset-0 overflow-hidden">
                <Leaf
                  kicker={pick(current.kicker, locale)}
                  title={pick(current.title, locale)}
                  notes={current.notes.map((n) => pick(n, locale))}
                />
                <div className="curl-edge pointer-events-none absolute inset-y-0 right-0 w-5" />
              </div>
              <div className="book-face book-face-back absolute inset-0 overflow-hidden">
                <SlideArt slide={upcoming} locale={locale} compact className="h-full w-full" />
              </div>
            </div>
          ) : null}

          {phase === "prev" ? (
            <div
              className={cn(
                "book-leaf book-leaf-left absolute inset-y-0 left-0 z-30 w-1/2",
                flipped && "is-flipped-left",
              )}
            >
              <div className="book-face absolute inset-0 overflow-hidden">
                <SlideArt slide={current} locale={locale} compact className="h-full w-full" />
              </div>
              <div className="book-face book-face-back absolute inset-0 overflow-hidden">
                <Leaf
                  kicker={pick(previous.kicker, locale)}
                  title={pick(previous.title, locale)}
                  notes={previous.notes.map((n) => pick(n, locale))}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function AccordionMotion({ index, go, jump, locale }: MotionProps) {
  const columns = accordionWeights(index, SLIDES.length)
    .map((n) => `${n}fr`)
    .join(" ");

  return (
    <div
      className={cn("acc-grid px-2 pt-2", jump && "is-jump")}
      style={{ gridTemplateColumns: columns }}
    >
      {SLIDES.map((slide, i) => {
        const open = i === index;
        return (
          <button
            type="button"
            key={slide.id}
            onClick={() => go(i)}
            onMouseEnter={() => go(i)}
            onFocus={() => go(i)}
            className="relative min-w-0 overflow-hidden rounded-xl text-left"
            aria-pressed={open}
            aria-label={pick(slide.title, locale)}
          >
            <SlideArt
              slide={slide}
              locale={locale}
              labeled={open}
              className="h-full w-full"
            />
            <span
              className={cn(
                "acc-spine pointer-events-none absolute bottom-3 left-1/2 z-10 origin-bottom -translate-x-1/2 text-[12px] font-medium tracking-widest text-accent-fg drop-shadow",
                open ? "opacity-0" : "opacity-100",
              )}
            >
              {pick(slide.title, locale)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function SpinMotion({ index, go, jump, locale }: MotionProps) {
  const [angle, setAngle] = useState(() => spinAngle(index));
  const [dragging, setDragging] = useState(false);
  const lastX = useRef(0);

  useEffect(() => {
    if (!dragging) setAngle(spinAngle(index));
  }, [index, dragging]);

  function onDown(e: PointerEvent<HTMLDivElement>) {
    lastX.current = e.clientX;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    setAngle((a) => a + dx * 0.45);
  }

  function onUp() {
    if (!dragging) return;
    setDragging(false);
    const snapped = angleToIndex(angle);
    setAngle(spinAngle(snapped));
    go(snapped);
  }

  const shown = Math.round((((angle % 360) + 360) % 360));

  return (
    <div className="px-4 pt-3 pb-1">
      <div className="cube-scene relative mx-auto w-full">
        <div
          className="absolute inset-0 touch-none"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <div
            className={cn("cube absolute top-6 left-1/2", jump ? "is-jump" : dragging ? "" : "is-ease")}
            style={{ transform: `rotateX(-16deg) rotateY(${angle}deg)` }}
          >
            {SPIN_FACES.map((name, i) => (
              <div
                key={i}
                className={cn(
                  "cube-face absolute flex items-center justify-center text-[13px] font-medium tracking-widest",
                  FACE_BG[i],
                  `cube-face-${i}`,
                )}
              >
                {pick(name, locale)}
              </div>
            ))}
          </div>
          <div className="cube-ground absolute bottom-3 left-1/2 -translate-x-1/2 rounded-[100%] bg-fg/20 blur-[5px]" />
        </div>
      </div>
      <label className="mt-1 block px-1">
        <span className="sr-only">{locale === "en" ? "Angle" : "旋转角度"}</span>
        <input
          type="range"
          min={0}
          max={360}
          value={shown}
          onChange={(e) => {
            const next = Number(e.target.value);
            setAngle(next);
            go(angleToIndex(next));
          }}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border-strong accent-[var(--color-accent)]"
        />
        <span className="mt-1 block text-center font-mono text-[11px] tabular-nums text-fg-subtle">
          {shown}°
        </span>
      </label>
    </div>
  );
}

export function ParallaxMotion({ index, jump, locale }: MotionProps) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const slide = SLIDES[index];
  const mx = jump ? 0 : mouse.x;
  const my = jump ? 0 : mouse.y;

  return (
    <div
      className="para-scene relative overflow-hidden"
      onPointerMove={(e) => {
        if (jump) return;
        const box = e.currentTarget.getBoundingClientRect();
        setMouse({
          x: ((e.clientX - box.left) / box.width - 0.5) * 2,
          y: ((e.clientY - box.top) / box.height - 0.5) * 2,
        });
      }}
      onPointerLeave={() => setMouse({ x: 0, y: 0 })}
    >
      <div className={cn("absolute inset-0", `slide-tone-${slide.tone}`)} />
      <div
        className={cn("para-layer pointer-events-none absolute -top-8 -right-8 h-36 w-36 rounded-full bg-accent/50", jump && "is-jump")}
        style={{
          transform: `translate3d(${parallaxOffset(index, 0.3) + mx * 8}px, ${my * 6}px, 0)`,
        }}
      />
      <div
        className={cn("para-layer pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-[28px] bg-fg/15", jump && "is-jump")}
        style={{
          transform: `translate3d(${parallaxOffset(index, 0.7) + mx * 18}px, ${my * 8}px, 0)`,
        }}
      />
      <div
        className={cn("para-layer relative z-10 px-5 pt-6", jump && "is-jump")}
        style={{
          /* Short stride so kicker/title stay inside the 390 scene after index 0. */
          transform: `translate3d(${parallaxOffset(index, 0.7, 16) + mx * 10}px, 0, 0)`,
        }}
      >
        <span className="inline-flex rounded-full bg-surface/70 px-2.5 py-1 text-[11px] tracking-wider text-fg">
          {pick(slide.kicker, locale)}
        </span>
        <h3 className="mt-2 text-[1.55rem] font-semibold tracking-tight text-accent-fg drop-shadow-sm">
          {pick(slide.title, locale)}
        </h3>
      </div>
      <div
        className={cn(
          "para-layer para-card absolute top-1/2 left-1/2 z-20 rounded-2xl border border-border bg-surface p-4 shadow-card",
          jump && "is-jump",
        )}
        style={{
          transform: `translate3d(calc(-50% + ${parallaxOffset(index, 1) + mx * 28}px), calc(-42% + ${my * 12}px), 0)`,
        }}
      >
        <p className="text-[11px] tracking-wider text-fg-subtle">
          {locale === "en" ? "Foreground" : "前景"}
        </p>
        <p className="mt-1 text-[15px] font-semibold tracking-tight">{pick(slide.title, locale)}</p>
        <p className="mt-1 text-[12px] text-fg-muted">{pick(slide.caption, locale)}</p>
      </div>
    </div>
  );
}
