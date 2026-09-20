import { useRef, useState, type PointerEvent } from "react";
import { RANGE } from "../lib/fixtures";
import { applyRangeThumb, nearestThumb, valueFromTrack, type RangeThumb } from "../lib/machines";
import { useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Phone, PhoneButton } from "./Frame";

function yen(n: number) {
  return `¥${n}`;
}

export function Range() {
  const locale = useLocale();
  const trackRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<RangeThumb | null>(null);
  const boundsRef = useRef({ lo: RANGE.lo as number, hi: RANGE.hi as number });
  const [lo, setLo] = useState<number>(RANGE.lo);
  const [hi, setHi] = useState<number>(RANGE.hi);
  const [active, setActive] = useState<RangeThumb | null>(null);
  const [applied, setApplied] = useState<{ lo: number; hi: number } | null>(null);

  const pos = (v: number) => ((v - RANGE.min) / (RANGE.max - RANGE.min)) * 100;

  const readRaw = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return boundsRef.current.lo;
    const rect = el.getBoundingClientRect();
    return valueFromTrack(clientX, rect.left, rect.width, RANGE.min, RANGE.max, RANGE.step);
  };

  const apply = (thumb: RangeThumb, raw: number) => {
    const next = applyRangeThumb(
      thumb,
      raw,
      boundsRef.current.lo,
      boundsRef.current.hi,
      RANGE.min,
      RANGE.max,
      RANGE.gap,
      RANGE.step,
    );
    boundsRef.current = next;
    setLo(next.lo);
    setHi(next.hi);
    setApplied(null);
  };

  const pointer = (thumb: RangeThumb | "auto") => ({
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      event.stopPropagation();
      const raw = readRaw(event.clientX);
      const which = thumb === "auto" ? nearestThumb(raw, boundsRef.current.lo, boundsRef.current.hi) : thumb;
      activeRef.current = which;
      setActive(which);
      event.currentTarget.setPointerCapture(event.pointerId);
      apply(which, raw);
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (!activeRef.current) return;
      apply(activeRef.current, readRaw(event.clientX));
    },
    onPointerUp: () => {
      activeRef.current = null;
      setActive(null);
    },
    onPointerCancel: () => {
      activeRef.current = null;
      setActive(null);
    },
  });

  const trackPointer = pointer("auto");
  const loPointer = pointer("lo");
  const hiPointer = pointer("hi");

  return (
    <Phone
      title={locale === "en" ? "Filter price" : "筛选价格"}
      footer={
        <PhoneButton onClick={() => setApplied({ lo, hi })}>
          {locale === "en" ? "See results" : "查看结果"}
        </PhoneButton>
      }
    >
      <div className="flex flex-1 flex-col px-5 pt-5">
        <h3 className="text-[15px] font-medium">{locale === "en" ? "Price range" : "选择价格区间"}</h3>
        <p className="mt-1 text-[13px] text-fg-muted">
          {locale === "en" ? "Drag both ends to set a budget." : "拖动两端，设置你的预算。"}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-surface-2 px-4 py-3">
            <p className="text-[11px] text-fg-muted">{locale === "en" ? "Floor" : "最低价"}</p>
            <p className="mt-1 text-[1.5rem] font-semibold tracking-tight tabular-nums">{yen(lo)}</p>
          </div>
          <div className="rounded-xl bg-surface-2 px-4 py-3">
            <p className="text-[11px] text-fg-muted">{locale === "en" ? "Ceiling" : "最高价"}</p>
            <p className="mt-1 text-[1.5rem] font-semibold tracking-tight tabular-nums">{yen(hi)}</p>
          </div>
        </div>

        <div className="mt-10 px-1">
          <div ref={trackRef} className="relative h-11 touch-none select-none" {...trackPointer}>
            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-surface-2" />
            <div
              className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent"
              style={{ left: `${pos(lo)}%`, right: `${100 - pos(hi)}%` }}
            />
            <button
              type="button"
              aria-label={locale === "en" ? "Floor" : "最低价"}
              className="absolute top-1/2 size-11 -translate-x-1/2 -translate-y-1/2 touch-none"
              style={{ left: `${pos(lo)}%` }}
              {...loPointer}
            >
              <span
                className={cn(
                  "mx-auto block size-6 rounded-full bg-surface ring-2 ring-accent transition-transform duration-150",
                  active === "lo" && "scale-110",
                )}
              />
            </button>
            <button
              type="button"
              aria-label={locale === "en" ? "Ceiling" : "最高价"}
              className="absolute top-1/2 size-11 -translate-x-1/2 -translate-y-1/2 touch-none"
              style={{ left: `${pos(hi)}%` }}
              {...hiPointer}
            >
              <span
                className={cn(
                  "mx-auto block size-6 rounded-full bg-surface ring-2 ring-accent transition-transform duration-150",
                  active === "hi" && "scale-110",
                )}
              />
            </button>
          </div>
          <div className="mt-1 flex justify-between text-[11px] tabular-nums text-fg-subtle">
            <span>{yen(RANGE.min)}</span>
            <span>{yen(RANGE.max)}</span>
          </div>
        </div>

        <p className="mt-8 text-center text-[11px] text-accent">
          {applied
            ? locale === "en"
              ? `Filtered ${yen(applied.lo)} – ${yen(applied.hi)}`
              : `已筛选 ${yen(applied.lo)} – ${yen(applied.hi)}`
            : locale === "en"
              ? "Two ends · live amounts · do not cross"
              : "双端选择 · 实时金额 · 端点不交叉"}
        </p>
      </div>
    </Phone>
  );
}
