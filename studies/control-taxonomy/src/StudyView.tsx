import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./fields/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "They all look like inputs. They are not the same machine."
              : "看起来都是输入框，机器却完全不同。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Make an input” describes the skin. The thing that breaks is fill versus pick: one line, a paragraph, a short list, options compared in view, or type-to-find."
              : "「做个输入框」说的是外观。真正会坏掉的是填还是选：一行、一段、短列表、可见比较，还是边搜边选。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Ask fill or pick first. The tree on the left is live; the six leaves on the right can be jumped."
            : "先问是填还是选。左边的判断树可以走，右边六种叶子也可以直接点。"}
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
                {locale === "en" ? "1. A text field is not a textarea" : "1. 单行不是多行"}
              </span>
              <br />
              {locale === "en"
                ? "Name and email are one line. A brief is a block with a count."
                : "姓名、邮箱是一行。需求描述是一段，占满一栏，带字数。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. Visible radios are not a dropdown" : "2. 可见单选不是下拉"}
              </span>
              <br />
              {locale === "en"
                ? "Two to five options have to be seen together to compare. Hide them only when the list is longer."
                : "2–5 项要同时看见才能比较。选项一多再收到面板里。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. Searchable is not a short list" : "3. 可搜索不是固定列表"}
              </span>
              <br />
              {locale === "en"
                ? "Hundreds of items need typing first. Five cities should not force a query. Stacking is checkbox; rival tiers are radios."
                : "上百项要先打字。五个城市不该先强迫搜索。可叠的是复选，互斥档位才是单选组。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            chooseControl
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function chooseControl(a) {
  if (a.demand === "fill")
    return a.length === "long" ? "textarea" : "text-field"
  if (a.cardinality === "many") return "checkbox"
  if (a.find === "compare") return "radio"
  if (a.find === "search") return "combobox"
  return "select"
}`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Ask fill or pick first. Length splits the text box. Many stacks. One value then splits by compare / scan / search."
              : "先问填还是选。长短拆开文本框。多个就叠。一个再按比较 / 扫列表 / 搜索拆。"}
          </p>
        </article>
      </section>
    </div>
  );
}
