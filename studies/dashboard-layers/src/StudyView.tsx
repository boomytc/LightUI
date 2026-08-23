import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./board/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "Does the board drill from the result, or serve everything on one platter?"
              : "看板从结果往下钻，还是一盘端上来？"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "KPI, chart, and table on open is a scan. A drill waits: click a result, then the dimension, then a short detail."
              : "一打开就铺满 KPI、图、表，那是扫一眼。层递要等：点一个结果，才展开维度，再给短明细。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Drilling is not switching the mark. Layers are not a dashboard skin. The two leaves below are live."
            : "下钻不是换图种。层递不是仪表盘皮。下面两片叶子可以点。"}
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
                {locale === "en" ? "1. Drilling is not switching the mark" : "1. 下钻不是换图种"}
              </span>
              <br />
              {locale === "en"
                ? "The mark answers what this data is for seeing. A drill changes grain: the same metric, from KPI to dimension to detail."
                : "图种回答这组数据要看什么。下钻换的是粒度：同一指标，从 KPI 到维度到明细。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. Layers are not a dashboard skin" : "2. 层递不是仪表盘皮"}
              </span>
              <br />
              {locale === "en"
                ? "KPI + chart + table is how a page is laid out. Whether the next layer waits for a click is a different question."
                : "KPI + 图 + 表是一页怎么铺。是不是点了才展开下一层，是另一问。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en"
                  ? "3. Stacked sections you scroll are still a platter"
                  : "3. 叠着往下滚，还是一盘端上来"}
              </span>
              <br />
              {locale === "en"
                ? "If every table is already there, scrolling is not drilling. Click a result, then the next layer."
                : "表已经在场，往下滚不是下钻。点一个结果，才展开下一层。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            layerOf
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function layerOf(view, selection) {
  if (showsAll(view)) return "detail"
  if (selection.dim) return "detail"
  if (selection.kpi) return "dim"
  return "kpi"
}

showsAll("platter")   // true
canExpand("layered")  // true`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "A platter is already at the last layer. Layered walks kpi → dim → detail."
              : "一盘端已经在最后一层。层递走 kpi → dim → detail。"}
          </p>
        </article>
      </section>
    </div>
  );
}
