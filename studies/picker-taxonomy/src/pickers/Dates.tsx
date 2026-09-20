import { useState } from "react";
import { DATE_MONTH, DATE_SPAN, TODAY } from "../lib/fixtures";
import {
  addMonths,
  dateComplete,
  formatDay,
  inRange,
  isPastDay,
  isSameDay,
  monthCells,
  nightsOf,
  pickDate,
  type Day,
} from "../lib/machines";
import { useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Phone, PhoneButton } from "./Frame";

const WEEKDAYS = {
  zh: ["一", "二", "三", "四", "五", "六", "日"],
  en: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
};

export function Dates() {
  const locale = useLocale();
  const [month, setMonth] = useState<Day>(DATE_MONTH);
  const [span, setSpan] = useState(DATE_SPAN);
  const [confirmed, setConfirmed] = useState(false);
  const days = monthCells(month.y, month.m);
  const nights = nightsOf(span);
  const complete = dateComplete(span);

  const tap = (value: Day) => {
    setConfirmed(false);
    setSpan((current) => pickDate(current, value, TODAY));
  };

  const shift = (delta: number) => {
    setMonth((current) => addMonths(current, delta));
  };

  return (
    <Phone
      title={locale === "en" ? "Check-in and check-out" : "选择入住与离店"}
      footer={
        <PhoneButton disabled={!complete} onClick={() => complete && setConfirmed(true)}>
          {locale === "en" ? "Confirm dates" : "确认日期"}
        </PhoneButton>
      }
    >
      <div className="flex flex-1 flex-col px-4 pt-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label={locale === "en" ? "Previous month" : "上个月"}
            className="grid size-10 place-items-center rounded-full text-fg"
            onClick={() => shift(-1)}
          >
            <Chevron dir="left" />
          </button>
          <p className="text-[14px] font-medium tracking-tight">
            {locale === "en"
              ? `${month.y}-${String(month.m + 1).padStart(2, "0")}`
              : `${month.y}年${month.m + 1}月`}
          </p>
          <button
            type="button"
            aria-label={locale === "en" ? "Next month" : "下个月"}
            className="grid size-10 place-items-center rounded-full text-fg"
            onClick={() => shift(1)}
          >
            <Chevron dir="right" />
          </button>
        </div>

        <div className="mt-2 grid grid-cols-7 text-center text-[11px] text-fg-muted">
          {WEEKDAYS[locale].map((label) => (
            <span key={label} className="py-2">
              {label}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((cell, i) => {
            if (!cell) return <span key={`b-${i}`} className="h-11" />;
            const past = isPastDay(cell, TODAY);
            const start = span.from ? isSameDay(cell, span.from) : false;
            const end = span.to ? isSameDay(cell, span.to) : false;
            const mid = inRange(cell, span) && !start && !end;

            return (
              <button
                key={`${cell.y}-${cell.m}-${cell.d}`}
                type="button"
                disabled={past}
                onClick={() => tap(cell)}
                className={cn(
                  "relative flex h-11 items-center justify-center text-[13px] tabular-nums",
                  "disabled:pointer-events-none disabled:text-fg-subtle",
                  !past && !start && !end && "text-fg",
                )}
              >
                {mid ? <span className="picker-cal-mid" /> : null}
                {start && span.to ? (
                  <span className="picker-cal-mid left-1/2" />
                ) : null}
                {end && span.from ? (
                  <span className="picker-cal-mid right-1/2" />
                ) : null}
                <span
                  className={cn(
                    "relative z-10 grid size-9 place-items-center rounded-full",
                    (start || end) && "bg-accent text-accent-fg",
                  )}
                >
                  {cell.d}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 min-h-16 text-center">
          {!span.from ? (
            <p className="text-[13px] text-fg-muted">
              {locale === "en" ? "Pick a check-in date" : "请选择入住日期"}
            </p>
          ) : !span.to ? (
            <p className="text-[13px] text-fg-muted">
              {locale === "en" ? "Pick a check-out date" : "请选择离店日期"}
            </p>
          ) : (
            <>
              <p className="text-[13px]">
                {locale === "en" ? "In" : "入住"} {formatDay(span.from, locale)}
                <span className="mx-1.5 text-fg-subtle">·</span>
                {locale === "en" ? "Out" : "离店"} {formatDay(span.to, locale)}
              </p>
              <p className="mt-1 text-[13px] text-accent">
                {locale === "en" ? `${nights} nights` : `共 ${nights} 晚`}
              </p>
            </>
          )}
        </div>

        <p className="mt-auto pb-3 text-center text-[11px] text-accent">
          {confirmed && span.from && span.to
            ? locale === "en"
              ? `Confirmed ${formatDay(span.from, locale)} – ${formatDay(span.to, locale)}, ${nights} nights`
              : `已确认 ${formatDay(span.from, locale)} 至 ${formatDay(span.to, locale)}，共 ${nights} 晚`
            : locale === "en"
              ? "Check-in first · then check-out · end after start"
              : "先入住 · 后离店 · 离店必须晚于入住"}
        </p>
      </div>
    </Phone>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
      <path
        d={dir === "left" ? "M15 5 8 12l7 7" : "m9 5 7 7-7 7"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
