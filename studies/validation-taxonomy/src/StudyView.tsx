import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./form/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "They all show an error. They do not speak at the same time."
              : "看起来都是报错，时机却完全不同。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Add form validation” describes the result. The thing that breaks is when it speaks: after the field is left, under that column as a bad pick closes, or every miss at once on submit."
              : "「做个表单校验」说的是结果。真正会坏掉的是开口时机：离开这一格、这一栏选完立刻说，还是提交时一次说完。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Name the timing, name the scene, then name when the copy appears. The three contrasts below are live."
            : "先说时机，再说场景，再说错误何时出现。下面三个对照可以点。"}
        </p>
      </section>

      <section className="mb-10 grid gap-3 sm:grid-cols-3">
        {FORMULA.map((item) => (
          <div key={item.n} className="rounded-2xl border border-border bg-surface px-4 py-4 shadow-card">
            <span className="inline-grid size-6 place-items-center rounded-md bg-fg text-[11px] font-semibold text-surface">
              {item.n}
            </span>
            <h2 className="mt-3 text-[15px] font-semibold">{pick(item.title, locale)}</h2>
            <p className="mt-1 text-[13px] text-fg-muted">{pick(item.example, locale)}</p>
          </div>
        ))}
      </section>

      <Playground />

      <section className="mt-14 grid min-w-0 gap-10 lg:grid-cols-2">
        <article className="min-w-0">
          <h2 className="text-[1.35rem] font-semibold tracking-tight">
            {locale === "en" ? "How to tell them apart" : "怎么把它们分开"}
          </h2>
          <ol className="mt-5 space-y-4 text-[14px] leading-relaxed text-fg-muted">
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "1. When to speak is not fill versus pick" : "1. 何时报错不是填还是选"}
              </span>
              <br />
              {locale === "en"
                ? "One line or a paragraph, radios or a short list — that is the field’s machine. This study asks when the error opens its mouth."
                : "一行或一段、可见单选或短列表，是格子的机型。这一则问的是错误何时开口。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. An inline miss is not a toast" : "2. 行内报错不是一条 toast"}
              </span>
              <br />
              {locale === "en"
                ? "The copy sits under that column and stays with the field. A notice bar does not name the slot."
                : "错误写在这一栏下面，跟着字段走。通知条不指是哪一格。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. Marking every miss is not a confirm modal" : "3. 提交一次标出不是 modal 确认"}
              </span>
              <br />
              {locale === "en"
                ? "After publish, the misses still sit under the fields. A grey-looking button still receives the click."
                : "点发布后，未通过项仍在字段下。看起来置灰的按钮也要收得到点击。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            shownByLesson
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function shownByLesson(lesson, ctx) {
  const all = validateAll(ctx.values)
  if (lesson === "submit")
    return ctx.submitted ? all : {}
  const shown = {}
  for (const key of FIELD_KEYS) {
    if (ctx.touched[key] && all[key])
      shown[key] = all[key]
  }
  return shown
}`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Blur and inline key off touched. Submit waits for the flag — including a click on an idle-looking button. Dates compare as ISO strings."
              : "失焦和行内看 touched。提交看 submitted 旗标，置灰按钮也能点。日期用 ISO 字符串比较。"}
          </p>
        </article>
      </section>
    </div>
  );
}
