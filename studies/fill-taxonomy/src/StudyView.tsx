import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./fill/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 pb-20">
      <section className="grid gap-8 pt-4 pb-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pt-8 lg:pb-12">
        <div className="min-w-0">
          <h1 className="text-[2rem] leading-[1.15] font-semibold tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "They all have boxes. They do not disclose the same things."
              : "看起来都是一列表单，三个时刻交代的却完全不同。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Make a form” describes the look. What breaks is silence at the wrong moment: a vanished placeholder, required named only on submit, a banner that points at no field, or “Success” with no next step."
              : "「做个表单」说的是外观。真正会坏掉的是该开口时沉默：占位符没了、必填到提交才说、页顶一句失败对不上栏，或只剩「成功」两个字。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Name the moment first. Duties sit under before / during / after. The contrasts below are live."
            : "先说时刻。职责按填写前、填写中、提交后分组。下面的对照可以点。"}
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
                {locale === "en" ? "1. What to disclose is not fill versus pick" : "1. 交代什么不是填还是选"}
              </span>
              <br />
              {locale === "en"
                ? "One line or a paragraph, radios or a short list — that is the field’s machine. This study asks what the three moments say."
                : "一行或一段、可见单选或短列表，是格子的机型。这一则问的是三个时刻各自说什么。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. A field-level fix is not when the error speaks" : "2. 当场能改不是错误何时开口"}
              </span>
              <br />
              {locale === "en"
                ? "Copy sits under that column and names both the miss and the fix. Blur, inline, and submit are another question."
                : "文案写在这一栏下，同时说哪里错和该怎么改。失焦、行内、提交，是另一问。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. A completed submit is not a toast" : "3. 提交成功不是一条 toast"}
              </span>
              <br />
              {locale === "en"
                ? "The result names what happened and a next step. A notice bar speaks once and leaves this form behind."
                : "结果页写清发生了什么和下一步。通知条报一声就走，对不上这一张表。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium tracking-[0.12em] text-surface/45 uppercase">
            shownCopy
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function shownCopy({ helper, error, ok }) {
  if (error) return "error"
  if (ok) return "ok"
  if (helper) return "helper"
  return "none"
}`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Helper and error never stack. A placeholder is never a label. Success needs both what happened and a next step."
              : "说明和错误不叠行。占位符绝不当标签。成功要同时有发生了什么和下一步。"}
          </p>
        </article>
      </section>
    </div>
  );
}
