import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthCells, shiftMonth, type MonthCell } from "../lib/machines";
import { pick, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";

const WEEKDAYS = {
  zh: ["一", "二", "三", "四", "五", "六", "日"],
  en: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
} as const;

const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function Calendar({
  locale,
  year,
  month,
  selected,
  today,
  onMonthChange,
  onPick,
}: {
  locale: Locale;
  year: number;
  month: number;
  selected: string;
  today: string;
  onMonthChange: (next: { y: number; m: number }) => void;
  onPick: (iso: string) => void;
}) {
  const cells: MonthCell[] = monthCells(year, month);
  const title =
    locale === "en" ? `${MONTHS_EN[month]} ${year}` : `${year} 年 ${month + 1} 月`;

  return (
    <div className="min-w-0 rounded-xl border border-border bg-surface-2 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          className="grid size-8 shrink-0 place-items-center rounded-md text-fg-muted hover:bg-surface hover:text-fg"
          onClick={() => onMonthChange(shiftMonth(year, month, -1))}
          aria-label={pick({ zh: "上个月", en: "Previous month" }, locale)}
        >
          <ChevronLeft className="size-4" />
        </button>
        <p className="truncate text-[13px] font-medium">{title}</p>
        <button
          type="button"
          className="grid size-8 shrink-0 place-items-center rounded-md text-fg-muted hover:bg-surface hover:text-fg"
          onClick={() => onMonthChange(shiftMonth(year, month, 1))}
          aria-label={pick({ zh: "下个月", en: "Next month" }, locale)}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {WEEKDAYS[locale].map((day) => (
          <div key={day} className="text-[11px] font-medium leading-7 text-fg-subtle">
            {day}
          </div>
        ))}
        {cells.map((cell, i) => {
          if (!cell) return <span key={`b-${i}`} />;
          const isSelected = cell.iso === selected;
          const isToday = cell.iso === today;
          const isPast = cell.iso < today;
          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => onPick(cell.iso)}
              className={cn(
                "aspect-square w-full rounded-full text-[13px] tabular-nums",
                isPast && !isSelected && "text-fg-subtle",
                isToday && !isSelected && "font-medium ring-1 ring-accent/40",
                isSelected && "bg-accent font-medium text-accent-fg",
                !isSelected && "hover:bg-accent-soft",
              )}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] leading-5 text-fg-subtle">
        {pick(
          {
            zh: "过去的日期可以选中——选完后这一栏会立刻说明原因。",
            en: "Past days are still pickable — that column will explain why after you choose one.",
          },
          locale,
        )}
      </p>
    </div>
  );
}
