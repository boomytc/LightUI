import { useId, useMemo, useRef, useState } from "react";
import { CalendarDays, Check, ChevronDown, CircleAlert } from "lucide-react";
import {
  EMPTY_TOUCHED,
  EMPTY_VALUES,
  FIELD_KEYS,
  STAGE_TODAY,
  charCount,
  isFormReady,
  shownByLesson,
  stageSnapshot,
  todayISO,
  type FieldKey,
  type FormValues,
  type LessonId,
  type StageState,
  yearMonth,
} from "../lib/machines";
import { ERROR_COPY, TYPE_OPTIONS } from "../lib/kinds";
import { pick, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Calendar } from "./Calendar";
import { FieldLabel, fieldTone } from "./Frame";

export function ActivityForm({
  lesson,
  locale,
  locked,
}: {
  lesson: LessonId;
  locale: Locale;
  locked?: StageState;
}) {
  const today = locked ? STAGE_TODAY : todayISO();
  const seed = locked ? stageSnapshot(lesson, locked) : null;
  const [values, setValues] = useState<FormValues>(seed?.values ?? EMPTY_VALUES);
  const [touched, setTouched] = useState<Record<FieldKey, boolean>>(
    seed?.touched ?? { ...EMPTY_TOUCHED },
  );
  const [submitted, setSubmitted] = useState(seed?.submitted ?? false);
  const [success, setSuccess] = useState(seed?.success ?? false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(seed?.dateOpen ?? false);
  const [month, setMonth] = useState(() => yearMonth(seed?.values.date || today));
  const formRef = useRef<HTMLFormElement>(null);

  const nameId = useId();
  const typeId = useId();
  const dateId = useId();
  const confirmId = useId();

  const errors = useMemo(
    () => shownByLesson(lesson, { values, touched, submitted }, today),
    [lesson, values, touched, submitted, today],
  );
  const ready = isFormReady(values, today);
  const errorKeys = FIELD_KEYS.filter((key) => errors[key]);
  const errorCount = errorKeys.length;
  const typeMeta = TYPE_OPTIONS.find((item) => item.value === values.type);
  const nameLen = charCount(values.name);

  function delayFor(key: FieldKey) {
    const index = errorKeys.indexOf(key);
    return `${Math.max(index, 0) * 45}ms`;
  }

  function mark(key: FieldKey) {
    if (lesson === "submit") return;
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  function patch(next: Partial<FormValues>) {
    setValues((prev) => ({ ...prev, ...next }));
    setSuccess(false);
  }

  function reset() {
    const fresh = locked ? stageSnapshot(lesson, locked) : null;
    setValues(fresh?.values ?? { ...EMPTY_VALUES });
    setTouched(fresh?.touched ?? { ...EMPTY_TOUCHED });
    setSubmitted(fresh?.submitted ?? false);
    setSuccess(false);
    setTypeOpen(false);
    setDateOpen(false);
    setMonth(yearMonth(today));
  }

  function handleSubmit() {
    if (lesson === "submit") setSubmitted(true);
    if (isFormReady(values, today)) {
      setSuccess(true);
      return;
    }
    const el = formRef.current;
    if (!el) return;
    el.classList.remove("form-shake");
    void el.offsetWidth;
    el.classList.add("form-shake");
  }

  if (success) {
    return (
      <div className="form-success flex min-h-72 flex-col items-center justify-center px-2 py-8 text-center">
        <span className="form-success-item grid size-12 place-items-center rounded-full bg-intent-soft text-intent">
          <Check className="size-6" strokeWidth={2.5} />
        </span>
        <h3 className="form-success-item mt-4 text-[1.2rem] font-semibold">
          {pick({ zh: "活动已发布", en: "Activity published" }, locale)}
        </h3>
        <div className="form-success-item mt-4 w-full max-w-xs text-left">
          <p className="text-[10px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
            {pick({ zh: "发生了什么", en: "What happened" }, locale)}
          </p>
          <p className="mt-1 text-[13px] text-fg-muted">
            {values.name}
            <span className="mx-1.5 text-fg-subtle">·</span>
            {typeMeta ? pick(typeMeta.label, locale) : values.type}
            <span className="mx-1.5 text-fg-subtle">·</span>
            {values.date}
          </p>
        </div>
        <div className="form-success-item mt-5">
          <p className="mb-2 text-[10px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
            {pick({ zh: "下一步", en: "Next step" }, locale)}
          </p>
          <button
            type="button"
            onClick={reset}
            className="h-11 rounded-full bg-fg px-5 text-[13px] font-medium text-surface"
          >
            {pick({ zh: "再配一场", en: "Configure another" }, locale)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      noValidate
      data-field="form"
      className="min-w-0"
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <header className="mb-5">
        <h2 className="text-[1.15rem] font-semibold tracking-tight">
          {pick({ zh: "配置活动", en: "Configure activity" }, locale)}
        </h2>
        <p className="mt-1 text-[13px] text-fg-muted">
          {pick({ zh: "设置活动信息与发布条件", en: "Name, type, date, then publish" }, locale)}
        </p>
      </header>

      <div aria-live="polite" className="sr-only">
        {Object.values(errors)
          .map((code) => pick(ERROR_COPY[code], locale))
          .join("，")}
      </div>

      <div className="grid min-w-0 gap-4">
        <div className="min-w-0">
          <FieldLabel
            htmlFor={nameId}
            required
            extra={
              lesson === "blur" ? (
                <span
                  className={cn(
                    "font-mono text-[11px] tabular-nums",
                    errors.name
                      ? "text-wrong"
                      : nameLen >= 4
                        ? "text-intent"
                        : "text-fg-subtle",
                  )}
                >
                  {nameLen} / 4
                </span>
              ) : null
            }
          >
            {pick({ zh: "活动名称", en: "Activity name" }, locale)}
          </FieldLabel>
          <input
            id={nameId}
            name="name"
            data-field="name"
            autoComplete="off"
            spellCheck={false}
            placeholder={pick({ zh: "请输入活动名称", en: "Activity name" }, locale)}
            value={values.name}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${nameId}-error` : undefined}
            data-invalid={errors.name ? "true" : "false"}
            data-highlight={lesson === "blur" ? "true" : "false"}
            className={cn(
              fieldTone(Boolean(errors.name)),
              lesson === "blur" && !errors.name && "ring-2 ring-accent/25",
            )}
            onChange={(event) => patch({ name: event.target.value })}
            onFocus={() => {
              if (typeOpen) mark("type");
              if (dateOpen) mark("date");
              setTypeOpen(false);
              setDateOpen(false);
            }}
            onBlur={() => mark("name")}
          />
          {errors.name ? (
            <FieldError
              id={`${nameId}-error`}
              delay={delayFor("name")}
              text={pick(ERROR_COPY[errors.name], locale)}
            />
          ) : lesson === "blur" && !touched.name ? (
            <p className="mt-2 text-[12px] text-fg-subtle">
              {pick({ zh: "还在打字 · 离开这一格才说", en: "Still typing · speaks after leave" }, locale)}
            </p>
          ) : null}
        </div>

        <div className="min-w-0">
          <FieldLabel htmlFor={typeId} required>
            {pick({ zh: "活动类型", en: "Activity type" }, locale)}
          </FieldLabel>
          <button
            id={typeId}
            type="button"
            aria-expanded={typeOpen}
            aria-haspopup="listbox"
            aria-invalid={Boolean(errors.type)}
            aria-describedby={errors.type ? `${typeId}-error` : undefined}
            data-invalid={errors.type ? "true" : "false"}
            className={cn(
              "flex min-h-11 w-full min-w-0 items-center justify-between gap-2 rounded-lg border px-3 text-left text-[14px] outline-none",
              fieldTone(Boolean(errors.type), typeOpen),
            )}
            onClick={() => {
              if (dateOpen) mark("date");
              setDateOpen(false);
              setTypeOpen((open) => {
                const next = !open;
                if (!next) mark("type");
                return next;
              });
            }}
          >
            <span className={typeMeta ? "truncate text-fg" : "truncate text-fg-subtle"}>
              {typeMeta
                ? pick(typeMeta.label, locale)
                : pick({ zh: "请选择活动类型", en: "Choose a type" }, locale)}
            </span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-fg-muted transition-transform duration-200",
                typeOpen && "rotate-180",
              )}
            />
          </button>
          {typeOpen ? (
            <ul
              role="listbox"
              aria-label={pick({ zh: "活动类型", en: "Activity type" }, locale)}
              className="form-pop mt-1 overflow-hidden rounded-lg border border-border bg-surface"
            >
              {TYPE_OPTIONS.map((option) => {
                const on = values.type === option.value;
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={on}
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-2.5 text-left text-[14px] transition-colors",
                        on ? "bg-accent-soft text-accent" : "hover:bg-surface-2",
                      )}
                      onClick={() => {
                        patch({ type: option.value });
                        setTypeOpen(false);
                        mark("type");
                      }}
                    >
                      {pick(option.label, locale)}
                      {on ? <Check className="size-3.5" strokeWidth={2.5} /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
          {errors.type ? (
            <FieldError
              id={`${typeId}-error`}
              delay={delayFor("type")}
              text={pick(ERROR_COPY[errors.type], locale)}
            />
          ) : null}
        </div>

        <div className="min-w-0">
          <FieldLabel htmlFor={dateId} required>
            {pick({ zh: "活动时间", en: "Activity date" }, locale)}
          </FieldLabel>
          <button
            id={dateId}
            type="button"
            data-field="date"
            aria-expanded={dateOpen}
            aria-invalid={Boolean(errors.date)}
            aria-describedby={errors.date ? `${dateId}-error` : undefined}
            data-invalid={errors.date ? "true" : "false"}
            data-highlight={lesson === "inline" ? "true" : "false"}
            className={cn(
              "flex min-h-11 w-full min-w-0 items-center justify-between gap-2 rounded-lg border px-3 text-left text-[14px] outline-none",
              fieldTone(Boolean(errors.date), dateOpen),
              lesson === "inline" && !errors.date && "ring-2 ring-accent/25",
            )}
            onClick={() => {
              if (typeOpen) mark("type");
              setTypeOpen(false);
              setDateOpen((open) => {
                const next = !open;
                if (!next) mark("date");
                return next;
              });
            }}
          >
            <span className={values.date ? "truncate tabular-nums text-fg" : "truncate text-fg-subtle"}>
              {values.date || pick({ zh: "请选择活动日期", en: "Choose a date" }, locale)}
            </span>
            <CalendarDays className="size-4 shrink-0 text-fg-muted" />
          </button>
          {dateOpen ? (
            <div className="mt-1 min-w-0">
              <Calendar
                locale={locale}
                year={month.y}
                month={month.m}
                selected={values.date}
                today={today}
                onMonthChange={setMonth}
                onPick={(iso) => {
                  patch({ date: iso });
                  setDateOpen(false);
                  mark("date");
                }}
              />
            </div>
          ) : null}
          {errors.date ? (
            <FieldError
              id={`${dateId}-error`}
              delay={delayFor("date")}
              text={pick(ERROR_COPY[errors.date], locale)}
            />
          ) : lesson === "inline" && !touched.date ? (
            <p className="mt-2 text-[12px] text-fg-subtle">
              {pick({ zh: "选完收起 · 这一栏立刻说", en: "Closes · this column speaks at once" }, locale)}
            </p>
          ) : null}
        </div>

        <div className="min-w-0">
          <FieldLabel htmlFor={confirmId} required>
            {pick({ zh: "发布确认", en: "Publish confirm" }, locale)}
          </FieldLabel>
          <label htmlFor={confirmId} className="flex min-h-11 items-center gap-3">
            <button
              id={confirmId}
              type="button"
              role="checkbox"
              aria-checked={values.confirmed}
              aria-invalid={Boolean(errors.confirmed)}
              aria-describedby={errors.confirmed ? `${confirmId}-error` : undefined}
              data-invalid={errors.confirmed ? "true" : "false"}
              className={cn(
                "grid size-4 shrink-0 place-items-center rounded-sm border transition-colors duration-150",
                values.confirmed
                  ? "border-accent bg-accent text-accent-fg"
                  : errors.confirmed
                    ? "border-wrong bg-wrong-soft"
                    : "border-border-strong bg-surface",
              )}
              onClick={() => {
                const next = !values.confirmed;
                patch({ confirmed: next });
                mark("confirmed");
              }}
            >
              {values.confirmed ? <Check className="size-3" strokeWidth={3} /> : null}
            </button>
            <span className="text-[14px] text-fg">
              {pick({ zh: "我已确认活动时间与规则", en: "I confirm the time and rules" }, locale)}
            </span>
          </label>
          {errors.confirmed ? (
            <FieldError
              id={`${confirmId}-error`}
              delay={delayFor("confirmed")}
              text={pick(ERROR_COPY[errors.confirmed], locale)}
            />
          ) : null}
        </div>
      </div>

      <button
        type="button"
        data-field="submit"
        aria-disabled={!ready}
        onClick={handleSubmit}
        data-highlight={lesson === "submit" ? "true" : "false"}
        title={
          ready
            ? pick({ zh: "保存并发布", en: "Save & publish" }, locale)
            : pick(
                { zh: "仍可点击，查看全部未通过项", en: "Still clickable — reveal every miss" },
                locale,
              )
        }
        className={cn(
          "mt-6 h-11 w-full rounded-lg text-[14px] font-medium tracking-wide transition-colors duration-200",
          ready ? "bg-accent text-accent-fg" : "bg-fg-subtle text-surface hover:bg-fg-muted",
          lesson === "submit" && !ready && "ring-2 ring-accent/30 ring-offset-2 ring-offset-surface",
        )}
      >
        {pick({ zh: "保存并发布", en: "Save & publish" }, locale)}
        {!ready && lesson === "submit" ? (
          <span className="ml-2 text-[11px] font-normal opacity-80">
            {pick({ zh: "仍可点", en: "still clickable" }, locale)}
          </span>
        ) : null}
      </button>

      <p
        className={cn(
          "mt-3 min-h-5 text-center text-[12px] leading-5",
          lesson === "submit" && submitted && errorCount > 0 ? "form-err font-medium text-wrong" : "text-fg-muted",
        )}
      >
        {ready
          ? pick({ zh: "三项都过了，可以发布", en: "Every slot passed — ready to publish" }, locale)
          : lesson === "submit" && submitted
            ? pick(
                { zh: `已标出 ${errorCount} 项问题`, en: `${errorCount} misses marked` },
                locale,
              )
            : lesson === "submit"
              ? pick(
                  { zh: "未填完也可以点，看看提交校验怎么标错", en: "Click even when empty — submit names every miss" },
                  locale,
                )
              : lesson === "blur"
                ? pick(
                    { zh: "离开格子才会说。提交这一课才一次标出。", en: "This lesson speaks after leave. Submit is a different timing." },
                    locale,
                  )
                : pick(
                    { zh: "选到非法值，收起后立刻在这一栏说。", en: "An illegal pick is named under that column as it closes." },
                    locale,
                  )}
      </p>
    </form>
  );
}

function FieldError({
  id,
  text,
  delay,
}: {
  id: string;
  text: string;
  delay: string;
}) {
  return (
    <p
      id={id}
      className="form-err mt-2 flex items-start gap-1.5 text-[13px] text-wrong"
      role="alert"
      style={{ animationDelay: delay }}
    >
      <CircleAlert className="mt-0.5 size-3.5 shrink-0" strokeWidth={2.2} aria-hidden="true" />
      <span>{text}</span>
    </p>
  );
}
