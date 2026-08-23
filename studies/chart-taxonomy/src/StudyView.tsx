import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./charts/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "“Make a chart” only says there are numbers. First ask what this data is for seeing."
              : "「做个图表」只说了有数。先问这组数据要看什么。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "A pie of months, a column of city names, a line across unordered categories — the mark is doing the wrong job. Pick the intent, then the mark."
              : "月份切成饼、城市名竖着挤、无序类别被折线硬连——痕迹在干错活。先定意图，再选痕迹。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Change, size, share, relation, flow, or ability. The six questions below are live."
            : "看变化、比大小、占比、关系、流程还是能力。下面六个问题可以点。"}
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
                {locale === "en"
                  ? "1. Picking a mark is not dashboard drill-down"
                  : "1. 选对图不是看板下钻"}
              </span>
              <br />
              {locale === "en"
                ? "First decide what this data is for seeing. Clicking into a finer grain is a later question."
                : "先定这组数据要看什么。一层层点进去、换粒度，是另一则。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. Do not pie a time trend" : "2. 时间趋势不要用饼"}
              </span>
              <br />
              {locale === "en"
                ? "A pie has no left-to-right. Months are time, not share."
                : "饼没有从左到右。月份是时间，不是份额。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. Do not stand long names up as columns" : "3. 长名字不要竖柱"}
              </span>
              <br />
              {locale === "en"
                ? "They crowd and rotate 45°. Rankings and full names use bars, written across."
                : "名字会挤、会转 45°。排名或全称用横条，文字横着写全。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            markFor
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function markFor(intent, followup) {
  if (intent === "change")
    return followup === "alt" ? "area" : "line"
  if (intent === "compare")
    return followup === "alt" ? "bar" : "column"
}

tooManyForPie(n)  // n > 5
axisFromZero("column")  // true`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Only “change” may join with a line. A column cropped above 0 exaggerates the gap. Five pie slices is the cap."
              : "只有「看变化」才用折线硬连。柱轴不从 0 起会夸大差距。饼最多五片。"}
          </p>
        </article>
      </section>
    </div>
  );
}
