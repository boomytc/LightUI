import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { RULER } from "../lib/fixtures";
import { snapRuler, valueFromDrag } from "../lib/machines";
import { useLocale } from "../lib/site-locale";
import { Phone, PhoneButton } from "./Frame";

function formatKg(n: number) {
  return n.toFixed(1);
}

export function Ruler() {
  const locale = useLocale();
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startValue: RULER.value as number,
    lastX: 0,
    lastT: 0,
    velocity: 0,
  });
  const inertiaRef = useRef<number | null>(null);
  const valueRef = useRef<number>(RULER.value);
  const [width, setWidth] = useState(320);
  const [value, setValue] = useState<number>(RULER.value);
  const [dragging, setDragging] = useState(false);
  const [saved, setSaved] = useState<number | null>(null);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const apply = () => setWidth(el.clientWidth);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const stopInertia = () => {
    if (inertiaRef.current != null) {
      cancelAnimationFrame(inertiaRef.current);
      inertiaRef.current = null;
    }
  };

  const finish = useCallback((raw: number) => {
    const next = snapRuler(raw, RULER.step, RULER.min, RULER.max);
    valueRef.current = next;
    setValue(next);
    setDragging(false);
  }, []);

  const runInertia = useCallback(
    (start: number, velocity: number) => {
      stopInertia();
      let current = start;
      let v = velocity;
      const tick = () => {
        v *= 0.92;
        current += v * 16;
        if (current <= RULER.min || current >= RULER.max) {
          finish(current);
          return;
        }
        if (Math.abs(v) < 0.0008) {
          finish(current);
          return;
        }
        valueRef.current = snapRuler(current, RULER.step, RULER.min, RULER.max);
        setValue(valueRef.current);
        inertiaRef.current = requestAnimationFrame(tick);
      };
      inertiaRef.current = requestAnimationFrame(tick);
    },
    [finish],
  );

  useEffect(() => () => stopInertia(), []);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    stopInertia();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      active: true,
      startX: event.clientX,
      startValue: valueRef.current,
      lastX: event.clientX,
      lastT: performance.now(),
      velocity: 0,
    };
    setDragging(true);
    setSaved(null);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    const now = performance.now();
    const dt = Math.max(now - drag.lastT, 8);
    const next = valueFromDrag(drag.startValue, event.clientX - drag.startX, RULER.pxPerUnit, RULER.min, RULER.max);
    drag.velocity = (drag.lastX - event.clientX) / RULER.pxPerUnit / dt;
    drag.lastX = event.clientX;
    drag.lastT = now;
    valueRef.current = next;
    setValue(next);
  };

  const onPointerUp = () => {
    const drag = dragRef.current;
    if (!drag.active) return;
    drag.active = false;
    if (Math.abs(drag.velocity) > 0.0006) {
      runInertia(valueRef.current, drag.velocity);
    } else {
      finish(valueRef.current);
    }
  };

  const offset = width / 2 - (value - RULER.min) * RULER.pxPerUnit;
  const integers: number[] = [];
  for (let n = RULER.min; n <= RULER.max; n += 1) integers.push(n);
  const display = formatKg(snapRuler(value, RULER.step, RULER.min, RULER.max));

  return (
    <Phone
      title={locale === "en" ? "Set weight" : "设置体重"}
      footer={
        <PhoneButton
          onClick={() => setSaved(snapRuler(value, RULER.step, RULER.min, RULER.max))}
        >
          {saved != null
            ? locale === "en"
              ? "Saved"
              : "已保存"
            : locale === "en"
              ? "Save"
              : "保存"}
        </PhoneButton>
      }
    >
      <div className="flex flex-1 flex-col items-center px-2 pt-8 pb-4">
        <p className="text-[12px] text-fg-muted">{locale === "en" ? "Current weight" : "当前体重"}</p>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-[2.75rem] leading-none font-semibold tracking-tight tabular-nums text-fg">
            {display}
          </span>
          <span className="text-[13px] text-fg-muted">{locale === "en" ? "kg" : "公斤"}</span>
        </div>

        <div
          ref={viewportRef}
          className="relative mt-10 w-full touch-none select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="picker-edge-fade overflow-hidden">
            <div
              className="relative h-20"
              style={{
                width: (RULER.max - RULER.min) * RULER.pxPerUnit,
                transform: `translate3d(${offset}px, 0, 0)`,
                transition: dragging ? "none" : "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <div className="picker-ruler-ticks absolute inset-x-0 bottom-7" />
              {integers.map((n) => (
                <span
                  key={n}
                  className="absolute bottom-0 -translate-x-1/2 text-[11px] tabular-nums text-fg-muted"
                  style={{ left: (n - RULER.min) * RULER.pxPerUnit }}
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-7 left-1/2 h-8 w-0.5 -translate-x-1/2 rounded-full bg-accent"
          />
        </div>

        <p className="mt-4 text-[11px] text-fg-subtle">
          {locale === "en" ? "Each tick 0.1 kg" : "每格 0.1 公斤"}
        </p>
        <p className="mt-2 min-h-5 text-center text-[11px] text-accent">
          {saved != null
            ? locale === "en"
              ? `Saved ${formatKg(saved)} kg`
              : `已保存 ${formatKg(saved)} 公斤`
            : locale === "en"
              ? "Pointer fixed · ticks slide · snap on release"
              : "指针固定 · 刻度滑动 · 松手对齐"}
        </p>
      </div>
    </Phone>
  );
}
