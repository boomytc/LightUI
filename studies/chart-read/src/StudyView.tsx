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
              ? "Is this gesture on the chart a readout, a filter, or a window change?"
              : "图上这一手是读数、过滤，还是改窗口？"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "The drawing is done. This click still has a job: read a point, hide a series, freeze a range, slice the window, or push a path. Picking the mark is a different question."
              : "图画好了。这一手还要先定：读一个点、藏一条线、冻一段区间、切窗口，还是推进路径。选图种是另一问。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Seven gestures, five classes. The chips below are live — SVG and pointer math, no chart library."
            : "七种手势，五种类。下面可以点：SVG 和指针算术，没有图表库。"}
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
                {locale === "en" ? "1. A legend is filter state, not decoration" : "1. 图例是过滤态不是装饰"}
              </span>
              <br />
              {locale === "en"
                ? "A click changes which series are on. The last visible series cannot hide, or the plot is empty."
                : "点图例改的是哪些线在场。最后一条可见系列不能藏，否则图上什么都没有。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en"
                  ? "2. Drilling a path is not switching the mark"
                  : "2. 下钻换路径不是换图种"}
              </span>
              <br />
              {locale === "en"
                ? "The mark answers what the data is for seeing. A bar click pushes channel → category → page on the same chart."
                : "图种回答这组数据要看什么。点柱推进的是同一张图上的 渠道→分类→页面。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en"
                  ? "3. A frozen brush is not a zoom window"
                  : "3. 框选冻结不是缩放窗口"}
              </span>
              <br />
              {locale === "en"
                ? "The brush leaves a range and its avg/peak; the axis stays. Zoom is the [start, end] slice around the cursor."
                : "框选留下一段、算出均值峰值，轴还在原来的窗。缩放才改绕光标的 [start,end]。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            gestureClass
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function gestureClass(kind) {
  if (kind === "legend") return "filter"
  if (kind === "brush") return "range"
  if (kind === "zoom") return "window"
  if (kind === "drill") return "path"
  return "read"
}

legendToggle(hidden, id, allIds)
// cannot hide the last visible series`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Crosshair, highlight, tooltip read a point. Nearest index is a readout snap, not gaze landing on a cell."
              : "十字线、高亮、读数卡都是读点。最近邻吸附是读点，不是视线落到格子。"}
          </p>
        </article>
      </section>
    </div>
  );
}
