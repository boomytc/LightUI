import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./pickers/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pt-4 pb-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pt-8 lg:pb-12">
        <div className="min-w-0">
          <h1 className="text-[2rem] leading-[1.15] font-semibold tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "Is this pick one tick, a two-end span, a stepped count, a path, or a date range?"
              : "这一次是选一个刻度、一段区间、按步加减、逐级路径，还是一段日期？"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Make a picker” describes the skin. What breaks is the same machine for different picks: a ruler snaps one tick, a range keeps two ends apart, a stepper stops at the floor, a cascade clears children when the parent changes, a date range ends after it starts."
              : "「做个选择器」说的是外观。真正会坏掉的是选的东西不同、却用同一种机器：尺子松手对齐，双端不交叉，下限禁用，换上级清空下级，止晚于起。"}
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {(locale === "en"
              ? [
                  "Ruler · one tick",
                  "Range · two ends",
                  "Stepper · stop at 1",
                  "Cascader · clear children",
                  "Dates · end after start",
                ]
              : [
                  "滑动标尺 · 一个刻度",
                  "范围滑块 · 两个端点",
                  "步进器 · 减到 1 停",
                  "级联 · 换上级清空",
                  "日期范围 · 止晚于起",
                ]
            ).map((item) => (
              <li
                key={item}
                className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-fg-muted"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Name what is being picked first. The five leaves below are live. A ruler is not a range. A stepper is not a ruler."
            : "先说选什么。下面五片叶子可以点。尺子不是范围滑块。步进器不是尺子。"}
        </p>
      </section>

      <Playground />

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        {FORMULA.map((item) => (
          <div key={item.n} className="flex gap-3 rounded-xl border border-border bg-surface px-3 py-3">
            <span className="inline-grid size-5 shrink-0 place-items-center rounded-md bg-fg text-[10px] font-semibold text-surface">
              {item.n}
            </span>
            <div className="min-w-0">
              <h2 className="text-[13px] font-semibold">{pick(item.title, locale)}</h2>
              <p className="mt-0.5 text-[12px] text-fg-muted">{pick(item.example, locale)}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-14 grid min-w-0 gap-10 lg:grid-cols-2">
        <article className="min-w-0">
          <h2 className="text-[1.35rem] font-semibold tracking-tight">
            {locale === "en" ? "How to tell them apart" : "怎么把它们分开"}
          </h2>
          <ol className="mt-5 space-y-4 text-[14px] leading-relaxed text-fg-muted">
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "1. A ruler is not a range" : "1. 尺子不是范围滑块"}
              </span>
              <br />
              {locale === "en"
                ? "One value against one pointer. Two thumbs are a span. Weight is not two dots."
                : "一个值对一根指针。两个端点才是区间。体重不要做成两个圆点。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. A stepper is not a ruler" : "2. 步进器不是尺子"}
              </span>
              <br />
              {locale === "en"
                ? "A small count, one at a time. Minus stops at 1. Do not slide 0.1 to reach 2."
                : "份数很少、每次 1 个。减到 1 减号停。不要滑 0.1 才能到 2。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en"
                  ? "3. A path and a date span are not two boxes"
                  : "3. 路径和日期段不是两个框"}
              </span>
              <br />
              {locale === "en"
                ? "Change the province and the children must be picked again. Highlight the nights so the end stays after the start."
                : "换了省，市和区都要重选。高亮中间那几天，离店才能晚于入住。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium tracking-[0.12em] text-surface/45 uppercase">
            choosePicker
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`one-tick   → ruler
two-ends   → range
few-steps  → stepper
tree-path  → cascader
date-span  → dates

snapRuler · thumbs keep a gap
stepQty stops at the floor
changing a parent drops children
checkout after check-in`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "A ruler is not a range. A sequential path is not a downward column. A horizontal ruler is not a wheel."
              : "尺子不是范围滑块。逐级路径不是往下展开的列。横向尺子不是滚轮。"}
          </p>
        </article>
      </section>
    </div>
  );
}
