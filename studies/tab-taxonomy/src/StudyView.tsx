import { FORMULA } from "./lib/kinds";
import { pick, useLocale } from "./lib/site-locale";
import { Playground } from "./tabs/Playground";

export function StudyView() {
  const locale = useLocale();

  return (
    <div data-study-page="" className="page-width min-w-0 pb-20">
      <section className="flex flex-wrap items-end justify-between gap-6 pb-6 pt-5">
        <div className="min-w-0 max-w-2xl">
          <h1 className="text-[1.55rem] font-semibold leading-[1.2] tracking-tight text-fg sm:text-[2.1rem]">
            {locale === "en" ? "The selected tab is the page." : "页签选中态就是这一页。"}
          </h1>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-fg-muted">
            {locale === "en"
              ? "A tab row lives on a panel, not in a phone stamp. Name the selection model — bar, joined card, three-state steps, pill, stacked paper, or the thumbnail — then let the body take the leftover height."
              : "页签长在一块面板上，不是 390 的图章。先定选中态：短线、连上面板、步骤三态、轨道滑块、叠纸，还是缩略图本身。面板身子吃掉剩下的高度。"}
          </p>
        </div>
        <p className="max-w-xs text-[13px] leading-relaxed text-fg-subtle">
          {locale === "en"
            ? "Kinds as chips. The model spans the panel. Six contrasts below are live."
            : "种类是顶上的芯片。模型横跨整块面板。下面六个对照可以点。"}
        </p>
      </section>

      <Playground />

      <section className="mt-12 grid gap-3 sm:grid-cols-3">
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

      <section className="mt-14 grid min-w-0 gap-10 lg:grid-cols-2">
        <article className="min-w-0">
          <h2 className="text-[1.35rem] font-semibold tracking-tight">
            {locale === "en" ? "How to tell them apart" : "怎么把它们分开"}
          </h2>
          <ol className="mt-5 space-y-4 text-[14px] leading-relaxed text-fg-muted">
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "1. Linear is not segmented" : "1. 线性不是分段"}
              </span>
              <br />
              {locale === "en"
                ? "Linear is sibling sections; the bar measures the text span. Segmented is a slice of one dataset; the pill measures the whole item."
                : "线性是同级栏目，短线量的是文字 span。分段是同一份数据的切片，滑块量的是整项。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "2. Card is not folder" : "2. 卡片不是文件夹"}
              </span>
              <br />
              {locale === "en"
                ? "Card drops the bottom edge and joins the panel. Folder is stacked, beveled paper; the current tab sits on top."
                : "卡片去掉底边，和面板连成一块。文件夹是斜切叠纸，选中项压在最上层。"}
            </li>
            <li>
              <span className="font-medium text-fg">
                {locale === "en" ? "3. Chevron is not sibling tabs" : "3. 鱼骨不是平级页签"}
              </span>
              <br />
              {locale === "en"
                ? "Done means before the step you are on. Four sibling sections should not bite with arrows."
                : "完成态是「在当前之前」。四个同级栏目不该用箭头咬合。"}
            </li>
          </ol>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-fg px-5 py-5 text-surface shadow-card sm:px-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-surface/45">
            textIndicator
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-surface/85">
{`function textIndicator(listLeft, textLeft, textWidth) {
  return { left: textLeft - listLeft, width: textWidth }
}

function indicatorTransition(prev) {
  if (!prev || prev.width <= 0) return "none"
  return "left, width"
}`}
          </pre>
          <p className="mt-4 text-[13px] leading-relaxed text-surface/55">
            {locale === "en"
              ? "The bar is the text span, not the equal-width cell. Skip the first measure so it does not slide in from 0. Segmented is the opposite grain: the pill is the whole item."
              : "短线量的是文字 span，不是等宽格子。首次测量关掉过渡，避免从 0 滑入。分段控件相反：滑块量的是整项。"}
          </p>
        </article>
      </section>
    </div>
  );
}
