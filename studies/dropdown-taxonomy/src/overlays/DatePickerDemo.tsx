import { useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  formatIso,
  inRange,
  isPastDay,
  isRangeEnd,
  monthCells,
  nightsBetween,
  pickRangeDay,
  todayDay,
  type DateRange,
  type Day,
} from "../lib/date-range";
import { useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { FieldLabel, Frame, TriggerButton } from "./Frame";
import { Popover } from "./Popover";

const WEEKDAYS_ZH = ["一", "二", "三", "四", "五", "六", "日"];
const WEEKDAYS_EN = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function DatePickerDemo() {
  const locale = useLocale();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const today = useMemo(() => todayDay(), []);
  const [open, setOpen] = useState(true);
  const [month, setMonth] = useState<Day>(() => ({ y: today.y, m: today.m, d: 1 }));
  const [range, setRange] = useState<DateRange>(() => {
    const from = { y: today.y, m: today.m, d: Math.min(today.d + 3, 28) };
    const to = { y: today.y, m: today.m, d: Math.min(today.d + 6, 28) };
    if (to.d <= from.d) return { from, to: null };
    return { from, to };
  });

  const weekStartsOn = 1 as const;
  const cells = monthCells(month.y, month.m, weekStartsOn);
  const weekdays = locale === "en" ? WEEKDAYS_EN : WEEKDAYS_ZH;
  const nights = range.from && range.to ? nightsBetween(range.from, range.to) : 0;

  const label = !range.from
    ? locale === "en"
      ? "Choose check-in"
      : "选择入住日期"
    : !range.to
      ? `${formatIso(range.from)}  →  ${locale === "en" ? "check-out" : "选择离店日期"}`
      : `${formatIso(range.from)}  →  ${formatIso(range.to)}`;

  function select(day: Day) {
    setRange((prev) => pickRangeDay(prev, day, today));
  }

  return (
    <Frame title={locale === "en" ? "Hotel · stay dates" : "酒店预订 · 入住日期"}>
      <FieldLabel>{locale === "en" ? "Stay" : "入住日期"}</FieldLabel>
      <TriggerButton ref={triggerRef} open={open} onClick={() => setOpen((v) => !v)}>
        <span>{label}</span>
        <ChevronDown className="size-4 shrink-0 text-fg-muted" />
      </TriggerButton>
      <Popover open={open} onClose={() => setOpen(false)} triggerRef={triggerRef} matchWidth={false}>
        <div className="w-[18.5rem] p-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-[14px] font-semibold">
              {locale === "en"
                ? `${monthName(month.m, "en")} ${month.y}`
                : `${month.y}年${month.m + 1}月`}
            </p>
            <div className="flex gap-1">
              <IconButton
                label={locale === "en" ? "Previous month" : "上个月"}
                onClick={() => setMonth((m) => addMonths(m, -1))}
              >
                <ChevronLeft className="size-4" />
              </IconButton>
              <IconButton
                label={locale === "en" ? "Next month" : "下个月"}
                onClick={() => setMonth((m) => addMonths(m, 1))}
              >
                <ChevronRight className="size-4" />
              </IconButton>
            </div>
          </div>
          <div className="grid grid-cols-7 text-center text-[11px] text-fg-subtle">
            {weekdays.map((w) => (
              <span key={w} className="py-1">
                {w}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((cell, i) => {
              if (!cell) return <span key={`e-${i}`} />;
              const past = isPastDay(cell, today);
              const end = isRangeEnd(cell, range);
              const mid = inRange(cell, range) && !end;
              const waiting = range.from && !range.to && isRangeEnd(cell, range);
              return (
                <button
                  key={formatIso(cell)}
                  type="button"
                  disabled={past}
                  onClick={() => select(cell)}
                  className={cn(
                    "mx-auto my-0.5 flex size-9 items-center justify-center rounded-full text-[13px]",
                    past && "cursor-not-allowed text-fg-subtle/40",
                    !past && !end && !mid && "hover:bg-surface-2",
                    mid && "rounded-none bg-accent-soft text-fg",
                    (end || waiting) && "bg-accent font-medium text-accent-fg",
                  )}
                >
                  {cell.d}
                </button>
              );
            })}
          </div>
          <div className="mt-2 border-t border-border px-1 pt-2 text-right text-[12px] text-accent">
            {range.from && range.to
              ? locale === "en"
                ? `${formatIso(range.from)} – ${formatIso(range.to)} · ${nights} nights`
                : `${month.m + 1} 月 ${range.from.d} 日–${range.to.d} 日 · 共 ${nights} 晚`
              : locale === "en"
                ? "Pick a check-out date"
                : "请选择离店日期"}
          </div>
        </div>
      </Popover>
      <p className="mt-3 text-[12px] text-fg-subtle">
        {locale === "en" ? "Past days are locked" : "过去日期不可选"}
        {range.from && range.to
          ? locale === "en"
            ? ` · ${nights} nights`
            : ` · 已选 ${nights} 晚`
          : null}
      </p>
    </Frame>
  );
}

function monthName(m: number, locale: "en"): string {
  return new Date(2026, m, 1).toLocaleString(locale === "en" ? "en" : "zh", { month: "long" });
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-7 place-items-center rounded-md text-fg-muted hover:bg-surface-2 hover:text-fg"
    >
      {children}
    </button>
  );
}
