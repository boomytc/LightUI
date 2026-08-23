import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./layouts/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div className="page-width min-w-0 overflow-x-hidden pb-20">
      <section className="grid gap-8 pb-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-fg sm:text-[2.6rem]">
            {locale === "en"
              ? "They all have blocks. They are not the same skeleton."
              : "看起来都有块，骨架却完全不同。"}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "“Make a page” describes the skin. The thing that breaks is the skeleton: a reading column, landing bands, uneven masonry, one full-bleed shot, two panes, a KPI grid, or one-idea cards."
              : "「做个页面」说的是外观。真正会坏掉的是骨架：单栏、落地、瀑布、全屏、分栏、仪表盘，还是模块拼贴。"}
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Name the skeleton, name the scene, then name the rule. The seven contrasts below are live."
            : "先说骨架，再说场景，再说规则。下面七个对照可以点。"}
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
                {locale === "en" ? "1. The page skeleton is not a sidebar" : "1. 整页骨架不是侧栏占位"}
              </span>
              <br />
              {locale === "en"
                ? "The skeleton is how this page is laid out. Whether a left rail occupies space is a sidebar question."
                : "骨架回答这一页怎么铺。靠左那一栏占不占位，是侧栏。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. Column layout is not where the top bar goes" : "2. 栏怎么铺不是顶栏去哪"}
              </span>
              <br />
              {locale === "en"
                ? "Where the top bar lives, and how it opens, is nav. This study is the page under it."
                : "顶栏住在哪、怎么开，是导航。这一则是它下面那一页。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en"
                  ? "3. Masonry is not a carousel; a splitter is not a drawer"
                  : "3. 瀑布不是轮播，分栏不是浮层抽屉"}
              </span>
              <br />
              {locale === "en"
                ? "Masonry drops uneven cards down a column. A carousel swaps the view. A splitter keeps two work panes in flow; a drawer covers the task. Filling the viewport is not what the first glance answers."
                : "瀑布让不等高卡片按列往下接。轮播会切走整块。分栏两格都在干活；抽屉盖在任务上。一屏占满也不是第一眼要确认哪件事。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            readingMeasurePx
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function readingMeasurePx(kind) {
  return kind === "single" ? 672 : null
}

function splitPanes(kind) {
  if (kind === "splitter") return 2
  if (kind === "masonry"
    || kind === "dashboard"
    || kind === "modular") return "grid"
  return 1
}`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "Only single column has a reading measure. Full-screen is the only full-bleed shot. Masonry is the only uneven-height leaf."
              : "只有单栏有阅读行宽。全屏才是铺满视口。只有瀑布允许不等高。"}
          </p>
        </article>
      </section>
    </div>
  );
}
